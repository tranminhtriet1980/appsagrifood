import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { records } = body;

    if (!records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Payload không hợp lệ' }, { status: 400 });
    }

    let syncedCount = 0;

    for (const record of records) {
      const { timestamp, userId } = record;
      
      if (!timestamp || !userId) continue;

      const clientTime = new Date(timestamp);
      if (isNaN(clientTime.getTime())) continue;

      const utc7Time = new Date(clientTime.getTime() + 7 * 60 * 60 * 1000);
      const workDateStr = utc7Time.toISOString().split('T')[0];
      const workDate = new Date(`${workDateStr}T00:00:00.000Z`);

      let parsedUserId = parseInt(userId.replace(/\D/g, '')) || 1; 

      let assignedShiftId = 1;
      let shiftStartHour = 8;
      let shiftStartMin = 0;

      const schedule = await prisma.employeeSchedule.findUnique({
        where: {
          user_id_work_date: {
            user_id: parsedUserId,
            work_date: workDate
          }
        },
        include: { shift: true }
      });

      if (schedule) {
        assignedShiftId = schedule.shift_id;
        const shiftStartTime = new Date(schedule.shift.start_time);
        shiftStartHour = shiftStartTime.getUTCHours();
        shiftStartMin = shiftStartTime.getUTCMinutes();
      }

      let currentStatus = 'ontime';
      const clientHour = clientTime.getHours();
      const clientMin = clientTime.getMinutes();
      const isLate = (clientHour > shiftStartHour) || (clientHour === shiftStartHour && clientMin > shiftStartMin + 5);
      
      if (isLate) currentStatus = 'late';

      const existingRecord = await prisma.attendance.findFirst({
        where: {
          user_id: parsedUserId,
          work_date: workDate,
          shift_id: assignedShiftId
        }
      });

      if (!existingRecord) {
        await prisma.attendance.create({
          data: {
            user_id: parsedUserId,
            shift_id: assignedShiftId,
            work_date: workDate,
            check_in_actual: clientTime,
            status: currentStatus
          }
        });
      } else {
        await prisma.attendance.update({
          where: { id: existingRecord.id },
          data: {
            check_out_actual: clientTime
          }
        });
      }
      syncedCount++;
    }

    return NextResponse.json({ success: true, synced: syncedCount });
  } catch (err) {
    console.error('Lỗi Bulk Sync:', err);
    return NextResponse.json({ error: 'Lỗi đồng bộ máy chủ' }, { status: 500 });
  }
}
