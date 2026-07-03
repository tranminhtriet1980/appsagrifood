import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { vnWorkDate } from '@/lib/attendance';

const ADMIN_ROLES = ['admin', 'admin_company', 'director'];

const fmtTime = (d: Date | null) =>
  d
    ? new Date(d).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh',
        hour12: false,
      })
    : '--:--';

// Danh sách đội ngũ + trạng thái chấm công HÔM NAY cho quản lý
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const locationFilter = searchParams.get('locationId'); // tùy chọn: lọc theo 1 site

  const me = await prisma.user.findUnique({ where: { id: session.id } });
  const canViewAll = ADMIN_ROLES.includes(session.role);

  // Phạm vi nhân viên: admin/giám đốc xem tất cả; quản lý xem site của mình
  const where: any = { role_id: { notIn: ['admin', 'admin_company'] }, id: { not: session.id } };
  if (locationFilter) {
    where.location_id = parseInt(locationFilter);
  } else if (!canViewAll) {
    where.location_id = me?.location_id ?? -1; // -1 => không có ai nếu quản lý chưa gán site
  }

  const staff = await prisma.user.findMany({
    where,
    include: { location: true },
    orderBy: { name: 'asc' },
  });

  const today = vnWorkDate(new Date());
  const staffIds = staff.map((s) => s.id);

  const todayRecords = await prisma.attendance.findMany({
    where: { user_id: { in: staffIds.length ? staffIds : [-1] }, work_date: today },
  });
  const recByUser = new Map(todayRecords.map((r) => [r.user_id, r]));

  const employees = staff.map((s) => {
    const rec = recByUser.get(s.id);
    let status: 'ontime' | 'late' | 'missing' = 'missing';
    if (rec?.check_in_actual) status = rec.late_minutes > 0 ? 'late' : 'ontime';

    const isWorking = !!rec?.check_in_actual && !rec?.check_out_actual;
    const timeRange = rec?.check_in_actual
      ? `${fmtTime(rec.check_in_actual)} - ${fmtTime(rec.check_out_actual)}`
      : '08:00 - 17:00';

    return {
      id: s.employee_code || String(s.id),
      name: s.name,
      location: s.location?.name || 'Chưa gán site',
      timeRange,
      status,
      avatar: null, // FE hiển thị chữ cái đầu khi không có ảnh
      isOnline: isWorking,
      lateMinutes: rec?.late_minutes ?? 0,
    };
  });

  const stats = {
    total: employees.length,
    checkedIn: employees.filter((e) => e.status !== 'missing').length,
    late: employees.filter((e) => e.status === 'late').length,
    missing: employees.filter((e) => e.status === 'missing').length,
  };

  return NextResponse.json({ employees, stats });
}
