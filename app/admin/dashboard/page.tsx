"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NotificationBell from "@/components/NotificationBell";

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (user && !["admin_company", "admin"].includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!isMounted) return <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">Đang tải...</div>;

  return (
    <div className="bg-background text-on-surface min-h-screen font-body-md flex flex-col pb-10">
      <style dangerouslySetInnerHTML={{ __html: `
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-card { background: rgba(23, 31, 51, 0.7); backdrop-filter: blur(8px); border: 1px solid rgba(144, 143, 160, 0.2); }
      ` }} />
      
      {/* Header */}
      <header className="w-full sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="transition-all duration-150 active:scale-95 text-primary lg:hidden">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div>
            <h1 className="text-headline-sm font-headline-sm text-primary font-bold">Tổng quan Kỹ thuật</h1>
            <p className="text-label-sm text-on-surface-variant leading-none">System Monitoring & Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border border-outline-variant cursor-pointer ml-2">
            <span className="text-on-primary-container font-bold text-[12px]">{user?.name?.substring(0, 2).toUpperCase() || 'AD'}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* System Stats (KPIs) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-5 flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <span className="material-symbols-outlined text-primary text-[28px]">group</span>
            </div>
            <div>
              <p className="text-[13px] text-outline font-bold mb-1">TỔNG TÀI KHOẢN</p>
              <h3 className="text-[24px] font-bold text-on-surface">1,248</h3>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-5 flex items-center gap-4 relative overflow-hidden group border-l-4 border-l-[#10B981]">
            <div className="absolute inset-0 bg-[#10B981]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/20 flex items-center justify-center border border-[#10B981]/30">
              <span className="material-symbols-outlined text-[#10B981] text-[28px] animate-pulse">wifi_tethering</span>
            </div>
            <div>
              <p className="text-[13px] text-outline font-bold mb-1">USER ĐANG ONLINE</p>
              <h3 className="text-[24px] font-bold text-on-surface">342</h3>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-5 flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-tertiary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 rounded-xl bg-tertiary/20 flex items-center justify-center border border-tertiary/30">
              <span className="material-symbols-outlined text-tertiary text-[28px]">dns</span>
            </div>
            <div>
              <p className="text-[13px] text-outline font-bold mb-1">SERVER STORAGE</p>
              <h3 className="text-[24px] font-bold text-on-surface">42.5<span className="text-[16px] text-outline ml-1">GB</span></h3>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-5 flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-error/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 rounded-xl bg-error/20 flex items-center justify-center border border-error/30">
              <span className="material-symbols-outlined text-error text-[28px]">report</span>
            </div>
            <div>
              <p className="text-[13px] text-outline font-bold mb-1">LỖI HỆ THỐNG (24H)</p>
              <h3 className="text-[24px] font-bold text-on-surface">3</h3>
            </div>
          </div>
        </section>

        {/* Traffic Chart & Server Load */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-xl p-6 flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-[18px] font-bold text-on-surface">Lưu lượng truy cập hệ thống (Traffic)</h2>
                <p className="text-[12px] text-outline">Đo lường requests/phút trong 12 giờ qua</p>
              </div>
              <select className="bg-surface-container border border-outline-variant text-[12px] rounded-lg px-3 py-1.5 focus:outline-none">
                <option>Hôm nay</option>
                <option>Tuần này</option>
              </select>
            </div>
            <div className="flex-1 flex items-end justify-between gap-1 w-full relative">
              {/* Fake Traffic Chart */}
              <div className="absolute top-1/4 w-full border-t border-outline-variant/30 border-dashed"></div>
              <div className="absolute top-2/4 w-full border-t border-outline-variant/30 border-dashed"></div>
              <div className="absolute top-3/4 w-full border-t border-outline-variant/30 border-dashed"></div>
              
              {[40, 25, 30, 45, 60, 80, 95, 85, 65, 50, 45, 35, 20, 15, 20, 30, 45, 75, 90, 85, 60, 40, 30, 25].map((val, i) => (
                <div key={i} className="w-full bg-primary/20 rounded-t-sm relative group hover:bg-primary/50 transition-colors" style={{ height: `${val}%` }}>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-surface-container px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap border border-outline-variant">
                    {val * 10} req/m
                  </div>
                  {/* Spike logic -> Error color if high */}
                  {val > 80 && <div className="absolute top-0 left-0 w-full h-full bg-error/50 rounded-t-sm"></div>}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-outline font-bold mt-3">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:59</span>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-6 flex flex-col space-y-6">
            <div>
              <h2 className="text-[18px] font-bold text-on-surface mb-1">Tải máy chủ (Server Load)</h2>
              <p className="text-[12px] text-outline">Tài nguyên hiện tại đang sử dụng</p>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-[13px] font-bold">
                  <span className="text-on-surface-variant flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">memory</span> CPU Usage</span>
                  <span className="text-primary">45%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[13px] font-bold">
                  <span className="text-on-surface-variant flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-tertiary">save</span> RAM Usage</span>
                  <span className="text-tertiary">78%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[13px] font-bold">
                  <span className="text-on-surface-variant flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-[#10B981]">network_check</span> Network Bandwidth</span>
                  <span className="text-[#10B981]">32%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: '32%' }}></div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-outline-variant/50 text-center">
              <button className="text-primary text-[13px] font-bold hover:underline flex items-center justify-center gap-1 w-full">
                Xem báo cáo chi tiết <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
