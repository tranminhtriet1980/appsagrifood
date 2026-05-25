"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default function PersonalHistoryPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    
    // Generate 30 days of mock data
    const generateMockData = () => {
      const data = [];
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Skip Sundays (0)
        if (date.getDay() === 0) continue;
        
        // Randomize status based on day index to make it look realistic
        let status = "Đúng giờ";
        let statusType = "normal";
        let checkIn = "07:55 AM";
        let checkOut = "17:05 PM";
        let totalHours = "8h 0m";

        if (i === 4 || i === 12) {
          status = "Đi muộn";
          statusType = "late";
          checkIn = "08:15 AM";
          checkOut = "17:00 PM";
          totalHours = "7h 45m";
        } else if (i === 15) {
          status = "Nghỉ phép";
          statusType = "leave";
          checkIn = "--:--";
          checkOut = "--:--";
          totalHours = "0h 0m";
        } else if (date.getDay() === 6) {
          // Saturday
          checkOut = "12:05 PM";
          totalHours = "4h 0m";
        }

        data.push({
          id: i,
          date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          weekday: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
          shift: date.getDay() === 6 ? "Ca Sáng (T7)" : "Ca Hành Chính",
          checkIn,
          checkOut,
          totalHours,
          status,
          statusType
        });
      }
      return data;
    };
    
    setHistoryData(generateMockData());
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

  const getStatusIcon = (statusType: string) => {
    switch (statusType) {
      case "normal": return "check_circle";
      case "late": return "schedule";
      case "leave": return "event_busy";
      default: return "info";
    }
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-on-surface">Đang tải...</div>;
  }

  return (
    <div className="font-body-md text-body-md overflow-x-hidden min-h-screen bg-background text-on-surface">
      <style jsx global>{`
        .glass-card { background: rgba(23, 31, 51, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(70, 69, 84, 0.5); }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        
        select option {
          background-color: #171f33; /* surface-container */
          color: #dae2fd; /* on-surface */
        }
      `}</style>
      
      {/* Top AppBar */}
      <header className="flex justify-between items-center w-full px-margin-mobile h-16 fixed top-0 z-50 bg-surface shadow-sm border-b border-surface-container-highest">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-primary active:scale-95 transition-transform flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Lịch sử cá nhân</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold overflow-hidden border border-primary shadow-sm">
            {user?.name?.substring(0, 2).toUpperCase() || 'US'}
          </div>
        </div>
      </header>

      <main className="pt-20 pb-24 px-margin-mobile flex flex-col gap-6 max-w-5xl mx-auto lg:p-margin-desktop lg:pt-24">
        
        {/* User Summary Header */}
        <section className="glass-card rounded-xl p-md flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 relative overflow-hidden shadow-lg shadow-black/20">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-4 z-10 w-full">
            <div className="h-16 w-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-headline-lg shadow-inner border border-primary/30">
              {user?.name?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="flex-1">
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">{user?.name || "Người dùng"}</h2>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{user?.role === 'staff' ? 'Nhân viên' : user?.role}</p>
            </div>
          </div>
          <div className="bg-surface-container-high rounded-lg p-3 flex flex-col items-center justify-center min-w-[120px] border border-surface-container-highest z-10 w-full sm:w-auto mt-2 sm:mt-0 shadow-inner">
            <span className="text-on-surface-variant font-label-sm uppercase tracking-widest mb-1">Tổng công</span>
            <span className="text-primary font-headline-lg font-bold leading-none">25.5</span>
          </div>
        </section>

        {/* Filters */}
        <section className="flex items-center justify-between gap-4">
          <div className="flex-1 bg-surface-container-highest rounded-lg px-4 py-2 flex items-center gap-2 border border-outline-variant/30 focus-within:border-primary/50 transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">calendar_month</span>
            <select className="bg-transparent border-none outline-none text-on-surface font-body-md w-full cursor-pointer appearance-none">
              <option value="30days">30 ngày gần nhất</option>
              <option value="thisMonth">Tháng này</option>
              <option value="lastMonth">Tháng trước</option>
            </select>
          </div>
          <button className="bg-primary/20 text-primary p-3 rounded-lg flex items-center justify-center border border-primary/30 hover:bg-primary/30 transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </section>

        {/* History List */}
        <section className="flex flex-col gap-4">
          {historyData.map((record) => (
            <div key={record.id} className="glass-card rounded-xl p-md flex flex-col gap-3 relative overflow-hidden group hover:border-primary/40 transition-colors shadow-md">
              <div className="flex justify-between items-center border-b border-surface-container-highest pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-headline-md text-on-surface font-bold tracking-tight">{record.date}</span>
                  <span className="font-label-sm text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded uppercase tracking-wider">{record.weekday}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-md font-label-sm text-[11px] flex items-center gap-1.5 uppercase font-bold tracking-wide ${getStatusStyle(record.statusType)}`}>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {getStatusIcon(record.statusType)}
                  </span>
                  {record.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-1">
                <div className="flex flex-col gap-1">
                  <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Ca làm việc</span>
                  <span className="font-body-lg text-on-surface font-medium">{record.shift}</span>
                </div>
                <div className="flex gap-6 md:gap-10 text-right">
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Check-in</span>
                    <span className="font-body-lg text-on-surface font-mono font-bold tracking-tighter">{record.checkIn}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Check-out</span>
                    <span className="font-body-lg text-on-surface font-mono font-bold tracking-tighter">{record.checkOut}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {historyData.length === 0 && (
            <div className="text-center py-10 text-on-surface-variant flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[48px] opacity-50">hourglass_empty</span>
              <p>Không có dữ liệu chấm công.</p>
            </div>
          )}
        </section>

      </main>

      {/* Global Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
