"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

interface Rec {
  id: number;
  workDate: string;
  site: string | null;
  shift: string | null;
  checkIn: string | null;
  checkOut: string | null;
  lateMinutes: number;
  earlyMinutes: number;
  status: string;
  distanceIn: number | null;
  distanceOut: number | null;
}

interface Summary {
  presentDays: number;
  lateDays: number;
  earlyLeaveDays: number;
  totalLateMinutes: number;
}

const fmtTime = (iso: string | null) => {
  if (!iso) return "--:--";
  return new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });

const fmtWeekday = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", { weekday: "short", timeZone: "UTC" });

export default function PersonalHistoryPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<Rec[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    setIsMounted(true);
    (async () => {
      try {
        const res = await fetch("/api/attendance/history");
        if (res.ok) {
          const data = await res.json();
          setRecords(data.records || []);
          setSummary(data.summary || null);
        }
      } catch (e) {
        console.error("Lỗi tải lịch sử:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-on-surface">Đang tải...</div>;
  }

  return (
    <div className="font-body-md text-body-md overflow-x-hidden min-h-screen bg-background text-on-surface">
      <style jsx global>{`
        .glass-card { background: rgba(23, 31, 51, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(70, 69, 84, 0.5); }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>

      {/* AppBar */}
      <header className="flex justify-between items-center w-full px-4 h-16 fixed top-0 z-50 bg-surface shadow-sm border-b border-surface-container-highest">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-primary active:scale-95 transition-transform">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Lịch sử chấm công</h1>
        </div>
        <div className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold border border-primary">
          {user?.name?.substring(0, 2).toUpperCase() || "US"}
        </div>
      </header>

      <main className="pt-20 pb-24 px-4 flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Tổng hợp tháng này */}
        <section className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-xl p-4 flex flex-col items-center">
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider">Ngày công</span>
            <span className="text-primary text-[26px] font-bold leading-none mt-1">{summary?.presentDays ?? 0}</span>
          </div>
          <div className="glass-card rounded-xl p-4 flex flex-col items-center">
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider">Đi muộn</span>
            <span className="text-orange-400 text-[26px] font-bold leading-none mt-1">{summary?.lateDays ?? 0}</span>
          </div>
          <div className="glass-card rounded-xl p-4 flex flex-col items-center">
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider">Về sớm</span>
            <span className="text-error text-[26px] font-bold leading-none mt-1">{summary?.earlyLeaveDays ?? 0}</span>
          </div>
        </section>
        {summary && summary.totalLateMinutes > 0 && (
          <p className="text-center text-[13px] text-on-surface-variant -mt-2">
            Tổng thời gian đi muộn tháng này: <span className="text-orange-400 font-bold">{summary.totalLateMinutes} phút</span>
          </p>
        )}

        {/* Danh sách */}
        <section className="flex flex-col gap-4">
          {loading && <div className="text-center py-10 text-primary">Đang tải dữ liệu...</div>}

          {!loading && records.map((r) => (
            <div key={r.id} className="glass-card rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-surface-container-highest pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-headline-md text-on-surface font-bold">{fmtDate(r.workDate)}</span>
                  <span className="text-[11px] text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded uppercase tracking-wider">{fmtWeekday(r.workDate)}</span>
                </div>
                <div className="flex gap-1.5">
                  {r.lateMinutes > 0 && (
                    <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-orange-400/15 text-orange-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>Trễ {r.lateMinutes}p
                    </span>
                  )}
                  {r.earlyMinutes > 0 && (
                    <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-error/15 text-error flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">logout</span>Sớm {r.earlyMinutes}p
                    </span>
                  )}
                  {r.lateMinutes === 0 && r.earlyMinutes === 0 && r.checkIn && (
                    <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-status-success/15 text-status-success flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>Đúng giờ
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[11px] text-on-surface-variant uppercase tracking-wider">Site</span>
                  <span className="text-on-surface font-medium truncate">{r.site || "—"}</span>
                </div>
                <div className="flex gap-6 text-right shrink-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-on-surface-variant uppercase tracking-wider">Vào</span>
                    <span className="font-mono font-bold text-status-success">{fmtTime(r.checkIn)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-on-surface-variant uppercase tracking-wider">Ra</span>
                    <span className="font-mono font-bold text-primary">{fmtTime(r.checkOut)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!loading && records.length === 0 && (
            <div className="text-center py-10 text-on-surface-variant flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[48px] opacity-50">hourglass_empty</span>
              <p>Chưa có dữ liệu chấm công.</p>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
