import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Secret Key sử dụng để mã hóa JWT (Nên đưa vào biến môi trường trong thực tế)
const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-for-development'
);

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    let resolvedUser: { id: number; name: string; role: string; departmentId?: string; viewAll?: boolean } | null = null;

    // 1. Thử xác thực với Database trước (nhân viên thật nạp từ Excel)
    try {
      const dbUser = await prisma.user.findUnique({
        where: { employee_code: username },
        include: { location: true }
      });

      if (dbUser && dbUser.password) {
        const isPasswordMatch = await bcrypt.compare(password, dbUser.password);
        if (isPasswordMatch) {
          resolvedUser = {
            id: dbUser.id,
            name: dbUser.name,
            role: dbUser.role_id, // ví dụ: 'staff', 'manager', 'admin', 'director'
            departmentId: dbUser.location ? dbUser.location.name.toUpperCase().replace(/\s+/g, '_') : undefined,
            viewAll: ['admin', 'director', 'admin_company'].includes(dbUser.role_id)
          };
        }
      }
    } catch (dbError) {
      console.error('Lỗi khi truy vấn đăng nhập Database, sẽ fallback sang Mock:', dbError);
    }

    // 2. Fallback sang Mock Database validation nếu không tìm thấy hoặc mật khẩu db sai
    if (!resolvedUser) {
      const validUsers: Record<string, { id: number; name: string; role: string; password: string; departmentId?: string; viewAll?: boolean }> = {
        'staff_100': { id: 1, name: 'Nguyễn Văn Nhân Viên', role: 'staff', password: '123456', departmentId: 'KINH_DOANH' },
        'manager_100': { id: 2, name: 'Trần Quản Lý', role: 'manager', password: '123456', departmentId: 'KINH_DOANH' },
        'manager_kd': { id: 4, name: 'Trưởng phòng Kinh Doanh', role: 'manager', password: '123456', departmentId: 'KINH_DOANH' },
        'manager_hr': { id: 5, name: 'Trưởng phòng TCHC', role: 'manager', password: '123456', departmentId: 'TCHC' },
        'director_100': { id: 6, name: 'Giám Đốc', role: 'director', password: '123456', viewAll: true },
        'admin_company_100': { id: 3, name: 'Lê Quản Trị Hệ Thống', role: 'admin_company', password: '123456', viewAll: true },
      };

      const mockUser = validUsers[username];
      if (mockUser && mockUser.password === password) {
        resolvedUser = {
          id: mockUser.id,
          name: mockUser.name,
          role: mockUser.role,
          departmentId: mockUser.departmentId,
          viewAll: mockUser.viewAll
        };
      }
    }

    if (!resolvedUser) {
      return NextResponse.json(
        { error: 'Tài khoản hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    // 3. Tạo Payload cho JWT Token
    const payload = {
      id: resolvedUser.id,
      name: resolvedUser.name,
      role: resolvedUser.role,
      departmentId: resolvedUser.departmentId,
      viewAll: resolvedUser.viewAll,
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
