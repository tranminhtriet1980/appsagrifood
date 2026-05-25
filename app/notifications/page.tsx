"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "approval",
    title: "Đơn xin đổi ca đã được duyệt",
    content: "Quản lý đã duyệt yêu cầu đổi ca ngày 25/05 của bạn với Lê Thị Tú.",
    time: "2 giờ trước",
    icon: "fact_check",
    color: "status-success",
    isRead: false,
  },
  {
    id: 2,
    type: "payroll",
    title: "Phiếu lương tháng 04/2026",
    content: "Phiếu lương tháng 04 của bạn đã được cập nhật. Vui lòng kiểm tra chi tiết.",
    time: "Hôm qua",
    icon: "payments",
    color: "tertiary",
    isRead: false,
  },
  {
    id: 3,
    type: "news",
    title: "Thông báo sinh hoạt công ty",
    content: "Team Building Quý 2 sẽ diễn ra vào cuối tuần này. Xem lịch trình chi tiết tại đây.",
    time: "2 ngày trước",
    icon: "campaign",
    color: "primary",
    isRead: true,
  },
  {
    id: 4,
    type: "system",
    title: "Nâng cấp hệ thống HRM",
    content: "Hệ thống sẽ bảo trì từ 22:00 đến 23:00 tối nay. Mong các bạn lưu ý.",
    time: "1 tuần trước",
    icon: "manufacturing",
    color: "on-surface-variant",
    isRead: true,
  },
  {
    id: 5,
    type: "approval",
    title: "Từ chối nghỉ phép",
    content: "Đơn xin nghỉ phép ngày 12/05 của bạn không được duyệt do thiếu nhân sự.",
    time: "2 tuần trước",
    icon: "cancel",
    color: "error",
    isRead: true,
  }
];

export default function NotificationsPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-on-surface">Đang tải...</div>;
  }

  const filteredNotifications = notifications.filter(n => activeTab === "all" ? true : !n.isRead);

  return (
    <div className="font-body-md text-body-md overflow-x-hidden min-h-screen bg-background text-on-surface pb-24">
      <style jsx global>{`
        .glass-card {
          background: rgba(23, 31, 51, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(218, 226, 253, 0.1);
          transition: background 0.3s ease;
        }
        .glass-card:hover {
          background: rgba(30, 40, 65, 0.7);
        }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        
        .notification-item.unread {
            background: linear-gradient(135deg, rgba(128, 131, 255, 0.08) 0%, rgba(23, 31, 51, 0.7) 100%);
            border-left: 2px solid #c0c1ff;
        }
      `}</style>
      
      {/* Top AppBar */}
      <header className="w-full sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-container-highest flex items-center justify-between px-md h-16">
        <div className="flex items-center gap-md">
          <button onClick={() => router.back()} className="text-primary hover:bg-surface-container-high transition-colors duration-150 p-2 rounded-full active:scale-95 flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Thông báo</h1>
        </div>
        <button onClick={markAllAsRead} className="text-primary font-label-md hover:brightness-110 px-2 py-1 flex items-center gap-1 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-[18px]">done_all</span>
          <span className="hidden sm:inline">Đánh dấu đã đọc</span>
        </button>
      </header>

      <main className="max-w-2xl mx-auto pt-4 px-md space-y-md lg:pt-8">
        
        {/* Tabs */}
        <div className="flex bg-surface-container-high p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-2 text-center rounded-lg font-bold text-label-md transition-all ${activeTab === "all" ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setActiveTab("unread")}
            className={`flex-1 py-2 text-center rounded-lg font-bold text-label-md transition-all flex items-center justify-center gap-1.5 ${activeTab === "unread" ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Chưa đọc
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${activeTab === "unread" ? 'bg-on-primary text-primary' : 'bg-error text-on-error'}`}>
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant glass-card rounded-2xl border border-surface-container-highest/50">
              <span className="material-symbols-outlined text-[64px] opacity-30 mb-4">notifications_off</span>
              <p className="font-body-lg">Không có thông báo nào.</p>
              <p className="font-label-sm mt-2 opacity-70">Bạn đã cập nhật tất cả thông tin mới nhất.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`glass-card p-4 rounded-xl cursor-pointer transition-all notification-item ${!notification.isRead ? 'unread' : 'opacity-80 hover:opacity-100'} flex gap-4`}
              >
                {/* Dynamically applying colors. Ensure these colors exist in tailwind config or are standard tailwind colors */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${
                    notification.color === 'status-success' ? 'bg-status-success/10 border-status-success/20 text-status-success' :
                    notification.color === 'tertiary' ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' :
                    notification.color === 'primary' ? 'bg-primary/10 border-primary/20 text-primary' :
                    notification.color === 'error' ? 'bg-error/10 border-error/20 text-error' :
                    'bg-on-surface-variant/10 border-on-surface-variant/20 text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-[24px]">{notification.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-body-md font-bold text-on-surface ${!notification.isRead ? 'text-primary' : ''}`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 shrink-0">
                      <span className="font-label-sm text-[10px] text-on-surface-variant whitespace-nowrap">{notification.time}</span>
                      {!notification.isRead && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_rgba(192,193,255,0.6)] animate-pulse"></div>
                      )}
                    </div>
                  </div>
                  <p className="font-body-sm text-[13px] text-on-surface-variant mt-1.5 leading-relaxed">
                    {notification.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Global Bottom Navigation Component */}
      <BottomNav />
    </div>
  );
}
