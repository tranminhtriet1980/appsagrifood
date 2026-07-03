// ============================================================
// Cấu hình & tiện ích cho nghiệp vụ Chấm công
// ============================================================

// Giờ làm việc chuẩn: 08:00 -> 17:00 (giờ Việt Nam UTC+7)
export const WORK_START_HOUR = 8; // 08:00
export const WORK_START_MIN = 0;
export const WORK_END_HOUR = 17; // 17:00
export const WORK_END_MIN = 0;

// Số phút "ân hạn" cho phép trễ mà chưa tính là đi muộn
export const LATE_GRACE_MINUTES = 5;

// Ngưỡng so khớp khuôn mặt (euclidean distance của face descriptor).
// <= ngưỡng này coi như CÙNG một người. face-api.js khuyến nghị ~0.5-0.6.
export const FACE_MATCH_THRESHOLD = 0.5;

// ------------------------------------------------------------
// Khoảng cách GPS giữa 2 toạ độ (công thức Haversine), trả về mét
// ------------------------------------------------------------
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // bán kính Trái Đất (mét)
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // mét
}

// ------------------------------------------------------------
// Đổi 1 mốc thời gian sang các thành phần theo giờ VN (UTC+7)
// ------------------------------------------------------------
export function toVNParts(date: Date) {
  const utc7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return {
    dateStr: utc7.toISOString().split('T')[0], // YYYY-MM-DD (theo giờ VN)
    hour: utc7.getUTCHours(),
    minute: utc7.getUTCMinutes(),
    // tổng số phút kể từ 00:00 (giờ VN)
    minutesOfDay: utc7.getUTCHours() * 60 + utc7.getUTCMinutes(),
  };
}

// Số phút kể từ 00:00 của mốc giờ vào ca / tan ca
export const WORK_START_MINUTES = WORK_START_HOUR * 60 + WORK_START_MIN;
export const WORK_END_MINUTES = WORK_END_HOUR * 60 + WORK_END_MIN;

// ------------------------------------------------------------
// Tính số phút đi muộn khi CHECK-IN (so với 08:00 + ân hạn)
// ------------------------------------------------------------
export function calcLateMinutes(checkInTime: Date): number {
  const { minutesOfDay } = toVNParts(checkInTime);
  const late = minutesOfDay - (WORK_START_MINUTES + LATE_GRACE_MINUTES);
  return late > 0 ? late : 0;
}

// ------------------------------------------------------------
// Tính số phút về sớm khi CHECK-OUT (so với 17:00)
// ------------------------------------------------------------
export function calcEarlyMinutes(checkOutTime: Date): number {
  const { minutesOfDay } = toVNParts(checkOutTime);
  const early = WORK_END_MINUTES - minutesOfDay;
  return early > 0 ? early : 0;
}

// Chuẩn hoá 1 ngày về đầu ngày (theo giờ VN) để lưu vào cột @db.Date
export function vnWorkDate(date: Date): Date {
  const { dateStr } = toVNParts(date);
  return new Date(`${dateStr}T00:00:00.000Z`);
}

// Định dạng số phút -> "1g30p" cho dễ đọc
export function formatMinutes(mins: number): string {
  if (mins <= 0) return '0p';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}g${m}p`;
  if (h > 0) return `${h}g`;
  return `${m}p`;
}
