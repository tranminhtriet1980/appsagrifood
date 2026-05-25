"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

type ViewMode = 'weekly' | 'monthly';

const LOCATIONS = [
  "Tất cả địa điểm",
  "Emart Gò Vấp",
  "Lotte Mart Quận 7",
  "Cửa hàng Sagrifood Q1",
  "Kho trung tâm"
];

const MOCK_DATA: Record<string, any> = {
  "Tất cả địa điểm": {
    total: 128, working: 42, absent: 5, emptyShifts: 3,
    branches: [
      { name: "Emart Gò Vấp", cur: 19, max: 24 },
      { name: "Lotte Mart Q7", cur: 12, max: 15 },
      { name: "Cửa hàng Sagrifood Q1", cur: 6, max: 8 },
      { name: "Kho trung tâm", cur: 5, max: 5 }
    ]
  },
  "Emart Gò Vấp": {
    total: 24, working: 19, absent: 1, emptyShifts: 1,
    branches: [{ name: "Emart Gò Vấp", cur: 19, max: 24 }]
  },
  "Lotte Mart Quận 7": {
    total: 15, working: 12, absent: 0, emptyShifts: 0,
    branches: [{ name: "Lotte Mart Q7", cur: 12, max: 15 }]
  },
  "Cửa hàng Sagrifood Q1": {
    total: 8, working: 6, absent: 0, emptyShifts: 2,
    branches: [{ name: "Cửa hàng Sagrifood Q1", cur: 6, max: 8 }]
  },
  "Kho trung tâm": {
    total: 5, working: 5, absent: 0, emptyShifts: 0,
    branches: [{ name: "Kho trung tâm", cur: 5, max: 5 }]
  }
};

const DATES = [
  { day: "T7", date: "23", active: false },
  { day: "CN", date: "24", active: false },
  { day: "T2", date: "25", active: true },
  { day: "T3", date: "26", active: false },
  { day: "T4", date: "27", active: false },
  { day: "T5", date: "28", active: false },
  { day: "T6", date: "29", active: false },
];

export default function SystemMonitorPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [location, setLocation] = useState("Tất cả địa điểm");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeDate, setActiveDate] = useState("25");

  useEffect(() => {
    setIsMounted(true);
    if (user && !["manager", "director", "admin_company", "admin"].includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!isMounted) return <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">Đang tải...</div>;

  const currentStats = MOCK_DATA[location] || MOCK_DATA["Tất cả địa điểm"];

  // Giả lập xáo trộn nhẹ số lượng dựa trên ngày (chỉ để demo có tương tác)
  const stats = {
    ...currentStats,
    working: currentStats.working - (activeDate === "25" ? 0 : 2),
    absent: currentStats.absent + (activeDate === "25" ? 0 : 1)
  };

  return (
    <div className="font-body-md text-body-md min-h-screen bg-background text-on-surface overflow-x-hidden flex flex-col">
      <style jsx global>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-card { background: linear-gradient(135deg, rgba(23, 31, 51, 0.8) 0%, rgba(11, 19, 38, 0.9) 100%); backdrop-filter: blur(16px); border: 1px solid rgba(144, 143, 160, 0.2); box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-pulse-soft { animation: pulse-soft 3s infinite ease-in-out; }
        @keyframes pulse-soft { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.02); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>

      {/* Top App Bar */}
      <header className="w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-surface-container-highest flex items-center justify-between px-md h-16">
        <div className="flex items-center gap-sm">
          <button onClick={() => router.push('/dashboard')} className="p-2 rounded-full hover:bg-surface-variant transition-colors text-primary active:scale-95">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface hidden sm:block">Giám sát Hệ thống</h1>
        </div>
        <div className="flex items-center gap-md">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold border-2 border-primary/30">
              {user?.name?.substring(0, 2).toUpperCase() || 'MG'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-32">
        {/* Control Bar */}
        <div className="bg-surface-container-low px-md py-sm border-b border-surface-container-highest flex flex-col gap-sm md:flex-row md:items-center justify-between sticky top-16 z-40">
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-md px-md py-2.5 bg-surface-container/40 backdrop-blur-md border border-primary/20 rounded-xl hover:bg-surface-container-highest transition-all w-full md:w-auto min-w-[200px] justify-between"
            >
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-[20px] text-primary">location_on</span>
                <span className="font-label-md text-label-md text-on-surface">{location}</span>
              </div>
              <span className="material-symbols-outlined text-[18px] opacity-70">arrow_drop_down</span>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-surface-container-highest border border-outline/20 rounded-xl shadow-2xl z-50 overflow-hidden">
                {LOCATIONS.map(loc => (
                  <div key={loc} className="p-3 hover:bg-primary/10 cursor-pointer text-label-md transition-colors text-on-surface" onClick={() => { setLocation(loc); setIsDropdownOpen(false); }}>
                    {loc}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex bg-surface-container-highest p-1 rounded-xl w-full md:w-auto">
            <button 
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold text-label-md transition-all flex items-center justify-center gap-2 ${viewMode === 'weekly' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => setViewMode('weekly')}
            >
              <span className="material-symbols-outlined text-[18px]">view_week</span> Lịch Tuần
            </button>
            <button 
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold text-label-md transition-all flex items-center justify-center gap-2 ${viewMode === 'monthly' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => setViewMode('monthly')}
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span> Lịch Tháng
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md px-md py-lg bg-surface-container-lowest border-b border-surface-container-highest">
          <div className="glass-card p-md rounded-2xl flex flex-col gap-1 border-white/5">
            <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider">Tổng quân số</span>
            <div className="flex items-baseline gap-2">
              <span className="text-headline-lg font-bold text-on-surface">{stats.total}</span>
              <span className="text-label-sm text-on-surface-variant">Nhân sự</span>
            </div>
          </div>
          <div className="glass-card p-md rounded-2xl flex flex-col gap-1 border-green-500/20">
            <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider">Đang làm việc</span>
            <div className="flex items-baseline gap-2">
              <span className="text-headline-lg font-bold text-green-400">{stats.working}</span>
              <span className="text-label-sm text-green-400/80">Hoạt động</span>
            </div>
          </div>
          <div className="glass-card p-md rounded-2xl flex flex-col gap-1 border-error/20">
            <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider">Vắng mặt</span>
            <div className="flex items-baseline gap-2">
              <span className="text-headline-lg font-bold text-error">{stats.absent}</span>
              <span className="text-label-sm text-error/80">Báo cáo</span>
            </div>
          </div>
          <div className="glass-card p-md rounded-2xl flex flex-col gap-1 border-tertiary/20">
            <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider">Ca trống</span>
            <div className="flex items-baseline gap-2">
              <span className="text-headline-lg font-bold text-tertiary">{stats.emptyShifts}</span>
              <span className="text-label-sm text-tertiary/80">Cần gấp</span>
            </div>
          </div>
        </div>

        {viewMode === 'weekly' && (
          <div className="animate-fade-in">
            {/* Calendar Strip */}
            <div className="bg-surface pt-md pb-xs px-md">
              <div className="flex items-center justify-between mb-sm max-w-4xl mx-auto">
                <h2 className="font-label-md text-label-md font-bold uppercase tracking-[0.1em] text-primary/80">Tháng 05, 2026</h2>
                <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">calendar_month</button>
              </div>
              <div className="flex overflow-x-auto gap-3 hide-scrollbar pb-md max-w-4xl mx-auto cursor-grab active:cursor-grabbing">
                {DATES.map(d => (
                  <div 
                    key={d.date} 
                    onClick={() => setActiveDate(d.date)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center gap-xs w-[52px] h-[72px] rounded-xl transition-all cursor-pointer ${
                      activeDate === d.date 
                        ? 'bg-primary text-on-primary font-bold shadow-[0_0_20px_rgba(192,193,255,0.3)] transform scale-105' 
                        : 'text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="font-label-sm text-[10px] uppercase">{d.day}</span>
                    <span className="font-headline-md text-headline-md">{d.date}</span>
                    {activeDate === d.date && <div className="w-1.5 h-1.5 bg-on-primary rounded-full mt-1"></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Branches Status */}
            <div className="px-md mt-lg max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-md">
                <div className="flex items-center gap-sm">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Trạng thái nhân sự</h2>
                  <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-green-400 uppercase">Live</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {stats.branches.map((b: any) => {
                  const pct = Math.round((b.cur / b.max) * 100);
                  return (
                    <div key={b.name} className="glass-card p-md rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-label-md font-bold">{b.name}</span>
                        <span className="text-label-sm text-primary">{b.cur}/{b.max}</span>
                      </div>
                      <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shift Details */}
            <div className="px-md pb-md pt-lg space-y-lg max-w-4xl mx-auto w-full">
              <div className="flex items-center justify-between mb-sm">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Thứ Hai, {activeDate}/05/2026</h2>
                <span className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-label-sm font-bold text-primary">{stats.working} Nhân sự</span>
              </div>

              {/* Shift Card 1 */}
              <section className="glass-card rounded-2xl overflow-hidden border border-primary/20">
                <div className="px-md py-md flex flex-col gap-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                      <div className="p-xs bg-primary/20 rounded-lg">
                        <span className="material-symbols-outlined text-primary text-[20px]">light_mode</span>
                      </div>
                      <div>
                        <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-primary">Ca Sáng (05:00 - 13:00)</h3>
                        <p className="text-[10px] text-on-surface-variant/70 font-medium">Địa điểm: {location === 'Tất cả địa điểm' ? 'Emart Gò Vấp' : location}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-[10px] font-bold uppercase">Đang diễn ra</span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[65%] rounded-full shadow-[0_0_8px_rgba(192,193,255,0.6)]"></div>
                  </div>
                </div>
                <div className="divide-y divide-surface-container-highest/50 border-t border-white/5">
                  <div className="p-md flex items-center justify-between hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-md">
                      <div className="relative w-12 h-12 rounded-xl bg-secondary-container flex justify-center items-center font-bold text-lg text-on-secondary-container border border-white/10">
                        NA
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#131b2e] rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-body-md text-body-md font-bold text-on-surface">Nguyễn Văn A</p>
                        <div className="flex items-center gap-2">
                          <p className="font-label-sm text-label-sm text-primary/80">Cửa hàng trưởng</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-sm items-center">
                      <span className="text-[10px] font-bold text-green-400 uppercase bg-green-500/10 px-2 py-1 rounded hidden sm:block">Vừa check-in</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Shift Card 2 (Empty) */}
              <section className="glass-card rounded-2xl overflow-hidden border border-white/5">
                <div className="px-md py-md flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <div className="p-xs bg-tertiary/20 rounded-lg">
                      <span className="material-symbols-outlined text-tertiary text-[20px]">wb_twilight</span>
                    </div>
                    <div>
                      <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-tertiary">Ca Chiều (13:00 - 22:00)</h3>
                      <p className="text-[10px] text-on-surface-variant/70 font-medium">Địa điểm: Lotte Mart Quận 7</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant border border-white/10 rounded text-[10px] font-bold uppercase">Sắp tới</span>
                </div>
                <div className="p-md border-t border-white/5">
                  <div className="relative group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-2 border-dashed border-primary/20 rounded-xl bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all cursor-pointer animate-pulse-soft">
                    <div className="flex items-center gap-md">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(192,193,255,0.2)]">
                        <span className="material-symbols-outlined text-[28px]">person_add</span>
                      </div>
                      <div>
                        <p className="font-body-md text-body-md font-bold text-primary">Ca trống: Nhân viên Thu ngân</p>
                        <p className="font-label-sm text-[10px] text-tertiary font-bold uppercase tracking-wide mt-1">Cần điều động gấp</p>
                      </div>
                    </div>
                    <button className="bg-primary text-on-primary px-4 py-2 sm:py-1.5 rounded-lg font-bold text-label-sm shadow-lg shadow-primary/20 active:scale-95 transition-all w-full sm:w-auto">
                      Gán nhân sự
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {viewMode === 'monthly' && (
          <div className="px-md pb-md pt-lg max-w-4xl mx-auto animate-fade-in">
             <div className="text-center py-16 bg-surface-container rounded-2xl border border-surface-container-highest border-dashed">
                <span className="material-symbols-outlined text-[64px] opacity-30 mb-4">grid_view</span>
                <p className="font-body-lg text-on-surface">Lịch tháng đang được cập nhật</p>
                <p className="font-label-sm text-on-surface-variant mt-2">Vui lòng sử dụng chế độ Lịch Tuần để xem chi tiết.</p>
              </div>
          </div>
        )}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 md:bottom-6 left-0 right-0 px-md pointer-events-none z-50">
        <div className="max-w-4xl mx-auto flex gap-3 pointer-events-auto">
          <button className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 bg-error text-on-error-container h-14 sm:h-12 rounded-2xl sm:rounded-xl font-bold font-label-md sm:text-body-md shadow-xl hover:brightness-110 active:scale-95 transition-all border border-error/20">
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">bolt</span>
            <span className="text-[11px] sm:text-[14px]">Điều động</span>
          </button>
          <button className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 bg-primary text-on-primary h-14 sm:h-12 rounded-2xl sm:rounded-xl font-bold font-label-md sm:text-body-md shadow-[0_8px_24px_rgba(192,193,255,0.25)] hover:brightness-110 active:scale-95 transition-all border border-white/10">
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">add_circle</span>
            <span className="text-[11px] sm:text-[14px]">Tạo ca</span>
          </button>
          <button className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 bg-surface-container-high text-on-surface h-14 sm:h-12 rounded-2xl sm:rounded-xl font-bold font-label-md sm:text-body-md shadow-xl hover:bg-surface-container-highest active:scale-95 transition-all border border-white/5">
            <span className="material-symbols-outlined text-[20px] sm:text-[24px] text-tertiary">assessment</span>
            <span className="text-[11px] sm:text-[14px]">Báo cáo</span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
