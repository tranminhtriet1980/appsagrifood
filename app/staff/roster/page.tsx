"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useRosterStore } from '@/store/useRosterStore';

// --- MOCK DATA ---
const WEEK_DAYS = [
  { day: 'T2', date: '25/05', isToday: true },
  { day: 'T3', date: '26/05', isToday: false },
  { day: 'T4', date: '27/05', isToday: false },
  { day: 'T5', date: '28/05', isToday: false },
  { day: 'T6', date: '29/05', isToday: false },
  { day: 'T7', date: '30/05', isToday: false },
  { day: 'CN', date: '31/05', isToday: false },
];

const SHIFT_TYPES = [
  { id: 'morning', name: 'Ca Sáng', time: '06:00 - 14:00' },
  { id: 'afternoon', name: 'Ca Chiều', time: '14:00 - 22:00' },
];

const COWORKERS = [
  { id: 'e1', name: 'Lê Thị Tú', role: 'Nhân viên bán hàng' },
  { id: 'e2', name: 'Trần Văn B', role: 'Thu ngân' },
  { id: 'e3', name: 'Nguyễn Văn C', role: 'Nhân viên kho' },
];

export default function StaffRosterMatrixPage() {
  const router = useRouter();
  const { globalShifts, offDayRequests, requestOffDay } = useRosterStore();
  
  // Fake logged in user is s1 (Nguyễn Văn A)
  const myStaffId = 's1';
  
  // Convert Manager's matrix format to Staff view format
  const getStaffMatrixData = () => {
    const data: Record<string, any> = {};
    globalShifts.forEach(shift => {
       if (shift.userId === myStaffId && shift.status === 'Published') {
          const date = shift.date;
          const shiftValue = shift.shiftType;
          if (shiftValue === 'Sáng') data[`${date}_morning`] = { type: 'my_shift', color: 'orange', hours: 8 };
          else if (shiftValue === 'Chiều') data[`${date}_afternoon`] = { type: 'my_shift', color: 'blue', hours: 8 };
          else if (shiftValue === 'OFF') data[`${date}_morning`] = { type: 'off' };
       }
    });
    // Thêm empty slots giả để hiển thị marketplace đổi ca/ot
    if (!data['28/05_morning']) data['28/05_morning'] = { type: 'empty_slot' };
    return data;
  };
  
  const derivedMatrixData = getStaffMatrixData();

  // Modals & Toasts
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showOffDayModal, setShowOffDayModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Selected Shift for Modals
  const [selectedShift, setSelectedShift] = useState<any>(null);

  // Pre-Roster Availability State
  const [offDayRequestForm, setOffDayRequestForm] = useState<string | null>(offDayRequests[myStaffId] || null);

  const displayToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const validateShiftRegistration = (targetDate: string, targetShiftId: string) => {
    let totalHours = 0;
    Object.values(derivedMatrixData).forEach(shift => {
      if (shift.type === 'my_shift') totalHours += shift.hours;
    });

    if (totalHours + 8 > 48) {
      displayToast("Lỗi: Tổng thời gian làm việc vượt quá 48 tiếng/tuần!", "error");
      return false;
    }

    if (targetShiftId === 'morning') {
      const targetDateIndex = WEEK_DAYS.findIndex(d => d.date === targetDate);
      if (targetDateIndex > 0) {
        const prevDate = WEEK_DAYS[targetDateIndex - 1].date;
        const prevAfternoonShift = derivedMatrixData[`${prevDate}_afternoon`];
        if (prevAfternoonShift?.type === 'my_shift') {
          displayToast("Lỗi: Phải nghỉ tối thiểu 12 tiếng sau Ca Chiều hôm trước!", "error");
          return false;
        }
      }
    }
    return true;
  };

  const handleRegisterShift = () => {
    if (selectedShift && validateShiftRegistration(selectedShift.date, selectedShift.shiftId)) {
      setShowRegisterModal(false);
      displayToast("Yêu cầu nhận ca thành công! Vui lòng chờ duyệt.");
    } else {
      setShowRegisterModal(false);
    }
  };

  const handleSwapShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSwapModal(false);
    displayToast("Đã tạo yêu cầu đổi ca. Đang chờ đồng nghiệp xác nhận!");
  };

  const handleOffDaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (offDayRequestForm) {
      requestOffDay(myStaffId, offDayRequestForm);
      setShowOffDayModal(false);
      displayToast("Đăng ký ngày nghỉ tuần thành công. Vui lòng chờ Quản lý sắp lịch!");
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#0b1326] pb-32 animate-fade-in">
      <header className="w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-surface-container-highest flex items-center justify-between px-md h-16">
        <div className="flex items-center gap-sm">
          <button className="md:hidden p-sm rounded-full text-primary hover:bg-surface-variant active:scale-90 transition-all" onClick={() => router.push('/dashboard')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Lịch Ca Của Tôi</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowOffDayModal(true)} className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest text-on-surface font-bold rounded-lg hover:bg-white/10 transition-colors border border-white/5 active:scale-95 shadow-lg shadow-black/20">
            <span className="material-symbols-outlined text-[18px] text-tertiary">event_busy</span>
            <span className="hidden sm:inline">[ Đăng ký ngày nghỉ tuần tới ]</span>
            <span className="sm:hidden">Nghỉ tuần</span>
          </button>
        </div>
      </header>

      <div className="px-md mt-6 max-w-7xl mx-auto space-y-6">
        {/* THỐNG KÊ NHANH */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
           <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col gap-1">
             <span className="text-[10px] text-on-surface-variant font-bold uppercase">Tổng giờ làm</span>
             <span className="text-[20px] font-bold text-primary">40h <span className="text-[12px] text-on-surface-variant font-normal normal-case">/ 48h</span></span>
           </div>
           <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col gap-1">
             <span className="text-[10px] text-on-surface-variant font-bold uppercase">Trạng thái tuần</span>
             <span className="text-[14px] font-bold text-status-success mt-1 px-2 py-0.5 bg-status-success/10 rounded-md w-max">Đã chốt lịch</span>
           </div>
        </div>

        {/* BẢNG LỊCH TUẦN MATRIX */}
        <div className="glass-card rounded-xl overflow-x-auto hide-scrollbar border border-white/10">
          <table className="w-full min-w-[800px] border-collapse table-fixed">
            <thead>
              <tr>
                <th className="w-[12%] p-3 border-b border-r border-white/5 bg-surface-container-lowest">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">Ca \ Ngày</span>
                </th>
                {WEEK_DAYS.map((day, idx) => (
                  <th key={idx} className={`w-[12.5%] p-3 text-center border-b border-r last:border-r-0 border-white/5 ${day.isToday ? 'bg-primary/10 border-b-primary' : 'bg-surface-container-lowest'}`}>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-[12px] font-bold uppercase tracking-wider ${day.isToday ? 'text-primary' : 'text-on-surface-variant'}`}>{day.day}</span>
                      <span className={`text-[16px] font-bold ${day.isToday ? 'text-primary' : 'text-on-surface'}`}>{day.date}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SHIFT_TYPES.map((shiftType, rowIdx) => (
                <tr key={shiftType.id}>
                  <td className="p-3 border-r border-b border-white/5 bg-surface-container-lowest align-middle">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-[13px] text-on-surface uppercase">{shiftType.name}</span>
                      <span className="text-[11px] text-on-surface-variant">{shiftType.time}</span>
                    </div>
                  </td>
                  
                  {WEEK_DAYS.map((day, colIdx) => {
                    const cellKey = `${day.date}_${shiftType.id}`;
                    const cellData = derivedMatrixData[cellKey];

                    return (
                      <td key={cellKey} className="p-2 border-r last:border-r-0 border-b border-white/5 align-top h-[110px] relative">
                        {!cellData ? (
                           <div className="w-full h-full flex flex-col items-center justify-center rounded-xl bg-transparent"></div>
                        ) : cellData.type === 'my_shift' ? (
                          <div className={`relative group w-full h-full p-2.5 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer ${
                            cellData.color === 'orange' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-blue-500/10 border-blue-500/30'
                          }`}>
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${cellData.color === 'orange' ? 'text-orange-400' : 'text-blue-400'}`}>Ca của bạn</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                              <span className="text-[10px] text-on-surface font-bold bg-white/10 px-2 py-0.5 rounded-md">{cellData.hours}h</span>
                              <button onClick={(e) => { 
                                e.stopPropagation(); 
                                setSelectedShift({ date: day.date, shiftId: shiftType.id, name: shiftType.name });
                                setShowSwapModal(true); 
                              }} className={`text-[10px] font-bold px-2 py-1 rounded bg-surface-container hover:bg-white/20 transition-colors ${cellData.color === 'orange' ? 'text-orange-400' : 'text-blue-400'}`} title="Xin đổi ca">
                                ĐỔI CA
                              </button>
                            </div>
                          </div>
                        ) : cellData.type === 'empty_slot' ? (
                          <div className="w-full h-full p-2 rounded-xl border-2 border-dashed border-tertiary/40 bg-tertiary/5 flex flex-col items-center justify-center gap-1.5 transition-all hover:bg-tertiary/10 group">
                            <span className="text-[10px] font-bold text-tertiary uppercase text-center group-hover:hidden">Ca trống</span>
                            <button onClick={() => {
                              setSelectedShift({ date: day.date, shiftId: shiftType.id, name: shiftType.name });
                              setShowRegisterModal(true);
                            }} className="hidden group-hover:flex items-center justify-center px-2 py-1.5 bg-tertiary text-on-tertiary text-[10px] font-bold rounded uppercase hover:brightness-110 transition-all shadow-lg shadow-tertiary/20 w-full active:scale-95">
                              ĐĂNG KÝ
                            </button>
                          </div>
                        ) : cellData.type === 'off' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                            <span className="text-[14px] font-bold text-slate-500 uppercase tracking-widest">OFF</span>
                          </div>
                        ) : null}
                        
                        {/* HIỂN THỊ NGUYỆN VỌNG NGHỈ KHI NHÂN VIÊN CHỌN */}
                        {offDayRequests[myStaffId] === day.date && shiftType.id === 'morning' && !cellData && (
                           <div className="absolute top-2 bottom-2 left-2 right-2 flex flex-col items-center justify-center bg-surface-container-lowest border border-white/5 rounded-xl pointer-events-none opacity-80 shadow-inner">
                              <span className="material-symbols-outlined text-slate-500 text-[24px] mb-1">flight_takeoff</span>
                              <span className="text-[11px] font-normal text-slate-500 text-center">Nguyện vọng<br/>nghỉ</span>
                           </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center gap-4 text-[11px] text-on-surface-variant justify-center sm:justify-start">
           <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/30"></div> Ca sáng</div>
           <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/30"></div> Ca chiều</div>
           <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded border-2 border-dashed border-tertiary/40"></div> Ca trống</div>
           <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-900/30 border border-dashed border-slate-800"></div> OFF</div>
        </div>
      </div>

      {/* MODALS */}
      {showRegisterModal && selectedShift && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-headline-md text-on-surface font-bold mb-2">Đăng ký nhận ca (OT)</h3>
            <p className="text-on-surface-variant font-body-md mb-4">Bạn đăng ký làm thêm <strong className="text-tertiary">{selectedShift.name}</strong> ngày <strong className="text-on-surface">{selectedShift.date}</strong>?</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowRegisterModal(false)} className="flex-1 py-2.5 rounded-lg font-bold text-on-surface bg-surface-container-highest hover:bg-surface-container-high transition-colors">
                Hủy
              </button>
              <button onClick={handleRegisterShift} className="flex-1 py-2.5 rounded-lg font-bold text-on-tertiary bg-tertiary/20 border border-tertiary/30 hover:bg-tertiary hover:text-on-tertiary active:scale-95 transition-all shadow-lg shadow-tertiary/20">
                Gửi Yêu Cầu
              </button>
            </div>
          </div>
        </div>
      )}

      {showSwapModal && selectedShift && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-md text-on-surface font-bold">Xin đổi ca làm việc</h3>
              <button onClick={() => setShowSwapModal(false)} className="text-on-surface-variant hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSwapShiftSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant uppercase">Người làm thay (Đồng nghiệp)</label>
                <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary outline-none" required>
                  <option value="">-- Chọn đồng nghiệp đổi cùng --</option>
                  {COWORKERS.map(c => (
                     <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant uppercase">Lý do</label>
                <textarea rows={2} required className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-[13px] text-on-surface focus:border-primary resize-none outline-none" placeholder="Lý do đổi ca (Bắt buộc)..."></textarea>
              </div>
              <button type="submit" className="w-full py-3 mt-2 rounded-lg font-bold text-on-primary bg-primary hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
                Tạo Yêu Cầu Đổi Ca
              </button>
            </form>
          </div>
        </div>
      )}

      {showOffDayModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-md text-on-surface font-bold">Đăng ký ngày nghỉ tuần</h3>
              <button onClick={() => setShowOffDayModal(false)} className="text-on-surface-variant hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleOffDaySubmit} className="space-y-4">
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-primary/20 mb-2 flex gap-2">
                 <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                 <span className="text-[11px] text-on-surface-variant leading-relaxed">Bạn được quyền đăng ký <strong className="text-primary">duy nhất 1 ngày nghỉ</strong> trong tuần. Quản lý sẽ ưu tiên xếp ngày này là OFF cho bạn.</span>
              </div>
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant uppercase">Chọn ngày muốn nghỉ</label>
                <select 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-3 text-on-surface focus:border-primary outline-none font-bold" 
                  required
                  value={offDayRequestForm || ''}
                  onChange={(e) => setOffDayRequestForm(e.target.value)}
                >
                  <option value="" disabled>-- Chọn 1 ngày trong tuần tới --</option>
                  {WEEK_DAYS.map(d => (
                     <option key={d.date} value={d.date}>{d.day} ({d.date})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowOffDayModal(false)} className="flex-1 py-2.5 rounded-lg font-bold text-on-surface bg-surface-container-highest hover:bg-surface-container-high transition-colors">
                  Hủy
                </button>
                <button type="submit" className="flex-[1.5] py-2.5 rounded-lg font-bold text-on-primary bg-primary hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
                  Gửi Yêu Cầu Nghỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
