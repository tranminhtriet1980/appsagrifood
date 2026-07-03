import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Lịch sử chấm công của người đang đăng nhập ("xem công")
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '31'), 100);

  const records = await prisma.attendance.findMany({
    where: { user_id: session.id },
    include: { location: true, shift: true },
    orderBy: { work_date: 'desc' },
    take: limit,
  });

  // Tổng hợp nhanh trong tháng hiện tại
  const now = new Date();
  const monthRecords = records.filter((r) => {
    const d = new Date(r.work_date);
    return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
  });
  const summary = {
    presentDays: monthRecords.filter((r) => r.check_in_actual).length,
    lateDays: monthRecords.filter((r) => r.late_minutes > 0).length,
    earlyLeaveDays: monthRecords.filter((r) => r.early_minutes > 0).length,
    totalLateMinutes: monthRecords.reduce((s, r) => s + r.late_minutes, 0),
  };

  return NextResponse.json({
    summary,
    records: records.map((r) => ({
      id: r.id,
      workDate: r.work_date,
      site: r.location?.name || null,
      shift: r.shift?.shift_name || null,
      checkIn: r.check_in_actual,
      checkOut: r.check_out_actual,
      lateMinutes: r.late_minutes,
      earlyMinutes: r.early_minutes,
      status: r.status,
      distanceIn: r.check_in_distance,
      distanceOut: r.check_out_distance,
    })),
  });
}
