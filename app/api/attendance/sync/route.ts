import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { recordPunch } from '@/lib/attendance-core';

// Đồng bộ hàng loạt các lượt chấm công đã lưu offline (IndexedDB) khi có mạng lại
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập' }, { status: 401 });
    }

    const body = await request.json();
    const { records } = body;

    if (!records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Payload không hợp lệ' }, { status: 400 });
    }

    let synced = 0;
    const errors: string[] = [];

    for (const record of records) {
      const { timestamp, type, lat, lng, imageBase64, faceMatchScore } = record;
      if (!timestamp) continue;

      const result = await recordPunch({
        userId: session.id, // luôn theo người đang đăng nhập
        type: type === 'out' ? 'out' : 'in',
        timestamp,
        lat: typeof lat === 'number' ? lat : null,
        lng: typeof lng === 'number' ? lng : null,
        imageBase64: imageBase64 || null,
        faceMatchScore: typeof faceMatchScore === 'number' ? faceMatchScore : null,
      });

      if (result.ok) synced++;
      else errors.push(result.message);
    }

    return NextResponse.json({ success: true, synced, errors });
  } catch (err) {
    console.error('Lỗi Bulk Sync:', err);
    return NextResponse.json({ error: 'Lỗi đồng bộ máy chủ' }, { status: 500 });
  }
}
