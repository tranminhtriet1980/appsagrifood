import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, timestamp, location, type, imageBase64 } = body;

    if (!userId || !timestamp) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    // Yêu cầu 1: Ép múi giờ UTC+7 (Việt Nam)
    const clientTime = new Date(timestamp);
    if (isNaN(clientTime.getTime())) {
      return NextResponse.json({ error: 'Timestamp không hợp lệ' }, { status: 400 });
    }

    // Chuyển đổi clientTime sang mốc thời gian UTC+7 để bóc tách đúng Ngày
    const utc7Time = new Date(clientTime.getTime() + 7 * 60 * 60 * 1000);
    const workDateStr = utc7Time.toISOString().split('T')[0]; // Lấy "YYYY-MM-DD" an toàn theo giờ VN
    const workDate = new Date(`${workDateStr}T00:00:00.000Z`); // Chuẩn hóa về đầu ngày để query Prisma Db.Date

    // Xử lý kiểu dữ liệu userId (Vì FE đang gửi chuỗi như "NV001", ta tạm thời mock ID thành Int để map với Prisma)
    let parsedUserId = parseInt(userId.replace(/\D/g, '')) || 1; 

    // Mặc định ca làm việc (phòng trường hợp không tìm thấy lịch)
    let assignedShiftId = 1;
    let shiftStartHour = 8;
    let shiftStartMin = 0;

    // Truy vấn lịch làm việc đã xếp cho nhân viên trong ngày này
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
      // Trích xuất giờ bắt đầu ca để tính toán đi muộn
      const shiftStartTime = new Date(schedule.shift.start_time);
      shiftStartHour = shiftStartTime.getUTCHours();
      shiftStartMin = shiftStartTime.getUTCMinutes();
    }

    // Tính toán trạng thái Đi muộn (so với giờ bắt đầu ca + 5 phút grace period)
    let currentStatus = 'ontime';
    const clientHour = clientTime.getHours();
    const clientMin = clientTime.getMinutes();
    const isLate = (clientHour > shiftStartHour) || (clientHour === shiftStartHour && clientMin > shiftStartMin + 5);
    
    if (isLate) currentStatus = 'late';

    // Tìm bản ghi chấm công của nhân viên trong ngày và ca làm việc đó
    const existingRecord = await prisma.attendance.findFirst({
      where: {
        user_id: parsedUserId,
        work_date: workDate,
        shift_id: assignedShiftId
      }
    });

    if (!existingRecord) {
      // Lần đầu tính vào (Check-in)
      await prisma.attendance.create({
        data: {
          user_id: parsedUserId,
          shift_id: assignedShiftId,
          work_date: workDate,
          check_in_actual: clientTime,
          status: currentStatus
        }
      });
      return NextResponse.json({ success: true, message: 'Check-in thành công', time: clientTime });
    } else {
      // Đã có bản ghi -> Logic: Lần sau cùng tính ra (hoặc cập nhật lần đầu nếu mốc thời gian sớm hơn)
      let updateData: any = {};
      
      const currentCheckIn = existingRecord.check_in_actual;
      const currentCheckOut = existingRecord.check_out_actual;

      if (currentCheckIn && clientTime < currentCheckIn) {
        // Nếu bản ghi đồng bộ lên có timestamp sớm hơn cả check_in hiện tại
        updateData.check_in_actual = clientTime;
        // Đẩy check_in cũ thành check_out (nếu chưa có check_out hoặc nếu check_in cũ lớn hơn check_out hiện tại)
        if (!currentCheckOut || currentCheckIn > currentCheckOut) {
          updateData.check_out_actual = currentCheckIn;
        }
      } else if (!currentCheckOut || clientTime > currentCheckOut) {
        // Lần sau cùng tính ra (Check-out)
        updateData.check_out_actual = clientTime;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.attendance.update({
          where: { id: existingRecord.id },
          data: updateData
        });
      }

      return NextResponse.json({ success: true, message: 'Cập nhật log chấm công thành công', time: clientTime });
    }

  } catch (error) {
    console.error('Lỗi API Check-in:', error);
    return NextResponse.json({ error: 'Lỗi server nội bộ' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
