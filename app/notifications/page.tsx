"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

type FilterTab = "all" | "unread";

export default function NotificationsPage() {
  const user = useAuthStore((state) => state.user);
  const { notifications, markAllAsRead, markAsRead } = useNotificationStore();
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-on-surface">Đang tải...</div>;
  }

  // Filter theo user hiện tại (giống NotificationBell)
  const isManager = user?.role && ["manager", "director", "admin"].includes(user.role);
  const userRoleStr = isManager ? "manager" : "staff";

  const relevantNotifications = notifications.filter(n => {
    if (n.targetRole === "all") return true;
    if (n.targetUserId) {
      const uid = user?.id?.toString() || '';
      const match1 = n.targetUserId === uid;
      const match2 = n.targetUserId === `s${uid}`;
      const match3 = `s${n.targetUserId}` === uid;
      return match1 || match2 || match3;
    }
    return n.targetRole === userRoleStr;
  });

  const unreadCount = relevantNotifications.filter(n => !n.isRead).length;
  const filteredNotifications = activeTab === "all" 
    ? relevantNotifications 
    : relevantNotifications.filter(n => !n.isRead);

  const getNotifStyle = (type: string) => {
    switch(type) {
      case 'roster': return { icon: 'calendar_month', colorClass: 'bg-primary/10 border-primary/20 text-primary' };
      case 'leave': return { icon: 'event_busy', colorClass: 'bg-tertiary/10 border-tertiary/20 text-tertiary' };
      case 'approval': return { icon: 'fact_check', colorClass: 'bg-status-success/10 border-status-success/20 text-status-success' };
      case 'warning': return { icon: 'warning', colorClass: 'bg-orange-500/10 border-orange-500/20 text-orange-400' };
      default: return { icon: 'notifications', colorClass: 'bg-primary/10 border-primary/20 text-primary' };
    }
  };

  return (
    <div className="font-body-md text-body-md overflow-x-hidden min-h-screen bg-background text-on-surface pb-24">
      <style jsx global>{`
        .glass-card {
          background: rgba(23, 31, 51, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(218, 226, 253, 0.1);
          transition: background 0.3s ease;
        }
        .glass-card:hover { background: rgba(30, 40, 65, 0.7); }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .notif-unread {
          background: linear-gradient(135deg, rgba(128, 131, 255, 0.08) 0%, rgba(23, 31, 51, 0.7) 100%);
          border-left: 3px solid #c0c1ff !important;
        }
      `}</style>
      
      {/* Top AppBar */}
      <header className="w-full sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-container-highest flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-primary hover:bg-surface-container-high transition-colors duration-150 p-2 rounded-full active:scale-95 flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Thông báo</h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-primary font-label-md hover:brightness-110 px-3 py-1.5 flex items-center gap-1 active:scale-95 transition-all rounded-lg hover:bg-primary/10">
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            <span className="hidden sm:inline text-sm">Đọc tất cả</span>
          </button>
        )}
      </header>

      <main className="max-w-2xl mx-auto pt-4 px-4 space-y-4 lg:pt-8">
        
        {/* Tabs */}
        <div className="flex bg-surface-container-high p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-2 text-center rounded-lg font-bold text-sm transition-all ${activeTab === "all" ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Tất cả ({relevantNotifications.length})
          </button>
          <button 
            onClick={() => setActiveTab("unread")}
            className={`flex-1 py-2 text-center rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${activeTab === "unread" ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Chưa đọc
            {unreadCount > 0 && (
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${activeTab === "unread" ? 'bg-on-primary text-primary' : 'bg-error text-on-error'}`}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant glass-card rounded-2xl border border-surface-container-highest/50">
              <span className="material-symbols-outlined text-[64px] opacity-30 mb-4 block">notifications_off</span>
              <p className="font-body-lg">Không có thông báo nào.</p>
              <p className="font-label-sm mt-2 opacity-70">
                {activeTab === "unread" ? "Bạn đã đọc tất cả thông báo!" : "Chưa có thông báo mới nào."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const style = getNotifStyle('roster');
              return (
                <div 
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`glass-card p-4 rounded-xl cursor-pointer transition-all flex gap-4 border ${!notif.isRead ? 'notif-unread' : 'opacity-80 hover:opacity-100'}`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${style.colorClass}`}>
                    <span className="material-symbols-outlined text-[24px]">{style.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-on-surface leading-tight">
                          <span className="font-bold">{notif.senderName}</span>
                          {notif.title && <span className="font-medium text-on-surface-variant"> – {notif.title}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-on-surface-variant whitespace-nowrap">{notif.time}</span>
                        {!notif.isRead && (
                          <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_rgba(192,193,255,0.6)] animate-pulse flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Info nếu không có thông báo nào trong store */}
        {relevantNotifications.length === 0 && activeTab === "all" && (
          <div className="glass-card rounded-xl p-4 border border-primary/20 flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Thông báo từ hệ thống sẽ xuất hiện tại đây. Ví dụ khi Manager công bố lịch ca, bạn sẽ nhận được thông báo ngay lập tức.
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
