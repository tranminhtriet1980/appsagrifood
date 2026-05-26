import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-for-development'
);

// Danh sách các route yêu cầu người dùng phải đăng nhập mới được vào
const protectedRoutes = ['/dashboard', '/attendance', '/leaves', '/approvals', '/admin', '/manager', '/notifications', '/history', '/overtime', '/staff', '/employees', '/reports', '/roster', '/settings'];

export async function middleware(request: NextRequest) {
  // Lấy giá trị cookie auth_token (JWT)
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // 1. Nếu đang vào trang login nhưng ĐÃ CÓ token -> đẩy vào dashboard (Tránh người dùng vào login nhiều lần)
  if (pathname === '/login' && token) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      const role = payload.role as string;
      if (role === 'admin' || role === 'admin_company') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // Nếu token không hợp lệ, kệ nó, tiếp tục cho hiển thị trang login
    }
  }

  // 2. Nếu đang cố truy cập các trang nội bộ nhưng KHÔNG CÓ token -> đẩy ra trang login
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // 3. Xác thực JWT Token với jose xem có hợp lệ không
      const { payload } = await jwtVerify(token, secretKey);
      
      const role = payload.role as string;
      const isAdmin = role === 'admin' || role === 'admin_company';
      const isManager = role === 'manager' || role === 'director';

      // 4. Kiểm tra quyền Admin
      if (isAdmin && !pathname.startsWith('/admin')) {
        // Admin cố vào trang không phải của Admin -> Đẩy về /admin/dashboard
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (!isAdmin && pathname.startsWith('/admin')) {
        // Không phải Admin cố vào trang Admin -> Đẩy về /dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // 5. Chặn Manager truy cập vào các route chỉ dành cho staff (trừ /roster - smart redirect)
      // Manager có thể vào /roster vì nó sẽ tự redirect đến /manager/roster
      const staffOnlyRoutes = ['/leaves', '/history', '/overtime', '/staff'];
      const isStaffOnlyRoute = staffOnlyRoutes.some(r => pathname.startsWith(r));
      
      if (isManager && isStaffOnlyRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      return NextResponse.next();
    } catch (error) {
      // Nếu Token đã hết hạn hoặc bị sửa đổi không hợp lệ -> Xóa cookie và đẩy ra login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // Cho phép đi tiếp với các route không cần bảo vệ
  return NextResponse.next();
}

// Cấu hình áp dụng middleware (Bỏ qua API, thư mục _next (chứa js, css) và ảnh tĩnh)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
