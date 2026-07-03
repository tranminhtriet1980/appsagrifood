import { prisma } from './prisma';
import {
  haversineDistance,
  calcLateMinutes,
  calcEarlyMinutes,
  vnWorkDate,
} from './attendance';

export interface PunchInput {
  userId: number;
  type: 'in' | 'out';
  timestamp: string | Date;
  lat?: number | null;
  lng?: number | null;
  accuracy?: number | null;
  imageBase64?: string | null;
  faceMatchScore?: number | null;
}

export interface PunchResult {
  ok: boolean;
  status: number; // HTTP status gợi ý
  message: string;
  data?: any;
}

function shapeRecord(rec: any, userName: string, siteName: string) {
  return {
    id: rec.id,
    employeeName: userName,
    site: siteName,
    checkIn: rec.check_in_actual,
    checkOut: rec.check_out_actual,
    lateMinutes: rec.late_minutes,
    earlyMinutes: rec.early_minutes,
    status: rec.status,
    distanceIn: rec.check_in_distance,
    distanceOut: rec.check_out_distance,
  };
}

// Lõi ghi nhận 1 lượt chấm công (dùng chung cho check-in realtime & sync offline)
export async function recordPunch(input: PunchInput): Promise<PunchResult> {
  const { userId, type } = input;
  const clientTime = new Date(input.timestamp);
  if (isNaN(clientTime.getTime())) {
    return { ok: false, status: 400, message: 'Thời gian không hợp lệ' };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { location: true },
  });
  if (!user) {
    return { ok: false, status: 404, message: 'Không tìm thấy nhân viên' };
  }

  // ---- Xác định site chấm công ----
  let site = user.location;
  const lat = input.lat ?? null;
  const lng = input.lng ?? null;
  let distance: number | null = null;

  if (lat != null && lng != null) {
    if (!site) {
      // Nhân viên chưa gán site cố định -> tìm site gần nhất
      const all = await prisma.location.findMany();
      let best: { loc: any; d: number } | null = null;
      for (const loc of all) {
        const d = haversineDistance(lat, lng, Number(loc.latitude), Number(loc.longitude));
        if (!best || d < best.d) best = { loc, d };
      }
      if (best) {
        site = best.loc;
        distance = best.d;
      }
    } else {
      distance = haversineDistance(lat, lng, Number(site.latitude), Number(site.longitude));
    }
  }

  if (!site) {
    return {
      ok: false,
      status: 400,
      message: 'Nhân viên chưa được gán site chấm công. Vui lòng liên hệ quản lý.',
    };
  }

  // ---- Kiểm tra bán kính (geofence) ----
  if (distance != null && distance > site.radius) {
    return {
      ok: false,
      status: 403,
      message: `Bạn đang cách "${site.name}" khoảng ${Math.round(distance)}m (chỉ cho phép trong ${site.radius}m). Vui lòng đến đúng địa điểm để chấm công.`,
      data: { distance: Math.round(distance), radius: site.radius, site: site.name, outOfRange: true },
    };
  }

  const workDate = vnWorkDate(clientTime);

  // ---- Xác định ca làm việc trong ngày ----
  let shiftId = 1;
  const schedule = await prisma.employeeSchedule.findUnique({
    where: { user_id_work_date: { user_id: userId, work_date: workDate } },
  });
  if (schedule) shiftId = schedule.shift_id;

  const shiftExists = await prisma.shift.findUnique({ where: { id: shiftId } });
  if (!shiftExists) {
    const anyShift = await prisma.shift.findFirst();
    if (!anyShift) {
      return { ok: false, status: 500, message: 'Hệ thống chưa cấu hình ca làm việc' };
    }
    shiftId = anyShift.id;
  }

  const existing = await prisma.attendance.findFirst({
    where: { user_id: userId, work_date: workDate, shift_id: shiftId },
  });

  const distInt = distance != null ? Math.round(distance) : null;

  // ============ CHECK-IN ============
  if (type === 'in') {
    const late = calcLateMinutes(clientTime);
    const status = late > 0 ? 'late' : 'ontime';

    if (!existing) {
      const rec = await prisma.attendance.create({
        data: {
          user_id: userId,
          shift_id: shiftId,
          work_date: workDate,
          check_in_actual: clientTime,
          status,
          location_id: site.id,
          check_in_lat: lat,
          check_in_lng: lng,
          check_in_distance: distInt,
          late_minutes: late,
          check_in_photo: input.imageBase64 || null,
          face_match_score: input.faceMatchScore ?? null,
        },
      });
      return {
        ok: true,
        status: 200,
        message: late > 0 ? `Check-in thành công (đi trễ ${late} phút)` : 'Check-in đúng giờ ✓',
        data: shapeRecord(rec, user.name, site.name),
      };
    }

    // Đã có bản ghi trong ngày
    const data: any = {};
    if (!existing.check_in_actual || clientTime < existing.check_in_actual) {
      data.check_in_actual = clientTime;
      data.late_minutes = late;
      data.status = status;
      data.location_id = site.id;
      data.check_in_lat = lat;
      data.check_in_lng = lng;
      data.check_in_distance = distInt;
      if (input.imageBase64) data.check_in_photo = input.imageBase64;
      if (input.faceMatchScore != null) data.face_match_score = input.faceMatchScore;
    }
    const rec = Object.keys(data).length
      ? await prisma.attendance.update({ where: { id: existing.id }, data })
      : existing;
    return {
      ok: true,
      status: 200,
      message: 'Đã ghi nhận check-in',
      data: shapeRecord(rec, user.name, site.name),
    };
  }

  // ============ CHECK-OUT ============
  const early = calcEarlyMinutes(clientTime);

  if (!existing) {
    const rec = await prisma.attendance.create({
      data: {
        user_id: userId,
        shift_id: shiftId,
        work_date: workDate,
        check_out_actual: clientTime,
        status: 'ontime',
        location_id: site.id,
        check_out_lat: lat,
        check_out_lng: lng,
        check_out_distance: distInt,
        early_minutes: early,
      },
    });
    return {
      ok: true,
      status: 200,
      message: early > 0 ? `Check-out thành công (về sớm ${early} phút)` : 'Check-out thành công ✓',
      data: shapeRecord(rec, user.name, site.name),
    };
  }

  const rec = await prisma.attendance.update({
    where: { id: existing.id },
    data: {
      check_out_actual: clientTime,
      early_minutes: early,
      check_out_lat: lat,
      check_out_lng: lng,
      check_out_distance: distInt,
    },
  });
  return {
    ok: true,
    status: 200,
    message: early > 0 ? `Check-out thành công (về sớm ${early} phút)` : 'Check-out thành công ✓',
    data: shapeRecord(rec, user.name, site.name),
  };
}
