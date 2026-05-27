"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

const EMPLOYEES_MOCK = [
  {
    id: "NV001",
    name: "Nguyễn Văn A",
    location: "Emart Gò Vấp",
    timeRange: "08:00 - 17:00",
    status: "ontime",
    avatar: "https://i.pravatar.cc/150?u=1",
    isOnline: true,
  },
  {
    id: "NV002",
    name: "Lê Thị Tú",
    location: "Lotte Mart Q7",
    timeRange: "08:00 - 17:00",
    status: "late",
    avatar: "https://i.pravatar.cc/150?u=2",
    isOnline: true,
  },
  {
    id: "NV003",
    name: "Trần Văn B",
    location: "Emart Gò Vấp",
    timeRange: "08:00 - 17:00",
    status: "missing",
    avatar: "https://i.pravatar.cc/150?u=3",
    isOnline: false,
  },
  {
    id: "NV004",
    name: "Phạm Hoàng C",
    location: "Kho trung tâm",
    timeRange: "08:00 - 17:00",
    status: "ontime",
    avatar: "https://i.pravatar.cc/150?u=4",
    isOnline: true,
  }
];

type TabType = "Hôm nay" | "Tuần" | "Tháng";

export default function ManagerAttendancePage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("Hôm nay");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-background flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-[#0b1326] text-on-surface font-body-md flex flex-col pb-24">
      <style dangerouslySetInnerHTML={{ __html: `
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-card { background: linear-gradient(135deg, rgba(23, 31, 51, 0.8) 0%, rgba(11, 19, 38, 0.9) 100%); backdrop-filter: blur(16px); border: 1px solid rgba(144, 143, 160, 0.2); box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0b1326]/90 backdrop-blur-md border-b border-white/5 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="text-on-surface-variant hover:text-white transition-colors" onClick={() => router.push('/dashboard')}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-headline-md text-[18px] font-bold text-on-surface">Quản lý Chấm công</h1>
        </div>
        <div className="relative cursor-pointer" onClick={() => router.push('/settings')}>
          <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold border-2 border-primary/30">
            {user?.name?.substring(0, 2).toUpperCase() || 'MG'}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0b1326] rounded-full"></div>
        </div>
      </header>

      {/* TOP CONTROLS */}
      <div className="px-4 pt-4 space-y-4 max-w-4xl mx-auto w-full">
        {/* Dropdown Địa điểm */}
        <button className="w-full flex items-center justify-between bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
            <span className="font-label-md text-[14px]">Tất cả địa điểm</span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
        </button>

        {/* Toggle Tabs */}
        <div className="flex bg-surface-container-highest p-1 rounded-xl w-full">
          {["Hôm nay", "Tuần", "Tháng"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`flex-1 py-2 rounded-lg font-bold text-[13px] transition-all ${
                activeTab === tab
                  ? "bg-primary text-on-primary shadow-lg"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Xuất Báo Cáo */}
        <button className="w-full flex items-center justify-center gap-2 bg-surface-container-high hover:bg-surface-container-highest border border-white/10 rounded-xl py-3 text-on-surface font-bold text-[14px] active:scale-[0.98] transition-transform">
          <span className="material-symbols-outlined text-primary text-[20px]">download</span>
          Xuất báo cáo
        </button>
      </div>

      {/* THỐNG KÊ KPI (2x2 Grid) */}
      <div className="px-4 py-6 grid grid-cols-2 gap-3 max-w-4xl mx-auto w-full">
        {/* Tổng quân số */}
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-1 border-white/5 relative overflow-hidden">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-[16px]">group</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Tổng quân số</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-headline-lg text-[28px] font-bold text-on-surface">24</span>
          </div>
        </div>

        {/* Đã check-in */}
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-1 border-white/5 relative overflow-hidden">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-[16px]">door_front</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Đã Check-in</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-headline-lg text-[28px] font-bold text-green-400">18</span>
          </div>
        </div>

        {/* Đi muộn */}
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-1 border-white/5 relative overflow-hidden border-l-4 border-l-orange-400">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Đi muộn</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-headline-lg text-[28px] font-bold text-orange-400">2</span>
          </div>
        </div>

        {/* Chưa check-in */}
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-1 border-white/5 relative overflow-hidden border-l-4 border-l-error">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-[16px]">person_off</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Chưa Check-in</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-headline-lg text-[28px] font-bold text-error">4</span>
          </div>
        </div>
      </div>

      {/* DANH SÁCH CHI TIẾT ĐỘI NGŨ */}
      <div className="px-4 pb-4 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-md text-[18px] font-bold text-on-surface">Chi tiết đội ngũ</h2>
          <button className="flex items-center gap-1 text-primary text-[13px] font-bold hover:bg-primary/10 px-2 py-1 rounded transition-colors">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Lọc nâng cao
          </button>
        </div>

        <div className="space-y-3">
          {EMPLOYEES_MOCK.map((emp) => (
            <div key={emp.id} className="glass-card rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  <img src={emp.avatar} alt={emp.name} className="w-11 h-11 rounded-full object-cover border border-white/10" />
                  {emp.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#131b2e] rounded-full"></div>
                  )}
                </div>
                {/* Info */}
                <div className="flex flex-col">
                  <span className="font-bold text-[14px] text-on-surface">{emp.name}</span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5">
                    {emp.id} • {emp.location}
                  </span>
                </div>
              </div>
              {/* Right: Time & Badge */}
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[11px] text-on-surface-variant font-medium">{emp.timeRange}</span>
                {emp.status === "ontime" && (
                  <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                    Đúng giờ
                  </span>
                )}
                {emp.status === "late" && (
                  <span className="bg-orange-400/10 text-orange-400 border border-orange-400/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                    Đi muộn
                  </span>
                )}
                {emp.status === "missing" && (
                  <span className="bg-error/10 text-error border border-error/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                    Chưa check-in
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB: Floating Action Button */}
      <button className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-[0_4px_20px_rgba(147,51,234,0.4)] active:scale-90 transition-transform z-40">
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>

      <BottomNav />
    </div>
  );
}
