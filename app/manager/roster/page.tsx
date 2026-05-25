"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { useRosterStore } from '@/store/useRosterStore';

// --- MOCK DATA ---
const WEEK_DAYS = [
  { day: 'T2', date: '25/05' },
  { day: 'T3', date: '26/05' },
  { day: 'T4', date: '27/05' },
  { day: 'T5', date: '28/05' },
  { day: 'T6', date: '29/05' },
  { day: 'T7', date: '30/05' },
  { day: 'CN', date: '31/05' },
];

const STAFF_LIST = [
  { id: 's1', name: 'Nguyễn Văn A', role: 'Bán hàng', avatar: 'NA' },
  { id: 's2', name: 'Trần Thị B', role: 'Thu ngân', avatar: 'TB' },
  { id: 's3', name: 'Lê Văn C', role: 'Bán hàng', avatar: 'LC' },
  { id: 's4', name: 'Phạm Thị D', role: 'Nhân viên Kho', avatar: 'PD' },
  { id: 's5', name: 'Đặng Văn E', role: 'Bán hàng', avatar: 'DE' },
  { id: 's6', name: 'Vũ Thị F', role: 'Thu ngân', avatar: 'VF' },
];

export default function ManagerRosterPage() {
  const router = useRouter();
  const { matrixData, offDayRequests, setShift, publishRoster, removeShift } = useRosterStore();
  
  // Toasts
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const displayToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handlePublishRoster = () => {
    publishRoster();
    displayToast("Đã công bố lịch thành công! Trạng thái OFF đã được khóa và đồng bộ tới nhân viên.");
  };

  // Tính toán số lượng request 'off' mỗi ngày
  const requestsPerDay = useMemo(() => {
    const counts: Record<string, number> = {};
    WEEK_DAYS.forEach(d => counts[d.date] = 0);
    
    // Đếm từ Zustand offDayRequests
    Object.values(offDayRequests).forEach(date => {
       counts[date] = (counts[date] || 0) + 1;
    });
    return counts;
  }, [offDayRequests]);

  const THRESHOLD_30_PERCENT = Math.ceil(STAFF_LIST.length * 0.3); // 30% quân số

  return (
    <div className="flex-1 min-h-screen bg-[#0b1326] pb-32 animate-fade-in">
      <header className="w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-surface-container-highest flex items-center justify-between px-md h-16">
        <div className="flex items-center gap-sm">
          <button className="md:hidden p-sm rounded-full text-primary hover:bg-surface-variant active:scale-90 transition-all" onClick={() => router.push('/dashboard')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Quản Lý Xếp Ca</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePublishRoster} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 transition-colors active:scale-95 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[18px]">publish</span>
            <span className="hidden sm:inline">[ Công Bố Lịch ]</span>
            <span className="sm:hidden">Công bố</span>
          </button>
        </div>
      </header>

      <div className="px-md mt-6 max-w-[1400px] mx-auto space-y-6">
        {/* THỐNG KÊ & CHÚ THÍCH */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col gap-1">
             <span className="text-[10px] text-on-surface-variant font-bold uppercase">Tổng nhân sự</span>
             <span className="text-[20px] font-bold text-primary">{STAFF_LIST.length} người</span>
           </div>
           <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col gap-1 col-span-2 md:col-span-3">
             <span className="text-[10px] text-on-surface-variant font-bold uppercase mb-1">Chú thích trạng thái</span>
             <div className="flex flex-wrap gap-4 mt-1 text-[12px] font-bold text-on-surface-variant">
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/30"></div> Ca Sáng
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/30"></div> Ca Chiều
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded bg-slate-900/30 border-2 border-dashed border-slate-800 flex items-center justify-center">
                     <span className="text-[8px] text-slate-500">OFF</span>
                   </div> 
                   OFF Chính Thức
                </div>
                <div className="flex items-center gap-2">
                   <span className="material-symbols-outlined text-tertiary text-[18px]">flight_takeoff</span>
                   Nguyện vọng xin nghỉ
                </div>
             </div>
           </div>
        </div>

        {/* BẢNG LỊCH MA TRẬN MANAGER */}
        <div className="glass-card rounded-xl overflow-x-auto hide-scrollbar border border-white/10">
          <table className="w-full min-w-[1000px] border-collapse table-fixed">
            <thead>
              <tr>
                <th className="w-[18%] p-4 border-b border-r border-white/5 bg-surface-container-lowest text-left">
                  <span className="text-[12px] text-on-surface-variant uppercase font-bold tracking-widest">Nhân sự</span>
                </th>
                {WEEK_DAYS.map((day, idx) => {
                  const requests = requestsPerDay[day.date];
                  const isWarning = requests >= THRESHOLD_30_PERCENT;
                  
                  return (
                    <th key={idx} className="w-[11.7%] p-3 text-center border-b border-r last:border-r-0 border-white/5 bg-surface-container-lowest relative group">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant">{day.day}</span>
                        <span className="text-[16px] font-bold text-on-surface">{day.date}</span>
                      </div>
                      
                      {/* BỘ ĐẾM SỐ NGƯỜI XIN NGHỈ & CẢNH BÁO */}
                      {requests > 0 && (
                        <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container border border-white/5">
                           <span className="material-symbols-outlined text-[12px] text-tertiary">flight_takeoff</span>
                           <span className="text-tertiary">{requests} xin nghỉ</span>
                        </div>
                      )}
                      {isWarning && (
                         <>
                           <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-status-warning rounded-full animate-ping"></div>
                           <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-status-warning rounded-full"></div>
                           
                           {/* Tooltip Hover */}
                           <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 w-[200px] pointer-events-none">
                              <div className="bg-status-warning/20 border border-status-warning/40 text-status-warning text-[10px] font-bold px-2 py-1 rounded-md shadow-lg text-center backdrop-blur-md">
                                Có {requests} nhân viên xin nghỉ!<br/>Vượt {Math.round((requests/STAFF_LIST.length)*100)}% quân số.
                              </div>
                           </div>
                         </>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {STAFF_LIST.map((staff) => (
                <tr key={staff.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3 border-r border-b border-white/5 align-middle bg-surface-container-lowest/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-[14px]">
                        {staff.avatar}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[14px] text-on-surface truncate max-w-[120px]">{staff.name}</span>
                        <span className="text-[11px] text-on-surface-variant truncate max-w-[120px]">{staff.role}</span>
                      </div>
                    </div>
                  </td>
                  
                  {WEEK_DAYS.map((day) => {
                    const cellKey = `${staff.id}_${day.date}`;
                    const cellData = matrixData[cellKey];
                    const isRequestOff = offDayRequests[staff.id] === day.date;

                    return (
                      <td key={cellKey} className="p-2 border-r last:border-r-0 border-b border-white/5 align-top h-[110px] relative group/cell">
                        
                        {/* HIỂN THỊ DỮ LIỆU Ô */}
                        {!cellData ? (
                           <div className="w-full h-full rounded-xl bg-transparent border border-transparent border-dashed group-hover/cell:border-white/10 transition-colors flex items-center justify-center">
                              <span className="text-[10px] text-white/20 uppercase font-bold hidden group-hover/cell:block">Trống</span>
                           </div>
                        ) : cellData.shift === 'Sáng' ? (
                          <div className="w-full h-full p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 flex flex-col items-center justify-center">
                            <span className="text-[13px] font-bold text-orange-400 uppercase tracking-wider">Ca Sáng</span>
                          </div>
                        ) : cellData.shift === 'Chiều' ? (
                          <div className="w-full h-full p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 flex flex-col items-center justify-center">
                            <span className="text-[13px] font-bold text-blue-400 uppercase tracking-wider">Ca Chiều</span>
                          </div>
                        ) : cellData.shift === 'OFF' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                            <span className="text-[14px] font-bold text-slate-500 uppercase tracking-widest">OFF</span>
                          </div>
                        ) : null}

                        {isRequestOff && !cellData && (
                          <div className="absolute top-2 bottom-2 left-2 right-2 p-2 rounded-xl bg-surface-container-lowest/80 border border-tertiary/40 flex flex-col items-center justify-center shadow-inner relative overflow-hidden pointer-events-none">
                             <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-transparent"></div>
                             <span className="material-symbols-outlined text-tertiary text-[24px] mb-1 relative z-10 animate-bounce">flight_takeoff</span>
                             <span className="text-[10px] font-bold text-tertiary text-center relative z-10 leading-tight">Đơn xin nghỉ</span>
                          </div>
                        )}

                        {/* MENU ACTION HOVER - QUÉT NHANH */}
                        <div className="absolute inset-0 bg-surface-container/90 backdrop-blur-md rounded-xl flex-col items-center justify-center gap-1 opacity-0 group-hover/cell:opacity-100 transition-opacity z-20 hidden group-hover/cell:flex border border-white/10">
                           <button onClick={() => setShift(staff.id, day.date, 'Sáng')} className="w-[80%] py-1 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded hover:bg-orange-500/40 transition-colors uppercase">
                             Gán Sáng
                           </button>
                           <button onClick={() => setShift(staff.id, day.date, 'Chiều')} className="w-[80%] py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded hover:bg-blue-500/40 transition-colors uppercase">
                             Gán Chiều
                           </button>
                           <button onClick={() => setShift(staff.id, day.date, 'OFF')} className="w-[80%] py-1 bg-slate-800 text-slate-300 text-[10px] font-bold rounded border border-dashed border-slate-600 hover:bg-slate-700 transition-colors uppercase mt-1">
                             Cho OFF
                           </button>
                           <button onClick={() => {
                             removeShift(staff.id, day.date);
                           }} className="w-[80%] py-1 text-status-error text-[10px] font-bold hover:bg-status-error/10 rounded transition-colors uppercase mt-1">
                             Xóa/Từ chối
                           </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] sm:w-auto min-w-[320px] max-w-[500px] glass-card border ${toastType === 'success' ? 'border-status-success/30' : 'border-status-error/30'} p-4 rounded-xl flex items-center gap-3 transition-all duration-500 z-[110] shadow-2xl ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0 pointer-events-none'}`}>
        <div className={`w-10 h-10 rounded-full ${toastType === 'success' ? 'bg-status-success/20 border-status-success/30' : 'bg-status-error/20 border-status-error/30'} border flex items-center justify-center shrink-0`}>
          <span className={`material-symbols-outlined ${toastType === 'success' ? 'text-status-success' : 'text-status-error'}`}>
            {toastType === 'success' ? 'check_circle' : 'error'}
          </span>
        </div>
        <div className="flex flex-col">
          <p className="font-body-md text-on-surface font-bold">{toastType === 'success' ? 'Thành công' : 'Lỗi hệ thống'}</p>
          <p className="font-label-sm text-on-surface-variant mt-0.5 leading-snug">{toastMessage}</p>
        </div>
      </div>
    </div>
  );
}
