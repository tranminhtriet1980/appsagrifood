import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Danh sách site (siêu thị) để phát hiện site gần nhất khi chấm công
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const sites = await prisma.location.findMany({ orderBy: { id: 'asc' } });
  return NextResponse.json(
    sites.map((s) => ({
      id: s.id,
      name: s.name,
      latitude: Number(s.latitude),
      longitude: Number(s.longitude),
      radius: s.radius,
    }))
  );
}
