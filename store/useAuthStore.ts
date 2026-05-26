import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string | number;
  name: string;
  role: string;
  departmentId?: string;
  viewAll?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => {
        // Cố định phiên làm việc
        if (typeof window !== "undefined") {
          localStorage.setItem("userRole", user.role);
          document.cookie = `userRole=${user.role}; path=/; max-age=86400`;
        }
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        // Clean State khi đăng xuất
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
          localStorage.removeItem("userRole");
          sessionStorage.clear(); // Xóa sạch phiên làm việc
          
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          
          window.location.href = '/login'; // Ép trình duyệt tải lại trang đăng nhập mới tinh 100%
        }
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage),
    }
  )
);
