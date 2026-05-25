import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { message: 'Đăng xuất thành công' },
    { status: 200 }
  );

  // Xóa cookie auth_token bằng cách set maxAge = 0
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}
