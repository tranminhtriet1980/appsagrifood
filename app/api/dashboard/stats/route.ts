import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get('locationId');

  // Lấy danh sách locations cho Dropdown
  const locations = await prisma.location.findMany();

  // Tạo bộ lọc theo chi nhánh (Nếu có locationId thì lọc, không thì đếm toàn bộ)
  const whereLocation = locationId ? { location_id: parseInt(locationId) } : {};

  // Lấy thời gian hôm nay (UTC+7)
  const nowUtc = new Date();
  const utc7Time = new Date(nowUtc.getTime() + 7 * 60 * 60 * 1000);
  const todayStr = utc7Time.toISOString().split('T')[0];
  const today = new Date(`${todayStr}T00:00:00.000Z`);

  // Truy vấn Realtime Data
  const totalStaff = await prisma.user.count({
    where: { role_id: { not: 'admin' }, ...whereLocation }
  });

  const attendancesToday = await prisma.attendance.findMany({
    where: { 
      work_date: today,
      user: whereLocation
    },
    include: { user: true }
  });

  const presentStaff = attendancesToday.length;
  const lateCount = attendancesToday.filter(a => a.status === 'late').length;
  const leaveCount = attendancesToday.filter(a => a.status === 'Nghỉ phép (P)').length;

  const pendingLeaves = await prisma.leaveRequest.count({
    where: { 
      status: 'Pending',
      user: whereLocation
    }
  });

  // Trả về dữ liệu
  const dashboardData = {
    managerStats: {
      totalStaff,
      presentStaff,
      lateCount,
      leaveCount,
      pendingLeaves
    },
    locations,
    shift: {
      name: "Ca Sáng (HC-01)",
      progress: 55,
      startTime: "08:00 AM",
      expectedEndTime: "17:00 PM"
    },
    leaveBalance: {
      total: 15,
      used: 2.5,
      remaining: 12.5
    },
    attendanceHistory: [
      { id: 1, date: "Hôm nay", shift: "Sáng (HC-01)", checkIn: "08:02 AM", checkOut: "--:--", totalHours: "4.5h", status: "Bình thường", statusType: "normal" }
    ]
  };

  return NextResponse.json(dashboardData, { status: 200 });
}
