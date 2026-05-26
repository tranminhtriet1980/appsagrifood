"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-on-surface">Đang tải...</div>;
  }

  return (
    <div className="font-body-md text-body-md overflow-x-hidden min-h-screen bg-background text-on-surface pb-24">
      <style jsx global>{`
        .glass-effect {
          background: rgba(23, 31, 51, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(218, 226, 253, 0.1);
          transition: background 0.3s ease;
        }
        .glass-effect:hover {
          background: rgba(30, 40, 65, 0.7);
        }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        input:focus { outline: none; border-color: #c0c1ff !important; box-shadow: none !important; }
      `}</style>
      
      {/* Top AppBar */}
      <header className="w-full sticky top-0 z-40 bg-surface dark:bg-surface border-b border-surface-container-highest flex items-center justify-between px-md h-14">
        <div className="flex items-center gap-md">
          <button onClick={() => router.back()} className="text-primary dark:text-primary-fixed hover:bg-surface-container-high transition-colors duration-150 p-2 rounded-full active:scale-95 flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Cài đặt</h1>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container flex items-center justify-center bg-primary-container text-on-primary-container font-bold">
          {user?.name?.substring(0, 2).toUpperCase() || 'US'}
        </div>
      </header>

      <main className="max-w-md mx-auto px-margin-mobile pt-lg space-y-lg lg:max-w-3xl lg:pt-12">
        {/* User Profile Card */}
        <section className="glass-effect rounded-xl p-lg flex flex-col items-center text-center shadow-lg shadow-black/20">
          <div className="relative mb-md">
            <div className="w-24 h-24 rounded-full border-4 border-surface-container-highest overflow-hidden flex items-center justify-center bg-primary-container text-on-primary-container font-headline-lg font-bold shadow-inner">
              {user?.name?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <button className="absolute bottom-0 right-0 bg-primary text-on-primary p-1.5 rounded-full border-2 border-background shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">{user?.name || "Người dùng"}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {user?.name ? `${user.name.toLowerCase().replace(/\s+/g, '.')}@company.com` : "email@company.com"}
          </p>
          <div className="mt-sm px-3 py-1 bg-primary-container/20 text-primary rounded-full font-label-md text-label-md uppercase tracking-wider border border-primary/20">
            {user?.role === 'staff' ? 'Nhân viên' : user?.role || 'User'}
          </div>
        </section>

        {/* Personal Information Form */}
        <section className="space-y-md">
          <h3 className="font-label-md text-label-md text-primary uppercase tracking-wider px-base font-bold">Thông tin cá nhân</h3>
          <div className="glass-effect rounded-xl p-md space-y-md shadow-md">
            <div className="space-y-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-base uppercase">Họ và tên</label>
              <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-3 font-body-md text-body-md text-on-surface transition-all focus:border-primary" type="text" defaultValue={user?.name || ""} />
            </div>
            <div className="space-y-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-base uppercase">Email công việc</label>
              <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-3 font-body-md text-body-md text-on-surface transition-all focus:border-primary" type="email" defaultValue={user?.name ? `${user.name.toLowerCase().replace(/\s+/g, '.')}@company.com` : ""} />
            </div>
            <div className="grid grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-base uppercase">Số điện thoại</label>
                <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-3 font-body-md text-body-md text-on-surface transition-all focus:border-primary" type="tel" defaultValue="0987 654 321" />
              </div>
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-base uppercase">Mã nhân viên</label>
                <input className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-md py-3 font-body-md text-body-md text-on-surface-variant opacity-70 cursor-not-allowed" disabled type="text" value={`NV-${user?.id || '001'}`} />
              </div>
            </div>
          </div>
        </section>

        {/* Password Management */}
        <section className="space-y-md">
          <h3 className="font-label-md text-label-md text-primary uppercase tracking-wider px-base font-bold">Bảo mật</h3>
          <div className="glass-effect rounded-xl p-md space-y-md shadow-md">
            <div className="space-y-xs relative">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-base uppercase">Mật khẩu hiện tại</label>
              <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-3 pr-10 font-body-md text-body-md text-on-surface focus:border-primary transition-all" type={showCurrentPassword ? "text" : "password"} defaultValue="123456" />
              <button onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-8 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-1 rounded-full hover:bg-surface-container-high">
                <span className="material-symbols-outlined">{showCurrentPassword ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
            <div className="space-y-xs relative">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-base uppercase">Mật khẩu mới</label>
              <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-3 pr-10 font-body-md text-body-md text-on-surface focus:border-primary transition-all" placeholder="Nhập mật khẩu mới" type={showNewPassword ? "text" : "password"} />
              <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-8 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-1 rounded-full hover:bg-surface-container-high">
                <span className="material-symbols-outlined">{showNewPassword ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
            <div className="space-y-xs relative">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-base uppercase">Xác nhận mật khẩu</label>
              <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-3 pr-10 font-body-md text-body-md text-on-surface focus:border-primary transition-all" placeholder="Xác nhận mật khẩu mới" type={showConfirmPassword ? "text" : "password"} />
              <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-8 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-1 rounded-full hover:bg-surface-container-high">
                <span className="material-symbols-outlined">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
            <button className="w-full bg-primary text-on-primary-container font-bold py-3 rounded-lg hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 mt-2">
              Cập nhật mật khẩu
            </button>
          </div>
        </section>

        {/* System Preferences */}
        <section className="space-y-md">
          <h3 className="font-label-md text-label-md text-primary uppercase tracking-wider px-base font-bold">Tùy chọn hệ thống</h3>
          <div className="glass-effect rounded-xl divide-y divide-surface-container-highest shadow-md">
            <div className="flex items-center justify-between p-md">
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-primary">notifications</span>
                <div>
                  <p className="font-body-md text-body-md text-on-surface font-medium">Thông báo đẩy</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Nhận tin tức và cập nhật ca làm</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-md">
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-primary">face</span>
                <div>
                  <p className="font-body-md text-body-md text-on-surface font-medium">Đăng nhập sinh trắc học</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Sử dụng Face ID để truy cập nhanh</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Logout Button */}
        <button
          type="button"
          onClick={async (e) => {
            e.preventDefault();
            
            try {
              // 1. Gọi API Backend để xóa HttpOnly Cookie (Quét sạch gốc rễ)
              await fetch('/api/auth/logout', { method: 'POST' });
            } catch (err) {
              console.error("Lỗi xóa cookie phía server", err);
            }
            
            // 2. Xóa Zustand store
            logout();
            
            // 3. Xóa các lưu trữ liên quan đến phiên (giữ lại app-storage để test E2E)
            localStorage.removeItem('auth-storage');
            localStorage.removeItem('userRole');
            sessionStorage.clear();
            
            // 4. Quét sạch mọi cookie thường để chặn middleware
            document.cookie.split(";").forEach((c) => {
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            
            // 5. Bật chế độ dịch chuyển tức thời (Hard Redirect)
            window.location.href = '/login';
          }}
          className="w-full flex items-center justify-center gap-sm bg-error-container/20 text-error border border-error/30 font-headline-md text-headline-md font-bold py-4 rounded-xl hover:bg-error-container/40 transition-all active:scale-95 mb-lg mt-6 shadow-sm"
        >
          <span className="material-symbols-outlined">logout</span>
          Đăng xuất
        </button>
      </main>

      {/* Global Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
