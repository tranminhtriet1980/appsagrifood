"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useState, useEffect } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-container-highest h-16 flex items-center justify-around z-50 pb-safe"></nav>;

  const isManager = user && ["manager", "director", "admin_company", "admin"].includes(user.role);

  const staffNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { name: "C.Công", href: "/attendance", icon: "calendar_today" },
    { name: "Ca làm", href: "/roster", icon: "schedule" },
    { name: "Thông báo", href: "/notifications", icon: "notifications", hasBadge: true },
    { name: "Hồ sơ", href: "/settings", icon: "account_circle" },
  ];

  const managerNavItems = [
    { name: "Điều khiển", href: "/dashboard", icon: "dashboard" },
    { name: "C.Công", href: "/manager/attendance", icon: "assignment_turned_in" },
    { name: "Xếp ca", href: "/manager/roster", icon: "calendar_month" },
    { name: "Nhân sự", href: "/employees", icon: "group" },
    { name: "Phê duyệt", href: "/approvals", icon: "fact_check", hasBadge: true },
  ];

  const navItems = isManager ? managerNavItems : staffNavItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-container-highest h-16 flex items-center justify-around z-[100] pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link 
            key={item.name}
            href={item.href} 
            className={`flex flex-col items-center gap-xs transition-colors relative ${isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <span className="material-symbols-outlined">{isActive && item.icon !== 'menu' ? item.icon : item.icon}</span>
            {item.hasBadge && (
              <span className="absolute top-0 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface"></span>
            )}
            <span className="font-label-sm text-[10px] md:text-label-sm">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
