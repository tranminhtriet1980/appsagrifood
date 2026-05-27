"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";

export default function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { notifications } = useNotificationStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Tính số thông báo chưa đọc liên quan đến user hiện tại
  const getUnreadCount = () => {
    if (!user) return 0;
    const isManager = ["manager", "director", "admin"].includes(user.role);
    const userRoleStr = isManager ? "manager" : "staff";
    const uid = user.id?.toString() || '';
    return notifications.filter(n => {
      if (n.isRead) return false;
      if (n.targetRole === "all") return true;
      if (n.targetUserId) {
        return n.targetUserId === uid || n.targetUserId === `s${uid}` || `s${n.targetUserId}` === uid;
      }
      return n.targetRole === userRoleStr;
    }).length;
  };
  const unreadNotifCount = isMounted ? getUnreadCount() : 0;

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
    <>
      {/* Mobile-only floating theme toggle — appears above bottom nav */}
      <div className="md:hidden fixed bottom-20 right-4 z-[99]">
        <ThemeToggle className="shadow-lg shadow-black/20" />
      </div>

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
              {item.hasBadge && item.name === "Thông báo" && unreadNotifCount > 0 && (
                <span className="absolute -top-1 right-0 min-w-[16px] h-4 px-0.5 bg-error text-on-error rounded-full border-2 border-surface text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </span>
              )}
              {item.hasBadge && item.name === "Phê duyệt" && (
                <span className="absolute top-0 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface"></span>
              )}
              <span className="font-label-sm text-[10px] md:text-label-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
