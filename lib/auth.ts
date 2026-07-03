import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-for-development'
);

export interface SessionPayload {
  id: number;
  name: string;
  role: string;
  departmentId?: string;
  viewAll?: boolean;
}

// Đọc & xác thực phiên đăng nhập từ HttpOnly cookie (dùng trong API routes)
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get('auth_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      id: Number(payload.id),
      name: payload.name as string,
      role: payload.role as string,
      departmentId: payload.departmentId as string | undefined,
      viewAll: payload.viewAll as boolean | undefined,
    };
  } catch {
    return null;
  }
}
