import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { recordPunch } from '@/lib/attendance-core';

// Ghi nhận 1 lượt chấm công (check-in / check-out) có kiểm tra GPS + khuôn mặt
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập' }, { status: 401 });
    }

    const body = await request.json();
    const {
      timestamp,
      type, // 'in' | 'out'
      lat,
      lng,
      accuracy,
      imageBase64,
      faceMatchScore,
    } = body;

    if (!timestamp) {
      return NextResponse.json({ error: 'Thiếu thời gian chấm công' }, { status: 400 });
    }

    const punchType: 'in' | 'out' = type === 'out' ? 'out' : 'in';

    const result = await recordPunch({
      userId: session.id, // Lấy từ JWT — không tin userId do client gửi
      type: punchType,
      timestamp,
      lat: typeof lat === 'number' ? lat : null,
      lng: typeof lng === 'number' ? lng : null,
      accuracy: typeof accuracy === 'number' ? accuracy : null,
      imageBase64: imageBase64 || null,
      faceMatchScore: typeof faceMatchScore === 'number' ? faceMatchScore : null,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message, ...result.data }, { status: result.status });
    }

    return NextResponse.json(
      { success: true, message: result.message, record: result.data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Lỗi API Check-in:', error);
    return NextResponse.json({ error: 'Lỗi server nội bộ' }, { status: 500 });
  }
}
