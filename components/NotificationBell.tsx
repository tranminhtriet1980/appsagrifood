"use client";

import { useState, useRef, useEffect } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotificationStore();
  const user = useAuthStore(state => state.user);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter notifications relevant to current user role
  const isManager = user?.role && ["manager", "director", "admin"].includes(user.role);
  const userRoleStr = isManager ? "manager" : "staff";
  
  const relevantNotifications = notifications.filter(n => {
    if (n.targetRole === "all") return true;
    if (n.targetUserId) {
      const match1 = n.targetUserId === user?.id?.toString();
      const match2 = n.targetUserId === `s${user?.id}`;
      const match3 = `s${n.targetUserId}` === user?.id?.toString();
      return match1 || match2 || match3;
    }
    return n.targetRole === userRoleStr;
  });
  
  const relevantUnreadCount = relevantNotifications.filter(n => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="transition-all duration-150 active:scale-95 text-on-surface-variant flex items-center p-2 rounded-full hover:bg-surface-container-high"
      >
        <span className="material-symbols-outlined">notifications</span>
        {relevantUnreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container rounded-xl border border-outline-variant shadow-xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-surface-container-highest flex justify-between items-center bg-surface-container-high">
            <h3 className="font-bold text-on-surface">Thông báo</h3>
            {relevantUnreadCount > 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                className="text-primary text-xs font-bold hover:underline"
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 divide-y divide-surface-container-highest custom-scrollbar">
            {relevantNotifications.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-sm">
                Không có thông báo nào
              </div>
            ) : (
              relevantNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => markAsRead(notif.id)}
                  className={`p-4 flex gap-3 hover:bg-surface-container-high cursor-pointer transition-colors ${!notif.isRead ? "bg-primary/5" : ""}`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
                    {notif.senderAvatar ? (
                      <img src={notif.senderAvatar} alt={notif.senderName} className="w-full h-full object-cover" />
                    ) : (
                      notif.senderName.substring(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-on-surface leading-tight mb-1">
                      <span className="font-bold">{notif.senderName}</span> {notif.title && <span className="font-medium">- {notif.title}</span>}
                    </p>
                    <p className="text-xs text-on-surface-variant line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-primary mt-1 font-medium">{notif.time}</p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* View All Link */}
          <button 
            onClick={() => { setIsOpen(false); router.push('/notifications'); }}
            className="w-full p-3 text-center text-sm font-bold text-primary hover:bg-surface-container-high transition-colors border-t border-surface-container-highest flex items-center justify-center gap-1"
          >
            Xem tất cả thông báo
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}
