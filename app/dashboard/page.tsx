"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const dashboardAlerts = useAppStore((state) => state.dashboardAlerts);
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeStr, setTimeStr] = useState("04:32:15");

  const { data, isLoading } = useSWR("/api/dashboard/stats", fetcher);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-GB', { hour12: false }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusStyle = (statusType: string) => {
    switch (statusType) {
      case "normal": return "bg-primary-container/20 text-primary-fixed-dim";
      case "off": return "bg-surface-container-highest text-on-surface-variant";
      case "late": return "bg-error-container/20 text-error";
      case "leave": return "bg-tertiary-container/20 text-tertiary";
      default: return "bg-surface-container-highest text-on-surface-variant";
    }
  };

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const staffMenu = [
    { name: "Bảng điều khiển", icon: "dashboard", href: "/dashboard" },
    { name: "Chấm công", icon: "calendar_today", href: "/attendance" },
    { name: "Lịch sử cá nhân", icon: "history", href: "/history" },
    { name: "Nghỉ phép", icon: "event_busy", href: "/leaves" },
    { name: "Tăng ca & Công tác", icon: "edit_document", href: "/overtime" },
    { name: "Ca làm việc", icon: "schedule", href: "/roster" },
    { name: "Cài đặt tài khoản", icon: "settings", href: "/settings" },
  ];

  const managerMenu = [
    { name: "Tháp điều khiển", icon: "dashboard", href: "/dashboard" },
    { name: "Quản lý Chấm công", icon: "assignment_turned_in", href: "/manager/attendance" },
    { name: "Xếp ca", icon: "calendar_month", href: "/manager/roster" },
    { name: "Nhân sự", icon: "groups", href: "/employees" },
    { name: "Phê duyệt", icon: "fact_check", href: "/approvals" },
    { name: "Báo cáo", icon: "analytics", href: "/reports" },
    { name: "Cài đặt tài khoản", icon: "settings", href: "/settings" },
  ];

  const isManager = user?.role && ["manager", "director", "admin_company", "admin"].includes(user.role);
  const activeMenu = isManager ? managerMenu : staffMenu;

  if (!isMounted) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">Đang tải dữ liệu...</div>;
  }

  // Define contents conditionally
  const renderManagerDashboard = () => (
    <div className="space-y-gutter">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h3 className="font-headline-lg text-headline-lg text-on-surface">Tháp điều khiển (Manager)</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">{currentDate}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Widget 1: Tổng quan Sĩ số */}
        <div className="bg-surface-container border border-surface-container-highest rounded-xl p-md flex flex-col justify-between hover:bg-surface-container-high transition-colors">
          <div className="flex justify-between items-start mb-sm">
            <h4 className="font-label-md text-on-surface-variant uppercase tracking-wider">Tổng quan sĩ số</h4>
            <span className="material-symbols-outlined text-primary">groups</span>
          </div>
          <div>
            <h3 className="font-headline-lg font-bold text-primary">Quân số hôm nay: 8/10</h3>
            <div className="flex gap-4 mt-2">
              <span className="text-error font-label-md bg-error-container/20 px-2 py-0.5 rounded text-xs">Đi muộn: 1</span>
              <span className="text-tertiary font-label-md bg-tertiary-container/20 px-2 py-0.5 rounded text-xs">Nghỉ phép: 1</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Đơn từ chờ duyệt / Cảnh báo */}
        <div className={`bg-surface-container-high border-2 ${dashboardAlerts.length > 0 ? "border-error-container hover:border-error" : "border-surface-container-highest hover:border-primary/50"} rounded-xl p-md flex flex-col justify-between relative overflow-hidden group transition-colors cursor-pointer`} onClick={() => router.push('/manager/leaves-approval')}>
          <div className="z-10 flex justify-between items-start mb-sm">
            <h4 className={`font-label-md uppercase tracking-wider font-bold ${dashboardAlerts.length > 0 ? "text-error" : "text-primary"}`}>ĐƠN NGHỈ PHÉP</h4>
            <span className={`material-symbols-outlined ${dashboardAlerts.length > 0 ? "text-error" : "text-primary"}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {dashboardAlerts.length > 0 ? "warning" : "fact_check"}
            </span>
          </div>
          <div className="z-10 flex flex-col gap-sm">
            <h3 className={`font-headline-lg font-bold ${dashboardAlerts.length > 0 ? "text-error" : "text-primary"}`}>Có 3 đơn chờ duyệt</h3>
            
            {/* Hiển thị danh sách Alert nếu có */}
            {dashboardAlerts.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                {dashboardAlerts.map(alert => (
                  <div key={alert.id} className="bg-error/10 border border-error/20 p-2 rounded flex items-start gap-2">
                    <span className="material-symbols-outlined text-error text-[16px] mt-0.5">priority_high</span>
                    <span className="text-error text-[12px] font-bold leading-tight">{alert.message}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className={`flex items-center gap-1 mt-2 text-sm font-bold ${dashboardAlerts.length > 0 ? "text-error" : "text-primary"}`}>
              <span>Đi tới Phê duyệt</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </div>
          <span className={`material-symbols-outlined absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover:animate-bounce transition-transform ${dashboardAlerts.length > 0 ? "text-error" : "text-primary"}`}>edit_document</span>
        </div>

        {/* Widget 3: Truy cập nhanh */}
        <div className="bg-surface-container border border-surface-container-highest rounded-xl p-md flex flex-col justify-between hover:bg-surface-container-high transition-colors">
          <div className="flex justify-between items-start mb-sm">
            <h4 className="font-label-md text-on-surface-variant uppercase tracking-wider">Truy cập nhanh</h4>
            <span className="material-symbols-outlined text-secondary">bolt</span>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => router.push('/employees')} className="bg-surface-container-highest hover:bg-primary/20 hover:text-primary p-2 rounded-lg text-left transition-colors font-label-md flex justify-between items-center">
              <span>Quản lý nhân viên</span>
              <span className="material-symbols-outlined text-[18px]">groups</span>
            </button>
            <button onClick={() => router.push('/manager/attendance-logs')} className="bg-surface-container-highest hover:bg-primary/20 hover:text-primary p-2 rounded-lg text-left transition-colors font-label-md flex justify-between items-center">
              <span>Lịch sử chấm công toàn đội</span>
              <span className="material-symbols-outlined text-[18px]">history</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mt-lg">
        {/* Biểu đồ Tần suất đi muộn */}
        <div className="bg-surface-container border border-surface-container-highest rounded-xl p-md hover:bg-surface-container-high transition-colors cursor-pointer group" onClick={() => router.push('/manager/attendance-logs')}>
          <div className="flex justify-between items-start mb-md">
            <h4 className="font-label-md text-on-surface-variant uppercase tracking-wider font-bold">Tần suất đi muộn</h4>
            <span className="material-symbols-outlined text-orange-500 group-hover:animate-pulse">trending_up</span>
          </div>
          <div className="flex items-end justify-around h-32 mt-4 pb-2 border-b border-surface-container-highest">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 bg-orange-500 rounded-t-md h-12 group-hover:h-16 transition-all duration-500"></div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 bg-orange-500 rounded-t-md h-24 group-hover:h-28 transition-all duration-500"></div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 bg-orange-500 rounded-t-md h-8 group-hover:h-12 transition-all duration-500"></div>
            </div>
          </div>
          <div className="flex items-center justify-around mt-2">
            <span className="text-xs font-bold text-on-surface-variant">Emart</span>
            <span className="text-xs font-bold text-on-surface-variant">Lotte Q7</span>
            <span className="text-xs font-bold text-on-surface-variant">Sagri Q1</span>
          </div>
          <div className="mt-4 flex justify-between items-center text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Xem chi tiết danh sách đi muộn</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStaffDashboard = () => (
    <div className="space-y-gutter">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h3 className="font-headline-lg text-headline-lg text-on-surface">Chào buổi sáng, {user?.name}</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">{currentDate}</p>
        </div>
        <div className="flex items-center gap-sm">
          <button className="px-md py-sm bg-surface-container-high text-on-surface rounded-lg font-label-md hover:bg-surface-container-highest transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">download</span> Xuất báo cáo
          </button>
          <button className="px-md py-sm bg-primary text-on-primary rounded-lg font-label-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-xs" onClick={() => router.push('/leaves')}>
            <span className="material-symbols-outlined text-[18px]">add</span> Đăng ký nghỉ
          </button>
        </div>
      </section>

      {/* Top Grid: Attendance & Shift & Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Attendance Card */}
        <div className="lg:col-span-4 bg-surface-container border border-surface-container-highest rounded-xl p-md flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Chấm công</span>
            <span className="px-sm py-xs bg-status-success/20 text-status-success rounded-full font-label-sm text-[10px] flex items-center gap-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse"></span> Đang làm việc
            </span>
          </div>
          
          <div className="flex flex-col items-center py-sm">
            <p className="font-headline-lg text-[40px] text-primary font-mono tracking-tighter" id="timer">{timeStr}</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Thời gian làm việc hôm nay</p>
          </div>
          
          <div className="grid grid-cols-2 gap-sm">
            <div className="bg-surface-container-low p-sm rounded-lg border border-outline-variant/30">
              <p className="font-label-sm text-on-surface-variant">Vào ca</p>
              <p className="font-label-md text-on-surface font-bold">{data?.shift?.startTime || '08:00 AM'}</p>
            </div>
            <div className="bg-surface-container-low p-sm rounded-lg border border-outline-variant/30">
              <p className="font-label-sm text-on-surface-variant">Dự kiến</p>
              <p className="font-label-md text-on-surface font-bold">{data?.shift?.expectedEndTime || '17:00 PM'}</p>
            </div>
          </div>
          
          <div className="flex gap-sm">
            <button onClick={() => router.push('/attendance')} className="flex-1 py-md bg-surface-container-highest text-on-surface rounded-lg font-label-md hover:brightness-110 active:scale-95 transition-all">
              Check-in
            </button>
            <button onClick={() => router.push('/attendance')} className="flex-1 py-md bg-error-container text-on-error-container rounded-lg font-label-md hover:brightness-110 active:scale-95 transition-all">
              Check-out
            </button>
          </div>
        </div>

        {/* Shift Info & Leave Balance */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* Shift Card */}
          <div className="bg-surface-container border border-surface-container-highest rounded-xl p-md relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-lg bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant">Ca hiện tại</p>
                  <p className="font-body-lg font-bold text-on-surface">{isLoading ? 'Đang tải...' : data?.shift?.name}</p>
                </div>
              </div>
              <div className="mt-lg">
                <div className="flex justify-between font-label-sm text-on-surface-variant mb-xs">
                  <span>Tiến độ ca</span>
                  <span>{data?.shift?.progress || 0}%</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full rounded-full transition-all duration-1000" style={{ width: `${data?.shift?.progress || 0}%` }}></div>
                </div>
              </div>
            </div>
            {/* Abstract Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-tertiary/10 transition-all"></div>
          </div>

          {/* Leave Balance Card */}
          <div className="bg-surface-container border border-surface-container-highest rounded-xl p-md flex flex-col">
            <div className="flex items-center justify-between mb-md">
              <p className="font-label-md text-on-surface-variant uppercase tracking-wider">Quỹ phép năm</p>
              <span className="material-symbols-outlined text-primary">event_note</span>
            </div>
            <div className="flex items-end gap-sm">
              <p className="font-headline-lg text-on-surface">{isLoading ? '-' : data?.leaveBalance?.remaining}</p>
              <p className="font-label-md text-on-surface-variant mb-base">Ngày còn lại</p>
            </div>
            <div className="mt-auto pt-sm border-t border-surface-container-highest flex justify-between text-label-sm">
              <span className="text-on-surface-variant">Đã dùng: {data?.leaveBalance?.used}</span>
              <span className="text-on-surface-variant">Tổng cộng: {data?.leaveBalance?.total}</span>
            </div>
          </div>

          {/* Quick Action Grid */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-sm">
            <button onClick={() => router.push('/payroll')} className="bg-surface-container-high hover:bg-primary hover:text-on-primary p-md rounded-xl border border-surface-container-highest transition-all flex flex-col items-center gap-sm">
              <span className="material-symbols-outlined">description</span>
              <span className="font-label-sm">Phiếu lương</span>
            </button>
            <button onClick={() => router.push('/leaves')} className="bg-surface-container-high hover:bg-primary hover:text-on-primary p-md rounded-xl border border-surface-container-highest transition-all flex flex-col items-center gap-sm">
              <span className="material-symbols-outlined">history_edu</span>
              <span className="font-label-sm">Lịch sử phép</span>
            </button>
            <button onClick={() => router.push('/insurance')} className="bg-surface-container-high hover:bg-primary hover:text-on-primary p-md rounded-xl border border-surface-container-highest transition-all flex flex-col items-center gap-sm">
              <span className="material-symbols-outlined">medical_services</span>
              <span className="font-label-sm">Bảo hiểm</span>
            </button>
            <button onClick={() => router.push('/notifications')} className="bg-surface-container-high hover:bg-primary hover:text-on-primary p-md rounded-xl border border-surface-container-highest transition-all flex flex-col items-center gap-sm">
              <span className="material-symbols-outlined">campaign</span>
              <span className="font-label-sm">Thông báo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <section className="bg-surface-container border border-surface-container-highest rounded-xl overflow-hidden mt-6">
        <div className="p-md border-b border-surface-container-highest flex items-center justify-between">
          <h4 className="font-headline-md text-on-surface">Lịch sử chấm công (7 ngày gần nhất)</h4>
          <button className="text-primary font-label-md hover:underline" onClick={() => router.push('/history')}>Xem tất cả</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-high border-b border-surface-container-highest">
                <th className="px-md py-sm font-label-sm text-on-surface-variant uppercase">Ngày</th>
                <th className="px-md py-sm font-label-sm text-on-surface-variant uppercase">Ca</th>
                <th className="px-md py-sm font-label-sm text-on-surface-variant uppercase">Check-in</th>
                <th className="px-md py-sm font-label-sm text-on-surface-variant uppercase">Check-out</th>
                <th className="px-md py-sm font-label-sm text-on-surface-variant uppercase">Tổng giờ</th>
                <th className="px-md py-sm font-label-sm text-on-surface-variant uppercase text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-4">Đang tải dữ liệu...</td></tr>
              ) : (
                data?.attendanceHistory?.map((row: any) => (
                  <tr key={row.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="px-md py-sm font-body-md text-on-surface">{row.date}</td>
                    <td className="px-md py-sm font-label-md text-on-surface-variant">{row.shift}</td>
                    <td className="px-md py-sm font-body-md text-on-surface">{row.checkIn}</td>
                    <td className="px-md py-sm font-body-md text-on-surface-variant">{row.checkOut}</td>
                    <td className="px-md py-sm font-body-md text-on-surface-variant">{row.totalHours}</td>
                    <td className="px-md py-sm text-right">
                      <span className={`px-sm py-xs rounded font-label-sm ${getStatusStyle(row.statusType)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  return (
    <div className="font-body-md text-body-md overflow-x-hidden min-h-screen bg-background text-on-surface">
        <style jsx global>{`
          .material-symbols-outlined {
              font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
        `}</style>
        
        {/* Navigation Drawer (SideNav) */}
        <aside className={`h-screen w-64 fixed left-0 top-0 z-50 bg-surface-container border-r border-surface-container-highest flex flex-col py-lg transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:flex shadow-2xl md:shadow-none`}>
          <div className="px-md mb-xl flex justify-between items-center">
            <h1 className="font-headline-md text-headline-md font-black text-primary">HRM Enterprise</h1>
            <button className="md:hidden text-on-surface" onClick={() => setIsSidebarOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-sm">
            {activeMenu.map((menu) => (
              <Link 
                key={menu.href}
                href={menu.href}
                className={`flex items-center justify-between gap-md px-md py-sm rounded-lg transition-all duration-200 ${
                  menu.href === '/dashboard' 
                    ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' 
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined">{menu.icon}</span>
                  <span className="font-body-md text-body-md">{menu.name}</span>
                </div>
                {menu.href === '/approvals' && (
                  <span className="w-5 h-5 bg-error text-on-error rounded-full flex items-center justify-center font-label-sm text-[10px] font-bold">3</span>
                )}
              </Link>
            ))}
          </nav>
          <div className="mt-auto px-md pt-lg border-t border-surface-container-highest">
            <div className="flex items-center gap-md">
              <div className="w-10 h-10 rounded-full border border-primary bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                {user?.name?.substring(0, 2).toUpperCase() || 'US'}
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface font-bold">{user?.name}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </aside>

        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        {/* Main Content Wrapper */}
        <main className="md:ml-64 min-h-screen bg-background pb-20">
          {/* Top App Bar */}
          <header className="w-full sticky top-0 z-40 bg-surface border-b border-surface-container-highest flex items-center justify-between px-md h-14">
            <div className="flex items-center gap-md">
              <button className="md:hidden text-primary active:scale-95 transition-transform" onClick={() => setIsSidebarOpen(true)}>
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h2 className="font-headline-md text-headline-md font-bold text-primary">Quản lý Nhân sự</h2>
            </div>
            <div className="flex items-center gap-md">
              <NotificationBell />
              <Link href="/settings" className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold overflow-hidden border border-primary hover:scale-105 transition-transform">
                {user?.name?.substring(0, 2).toUpperCase() || 'US'}
              </Link>
            </div>
          </header>

          {/* Dynamic Dashboard Content */}
          <div className="p-gutter lg:p-margin-desktop max-w-7xl mx-auto">
            {(!user || user.role === 'staff') ? renderStaffDashboard() : renderManagerDashboard()}
          </div>

          {/* Floating Action Button */}
          <button className="fixed bottom-lg right-lg w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 mb-16 md:mb-0">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
          </button>
        </main>

        {/* Global Bottom Navigation Component */}
        <BottomNav />
      </div>
  );
}
