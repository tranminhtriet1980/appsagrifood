"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import BottomNav from "@/components/BottomNav";

export default function BranchAnalyticsDetails() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (user && !["manager", "director", "admin_company", "admin"].includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!isMounted) return <div className="min-h-screen bg-background flex items-center justify-center text-on-surface">Đang tải...</div>;

  return (
    <div className="bg-background text-on-surface min-h-screen pb-24 font-body-md flex flex-col">
      <style jsx global>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .chart-grid {
            background-image: linear-gradient(to right, rgba(45, 52, 73, 0.3) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(45, 52, 73, 0.3) 1px, transparent 1px);
            background-size: 40px 40px;
        }
      `}</style>

      {/* Top App Bar */}
      <header className="fixed top-0 right-0 left-0 z-50 bg-surface/90 backdrop-blur-md border-b border-surface-container-highest flex items-center justify-between px-4 h-14 w-full">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="material-symbols-outlined text-primary hover:bg-surface-container-high p-1 rounded-full transition-all">arrow_back</button>
          <h1 className="font-headline-md text-[18px] font-bold text-on-surface">Chi tiết: Emart Gò Vấp</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-lg font-bold text-[12px] hover:brightness-110 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="hidden sm:inline">Xuất</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-4 md:px-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Bento Scorecard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Overall Score */}
          <div className="col-span-1 bg-surface-container-high p-4 rounded-xl border border-surface-container-highest flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
            <div>
              <h3 className="text-[12px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Chỉ số Hiệu suất</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-[32px] font-bold text-primary leading-tight">94</span>
                <span className="text-[14px] text-on-surface-variant">/ 100</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[94%] rounded-full"></div>
              </div>
              <p className="text-[11px] text-primary mt-2 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> Cao hơn 2.4% so với tháng trước
              </p>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="col-span-1 md:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-2">
            <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container-highest hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-primary mb-1">event_available</span>
              <p className="text-[12px] font-bold text-on-surface-variant">Tỉ lệ đi làm</p>
              <p className="text-[20px] font-bold text-on-surface">95%</p>
              <p className="text-[10px] text-on-tertiary-fixed-variant bg-tertiary/20 px-1.5 py-0.5 rounded mt-1 inline-block">Mục tiêu: 98%</p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container-highest hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-primary mb-1">history_toggle_off</span>
              <p className="text-[12px] font-bold text-on-surface-variant">Kiểm soát OT</p>
              <p className="text-[20px] font-bold text-on-surface">Tốt</p>
              <p className="text-[10px] text-on-primary-fixed-variant bg-primary/20 px-1.5 py-0.5 rounded mt-1 inline-block">-12h so với định biên</p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container-highest hover:bg-surface-container transition-colors col-span-2 lg:col-span-1">
              <span className="material-symbols-outlined text-primary mb-1">groups</span>
              <p className="text-[12px] font-bold text-on-surface-variant">Nhân sự</p>
              <p className="text-[20px] font-bold text-on-surface">Ổn định</p>
              <p className="text-[10px] text-on-surface-variant/70 mt-1">Biến động: 0.8%</p>
            </div>
          </div>
        </div>

        {/* Trend Chart Section */}
        <section className="bg-surface-container-high rounded-xl border border-surface-container-highest overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-surface-container-highest bg-surface-container-highest/20">
            <h3 className="font-bold text-[16px] text-on-surface">Phân tích Xu hướng (30 ngày)</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span className="text-[11px] font-bold text-on-surface-variant">Đi làm</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                <span className="text-[11px] font-bold text-on-surface-variant">Giờ OT</span>
              </div>
            </div>
          </div>
          <div className="h-48 relative chart-grid p-4">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <path className="text-primary opacity-80" d="M0 40 Q 50 20, 100 60 T 200 40 T 300 80 T 400 30 T 500 50 T 600 20 T 700 40 T 800 60 T 900 30 T 1000 50" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
              <path className="text-tertiary opacity-80" d="M0 120 Q 50 140, 100 110 T 200 130 T 300 90 T 400 150 T 500 120 T 600 140 T 700 110 T 800 130 T 900 100 T 1000 140" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
            </svg>
            <div className="absolute bottom-1 left-4 right-4 flex justify-between text-[10px] text-on-surface-variant/50">
              <span>1 Thg 10</span>
              <span>10 Thg 10</span>
              <span>20 Thg 10</span>
              <span>30 Thg 10</span>
            </div>
          </div>
        </section>

        {/* Personnel Status Grid */}
        <section className="space-y-3">
          <h3 className="font-bold text-[16px] text-on-surface px-1">Trạng thái Nhân sự (120 NV)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-surface-container-low p-3 rounded-xl border-l-4 border-l-primary flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[12px] font-bold text-on-surface-variant">Hiện diện</p>
                <p className="text-[20px] font-bold text-on-surface">112</p>
              </div>
              <span className="material-symbols-outlined text-primary/30 text-[28px]">check_circle</span>
            </div>
            <div className="bg-surface-container-low p-3 rounded-xl border-l-4 border-l-tertiary flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[12px] font-bold text-on-surface-variant">Đi muộn</p>
                <p className="text-[20px] font-bold text-on-surface">3</p>
              </div>
              <span className="material-symbols-outlined text-tertiary/30 text-[28px]">schedule</span>
            </div>
            <div className="bg-surface-container-low p-3 rounded-xl border-l-4 border-l-secondary flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[12px] font-bold text-on-surface-variant">Nghỉ ốm</p>
                <p className="text-[20px] font-bold text-on-surface">2</p>
              </div>
              <span className="material-symbols-outlined text-secondary/30 text-[28px]">medical_services</span>
            </div>
            <div className="bg-surface-container-low p-3 rounded-xl border-l-4 border-l-error flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[12px] font-bold text-on-surface-variant">Vắng mặt</p>
                <p className="text-[20px] font-bold text-on-surface">3</p>
              </div>
              <span className="material-symbols-outlined text-error/30 text-[28px]">error</span>
            </div>
          </div>
        </section>

        {/* Critical Anomalies Table */}
        <section className="bg-surface-container-high rounded-xl border border-surface-container-highest overflow-hidden mt-6">
          <div className="p-4 flex items-center gap-2 border-b border-surface-container-highest bg-surface-container-highest/30">
            <span className="material-symbols-outlined text-error">warning</span>
            <h3 className="font-bold text-[16px] text-on-surface">Bất thường Cần xử lý</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-container-highest">
                  <th className="px-4 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Nhân viên</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Vấn đề</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Tần suất</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest">
                <tr className="hover:bg-surface-container-highest/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary border border-primary/20">NA</div>
                      <div>
                        <p className="text-[14px] text-on-surface font-bold">Nguyễn Văn An</p>
                        <p className="text-[11px] text-on-surface-variant">ID: #NV1002</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[14px] text-on-surface">Đi muộn liên tiếp</td>
                  <td className="px-4 py-3">
                    <span className="bg-error-container text-on-error-container px-2 py-1 rounded-full text-[11px] font-bold">4 lần / tuần</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-[12px] font-bold hover:scale-105 active:scale-95 transition-all whitespace-nowrap">1-on-1</button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-highest/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary border border-primary/20">TB</div>
                      <div>
                        <p className="text-[14px] text-on-surface font-bold">Trần Thị Bình</p>
                        <p className="text-[11px] text-on-surface-variant">ID: #NV1245</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[14px] text-on-surface">Thiếu giờ công định kỳ</td>
                  <td className="px-4 py-3">
                    <span className="bg-tertiary-container text-on-tertiary-container px-2 py-1 rounded-full text-[11px] font-bold">-12h tích lũy</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-[12px] font-bold hover:scale-105 active:scale-95 transition-all whitespace-nowrap">1-on-1</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-surface-container-highest/10 flex justify-center">
            <button className="text-primary text-[12px] font-bold hover:underline">Xem tất cả 12 bất thường</button>
          </div>
        </section>
      </main>
    </div>
  );
}
