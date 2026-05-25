import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

// Secret Key sử dụng để mã hóa JWT (Nên đưa vào biến môi trường trong thực tế)
const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-for-development'
);

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 1. Mock Database validation (Kiểm tra theo yêu cầu tĩnh của bạn)
    const validUsers: Record<string, { id: number; name: string; role: string; password: string; departmentId?: string; viewAll?: boolean }> = {
      'staff_100': { id: 1, name: 'Nguyễn Văn Nhân Viên', role: 'staff', password: '123456', departmentId: 'KINH_DOANH' },
      'manager_100': { id: 2, name: 'Trần Quản Lý', role: 'manager', password: '123456', departmentId: 'KINH_DOANH' },
      'manager_kd': { id: 4, name: 'Trưởng phòng Kinh Doanh', role: 'manager', password: '123456', departmentId: 'KINH_DOANH' },
      'manager_hr': { id: 5, name: 'Trưởng phòng TCHC', role: 'manager', password: '123456', departmentId: 'TCHC' },
      'director_100': { id: 6, name: 'Giám Đốc', role: 'director', password: '123456', viewAll: true },
      'admin_company_100': { id: 3, name: 'Lê Quản Trị Hệ Thống', role: 'admin_company', password: '123456', viewAll: true },
    };

    const user = validUsers[username];
    
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Tài khoản hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    // 2. Tạo Payload cho JWT Token
    const payload = {
      id: user.id,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId,
      viewAll: user.viewAll,
    };

    // 3. Tạo và ký JWT Token với jose
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d') // Token có giá trị trong 1 ngày
      .sign(secretKey);

    // 4. Tạo HTTP Response
    const response = NextResponse.json(
      { message: 'Đăng nhập thành công', user: payload },
      { status: 200 }
    );

    // 5. Gắn JWT Token vào HttpOnly Cookie để bảo mật chống XSS
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true, // Ngăn Javascript đọc cookie (chống XSS)
      path: '/',
      secure: process.env.NODE_ENV === 'production', // Dùng HTTPS ở môi trường production
      maxAge: 60 * 60 * 24, // 1 ngày
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống' }, { status: 500 });
  }
}
