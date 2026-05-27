"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { href: "/admin/dashboard", icon: "monitoring", label: "Tổng quan Kỹ thuật" },
  { href: "/admin/users", icon: "group", label: "Quản lý Tài khoản" },
  { href: "/admin/employees", icon: "badge", label: "Quản lý Nhân sự" },
  { href: "/admin/departments", icon: "account_tree", label: "Cơ cấu Tổ chức" },
  { href: "/admin/logs", icon: "receipt_long", label: "Nhật ký Hệ thống" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Security: if non-admin somehow reaches layout, redirect immediately
  useEffect(() => {
    if (user && !["admin_company", "admin"].includes(user.role)) {
      router.replace("/dashboard");
    }
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <aside className="w-64 bg-surface border-r border-outline-variant h-screen sticky top-0 hidden lg:flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-outline-variant">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
          Admin Portal
        </h2>
        {user && (
          <p className="text-xs text-outline mt-1 truncate">
            {user.name} · <span className="text-tertiary font-bold uppercase">{user.role}</span>
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-primary" : ""}`}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-outline-variant space-y-2">
        <ThemeToggle variant="pill" className="w-full justify-start" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-error hover:bg-error/10 transition-colors font-medium text-sm"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Đăng xuất
        </button>
        <p className="text-xs text-outline text-center">Sagrifood HRM v1.0</p>
      </div>
    </aside>
  );
}
