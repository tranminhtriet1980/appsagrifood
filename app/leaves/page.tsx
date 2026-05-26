"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import NotificationBell from "@/components/NotificationBell";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAuthStore } from "@/store/useAuthStore";
import { showToast } from "@/components/GlobalToast";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LeavesPage() {
  const router = useRouter();
  const { data, isLoading } = useSWR("/api/dashboard/stats", fetcher);
  const user = useAuthStore(state => state.user);
  const addNotification = useNotificationStore(state => state.addNotification);

  const [leaveType, setLeaveType] = useState("annual");
  const [fromDate, setFromDate] = useState("2024-05-20");
  const [toDate, setToDate] = useState("2024-05-20");
  const [duration, setDuration] = useState("full");
  const [reason, setReason] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [history, setHistory] = useState([
    {
      id: "pending-1",
      type: "Nghỉ không lương",
      date: "25/05/2024",
      duration: "1 ngày",
      status: "ĐANG CHỜ DUYỆT",
      icon: "hourglass_empty"
    },
    {
      id: "1",
      type: "Nghỉ phép năm",
      date: "15/05/2024",
      duration: "1 ngày",
      status: "Đã duyệt",
      icon: "history"
    },
    {
      id: "2",
      type: "Nghỉ ốm",
      date: "02/05/2024",
      duration: "0.5 ngày",
      status: "Đã duyệt",
      icon: "medical_services"
    }
  ]);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setShowSuccess(true);
      setIsSubmitting(false);
      
      // Notify Manager
      addNotification({
        senderName: user?.name || 'Nhân viên',
        senderAvatar: '',
        title: 'Đơn xin nghỉ phép mới',
        message: `🔔 ${user?.name || 'Nhân viên'} vừa gửi đơn xin nghỉ phép ngày ${fromDate.split('-').reverse().join('/')}`,
        time: 'Vừa xong',
        targetRole: 'manager'
      });
      showToast("✅ Gửi đơn thành công. Quản lý đã được thông báo.", "success");

      const newRequest = {
        id: `new-${Date.now()}`,
        type: leaveType === "annual" ? "Nghỉ phép năm" : leaveType === "sick" ? "Nghỉ ốm" : leaveType === "unpaid" ? "Nghỉ không lương" : "Làm việc từ xa",
        date: fromDate.split('-').reverse().join('/'),
        duration: duration === "full" ? "1 ngày" : "0.5 ngày",
        status: "ĐANG CHỜ DUYỆT",
        icon: leaveType === "annual" ? "history" : leaveType === "sick" ? "medical_services" : "hourglass_empty"
      };
      setHistory([newRequest, ...history]);

      setReason(""); // clear reason

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1000);
  };

  return (
    <div className="bg-background text-on-surface min-h-screen overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(23, 31, 51, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(70, 69, 84, 0.5); }
        .inset-input { background: rgba(11, 19, 38, 0.6); border: 1px solid rgba(144, 143, 160, 0.2); }
        .inset-input:focus { border-color: #c0c1ff; outline: none; box-shadow: 0 0 0 2px rgba(192, 193, 255, 0.2); }
      `}</style>
      
      {/* Top AppBar (Mobile Focused) */}
      <header className="flex justify-between items-center w-full px-margin-mobile h-16 fixed top-0 z-50 bg-surface shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()}>
            <span className="material-symbols-outlined text-primary cursor-pointer">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md text-primary font-bold">Nghỉ phép</h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary/30 flex items-center justify-center overflow-hidden ml-2">
            <span className="material-symbols-outlined text-primary">person</span>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="pt-20 pb-24 px-margin-mobile flex flex-col gap-6 max-w-7xl mx-auto lg:p-margin-desktop lg:pt-24 lg:grid lg:grid-cols-12 lg:gap-gutter">
        
        {/* Left Column for Desktop */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Leave Balance Header (Kinetic Card) */}
          <section className="glass-card rounded-xl p-md flex justify-between items-center relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="flex w-full items-center justify-between z-10">
              <div className="flex flex-col gap-2">
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Quỹ phép năm</p>
                <div className="flex gap-4">
                  <div>
                    <p className="text-on-surface-variant text-xs mb-1">Đã nghỉ</p>
                    <p className="font-headline-sm text-error font-bold">3.5 <span className="text-xs font-normal">ngày</span></p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-xs mb-1">Còn lại</p>
                    <p className="font-headline-sm text-primary font-bold">{isLoading ? "-" : (data?.leaveBalance?.remaining || "12.5")} <span className="text-xs font-normal">ngày</span></p>
                  </div>
                </div>
              </div>
              
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-surface-container-highest" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-primary" strokeDasharray="78.125, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xs font-bold text-on-surface">16</span>
                  <span className="text-[8px] text-on-surface-variant uppercase">Tổng</span>
                </div>
              </div>
            </div>
          </section>

          {/* Leave Registration Form */}
          <section className="flex flex-col gap-4">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Đăng ký nghỉ</h2>
            <div className="glass-card rounded-xl p-md flex flex-col gap-md">
              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase ml-1">Người duyệt trực tiếp</label>
                <div className="relative">
                  <select className="inset-input w-full rounded-lg px-md py-3 font-body-md text-on-surface appearance-none bg-surface-container/50">
                    <option value="manager">Trần Thị B - Quản lý</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase ml-1">Loại nghỉ</label>
                <div className="relative">
                  <select 
                    className="inset-input w-full rounded-lg px-md py-3 font-body-md text-on-surface appearance-none" 
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                  >
                    <option value="annual">Nghỉ phép năm</option>
                    <option value="sick">Nghỉ ốm (Hưởng BHXH)</option>
                    <option value="unpaid">Nghỉ không lương</option>
                    <option value="remote">Làm việc từ xa (Work from home)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase ml-1">Từ ngày</label>
                  <input 
                    className="inset-input w-full rounded-lg px-md py-3 font-body-md text-on-surface" 
                    type="date" 
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase ml-1">Đến ngày</label>
                  <input 
                    className="inset-input w-full rounded-lg px-md py-3 font-body-md text-on-surface" 
                    type="date" 
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase ml-1">Thời gian</label>
                <div className="relative">
                  <select 
                    className="inset-input w-full rounded-lg px-md py-3 font-body-md text-on-surface appearance-none" 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value="full">Cả ngày (1.0 ngày)</option>
                    <option value="morning">Sáng (0.5 ngày)</option>
                    <option value="afternoon">Chiều (0.5 ngày)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase ml-1">Lý do</label>
                <textarea 
                  className="inset-input w-full rounded-lg px-md py-3 font-body-md text-on-surface resize-none" 
                  placeholder="Nhập lý do chi tiết..." 
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
                {leaveType === "annual" && (
                  <p className="text-xs text-primary/80 ml-1 italic">* Đơn này sẽ trừ vào quỹ phép</p>
                )}
                {leaveType === "sick" && (
                  <p className="text-xs text-error/80 ml-1 italic">* Cần đính kèm minh chứng y tế khi đi làm lại</p>
                )}
              </div>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || showSuccess}
                className={`mt-2 w-full py-4 font-label-md text-label-md rounded-lg active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-lg ${
                  showSuccess ? "bg-secondary-container text-on-secondary-container" : "bg-primary text-on-primary shadow-primary/20"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Đang gửi...
                  </>
                ) : showSuccess ? (
                  <>
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    Thành công
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Gửi yêu cầu
                  </>
                )}
              </button>
            </div>
          </section>
        </div>

        {/* Right Column for Desktop */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Recent History */}
          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Lịch sử gần đây</h2>
              <span className="font-label-sm text-label-sm text-primary uppercase cursor-pointer hover:underline">Xem tất cả</span>
            </div>
            <div className="flex flex-col gap-3">
              {history.map((item) => (
                <div key={item.id} className={`glass-card rounded-xl p-md flex items-center justify-between transition-all ${item.status === "ĐANG CHỜ DUYỆT" ? "border-yellow-500/40 animate-pulse" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant">{item.icon}</span>
                    </div>
                    <div>
                      <p className={`font-body-md text-body-md font-medium ${item.status === "ĐANG CHỜ DUYỆT" ? "text-yellow-500" : "text-on-surface"}`}>{item.type}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{item.date} • {item.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === "ĐANG CHỜ DUYỆT" && (
                      <button 
                        onClick={() => {
                          setHistory(history.filter(h => h.id !== item.id));
                          showToast("Đã hủy yêu cầu thành công", "success");
                        }}
                        className="px-3 py-1.5 rounded bg-error/10 text-error font-label-sm text-[10px] uppercase hover:bg-error/20 transition-colors"
                      >
                        Hủy đơn
                      </button>
                    )}
                    <span className={`px-2 py-1 rounded font-label-sm text-[10px] uppercase ${item.status === "ĐANG CHỜ DUYỆT" ? "bg-yellow-500/20 text-yellow-500" : "bg-secondary-container text-on-secondary-container"}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Success Message Toast */}
      <div 
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] md:w-[400px] glass-card bg-surface-container-high border-primary/50 p-4 rounded-xl flex items-center gap-3 transition-transform duration-500 z-[100] ${
          showSuccess ? 'translate-y-0' : 'translate-y-48 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary">check_circle</span>
        </div>
        <p className="font-body-md text-body-md text-on-surface">Đơn xin nghỉ của bạn đã được gửi và đang chờ phê duyệt</p>
      </div>

      <BottomNav />
    </div>
  );
}
