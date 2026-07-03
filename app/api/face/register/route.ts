import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Đăng ký / cập nhật khuôn mặt cho người đang đăng nhập.
// Lưu face descriptor (mảng 128 số float từ face-api.js) vào cột users.face_data
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const body = await request.json();
  const { descriptor } = body;

  if (!Array.isArray(descriptor) || descriptor.length < 64) {
    return NextResponse.json({ error: 'Dữ liệu khuôn mặt không hợp lệ' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) {
    return NextResponse.json(
      { error: 'Tài khoản không có trong CSDL (không thể đăng ký khuôn mặt)' },
      { status: 404 }
    );
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { face_data: JSON.stringify(descriptor) },
  });

  return NextResponse.json({ success: true, message: 'Đã đăng ký khuôn mặt thành công' });
}
