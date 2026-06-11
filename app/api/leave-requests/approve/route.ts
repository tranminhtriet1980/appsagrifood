import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requestId, status, approverId, approverRole, startDate, endDate, userId, leaveType } = body;

    // 1. PHÂN QUYỀN (BACKEND) - Chỉ duyệt nếu là Quản lý/Admin
    const validRoles = ["manager", "director", "admin_company", "admin"];
    if (!validRoles.includes(approverRole)) {
      return NextResponse.json({ error: 'Không có quyền duyệt đơn. Chỉ Quản lý trở lên mới được phép.' }, { status: 403 });
    }

    if (!requestId || !status) {
      return NextResponse.json({ error: 'Thiếu tham số' }, { status: 400 });
    }

    const reqIdInt = parseInt(requestId);
    if (!isNaN(reqIdInt)) {
      // Thử cập nhật Database thật (nếu có)
      const leaveReq = await prisma.leaveRequest.findUnique({ where: { id: reqIdInt } });
      if (leaveReq) {
        await prisma.leaveRequest.update({
          where: { id: reqIdInt },
          data: { status, approver_id: approverId || 1 }
        });
      }
    }

    // 2. TRIGGER CẬP NHẬT CHẤM CÔNG KHI ĐƠN ĐƯỢC DUYỆT (APPROVED)
    if (status === 'Approved' && startDate && endDate && userId) {
      // Ép múi giờ VN (UTC+7) khi bóc tách ngày tháng
      const parseDateStr = (dateStr: string) => {
        const parts = dateStr.split('/');
        let isoStr = dateStr;
        if (parts.length === 3) isoStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
        // Lấy đúng ngày chuẩn hoá ở 00:00:00 UTC (để lưu vào Db.Date)
        return new Date(`${isoStr}T00:00:00.000Z`);
      };

      const sDate = parseDateStr(startDate);
      const eDate = parseDateStr(endDate);
      const uIdInt = parseInt(userId.replace(/\D/g, '')) || 1;

      // Vòng lặp qua các ngày xin nghỉ (Cộng thêm 1 ngày theo chuẩn Date object của JS mà không bị nhảy lệch timezone)
      for (let d = new Date(sDate.getTime()); d <= eDate; d.setDate(d.getDate() + 1)) {
        const workDate = new Date(d.getTime());

        // Trường hợp: Đơn đi trễ / Về sớm -> Xóa phạt đi muộn (chuyển status thành ontime)
        if (leaveType === 'Đi trễ/Về sớm' || leaveType === 'Xin đi trễ/Về sớm') {
          const existingAtt = await prisma.attendance.findFirst({
            where: { user_id: uIdInt, work_date: workDate }
          });
          if (existingAtt) {
            await prisma.attendance.update({
              where: { id: existingAtt.id },
              data: { status: 'ontime' }
            });
          }
        } 
        // Trường hợp: Đơn nghỉ phép cả ngày -> Ghi nhận "Nghỉ phép (P)" để không bị "Nghỉ không phép (KP)"
        else {
          const existingAtt = await prisma.attendance.findFirst({
            where: { user_id: uIdInt, work_date: workDate }
          });

          if (existingAtt) {
            // Đã có data (có thể đã quẹt thẻ nhầm, hoặc tự động sinh), ghi đè thành Nghỉ phép
            await prisma.attendance.update({
              where: { id: existingAtt.id },
              data: { status: 'Nghỉ phép (P)' }
            });
          } else {
            // Chưa có data chấm công -> Sinh bản ghi mới với trạng thái Nghỉ phép
            await prisma.attendance.create({
              data: {
                user_id: uIdInt,
                shift_id: 1, // Default shift
                work_date: workDate,
                status: 'Nghỉ phép (P)'
              }
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi duyệt đơn:', error);
    return NextResponse.json({ error: 'Lỗi server internal' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
