import { NextResponse } from 'next/server';

export async function GET() {
  // Trả về dữ liệu mẫu (Mock data) cho Dashboard
  const dashboardData = {
    shift: {
      name: "Ca Sáng (HC-01)",
      progress: 55, // 55%
      startTime: "08:00 AM",
      expectedEndTime: "17:00 PM"
    },
    leaveBalance: {
      total: 15,
      used: 2.5,
      remaining: 12.5
    },
    attendanceHistory: [
      { id: 1, date: "Hôm nay, 24/02", shift: "Sáng (HC-01)", checkIn: "08:02 AM", checkOut: "--:--", totalHours: "4.5h", status: "Bình thường", statusType: "normal" },
      { id: 2, date: "Chủ Nhật, 23/02", shift: "--", checkIn: "--", checkOut: "--", totalHours: "0.0h", status: "Ngày nghỉ", statusType: "off" },
      { id: 3, date: "Thứ Bảy, 22/02", shift: "Sáng (HC-01)", checkIn: "08:15 AM", checkOut: "12:00 PM", totalHours: "4.0h", status: "Đi muộn", statusType: "late" },
      { id: 4, date: "Thứ Sáu, 21/02", shift: "Full-time", checkIn: "07:55 AM", checkOut: "17:05 PM", totalHours: "8.5h", status: "Đúng giờ", statusType: "normal" },
      { id: 5, date: "Thứ Năm, 20/02", shift: "Full-time", checkIn: "08:00 AM", checkOut: "17:30 PM", totalHours: "9.0h", status: "Đúng giờ", statusType: "normal" },
      { id: 6, date: "Thứ Tư, 19/02", shift: "Nghỉ phép", checkIn: "--", checkOut: "--", totalHours: "0.0h", status: "Phép năm", statusType: "leave" }
    ]
  };

  return NextResponse.json(dashboardData, { status: 200 });
}
