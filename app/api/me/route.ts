import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Thông tin hồ sơ của người đang đăng nhập (kèm site + face descriptor để so khớp phía client)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { location: true },
  });

  if (!user) {
    // Fallback cho tài khoản mock (không có trong DB)
    return NextResponse.json({
      id: session.id,
      name: session.name,
      role: session.role,
      employeeCode: null,
      site: null,
      hasFace: false,
      faceDescriptor: null,
    });
  }

  let faceDescriptor: number[] | null = null;
  if (user.face_data) {
    try {
      faceDescriptor = JSON.parse(user.face_data);
    } catch {
      faceDescriptor = null;
    }
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    role: user.role_id,
    employeeCode: user.employee_code,
    site: user.location
      ? {
          id: user.location.id,
          name: user.location.name,
          latitude: Number(user.location.latitude),
          longitude: Number(user.location.longitude),
          radius: user.location.radius,
        }
      : null,
    hasFace: !!faceDescriptor,
    faceDescriptor,
  });
}
