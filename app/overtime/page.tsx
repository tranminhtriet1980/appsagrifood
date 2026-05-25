"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default function OvertimePage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  
  // Form State
  const [requestType, setRequestType] = useState("ot");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [reason, setReason] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setShowSuccess(true);
      setIsSubmitting(false);
      
      // Reset form
      setStartTime("");
      setEndTime("");
      setLocation("");
      setReason("");

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1000);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved": return "bg-status-success/20 text-status-success border-status-success/30";
      case "pending": return "bg-status-warning/20 text-status-warning border-status-warning/30";
      case "rejected": return "bg-error-container text-on-error-container border-error/30";
      default: return "bg-surface-container-highest text-on-surface-variant";
    }
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-on-surface">Đang tải...</div>;
  }

  return (
    <div className="font-body-md text-body-md overflow-x-hidden min-h-screen bg-background text-on-surface pb-24">
      <style jsx global>{`
        .glass-effect {
          background: rgba(23, 31, 51, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(218, 226, 253, 0.1);
          transition: background 0.3s ease;
        }
        .glass-effect:hover {
          background: rgba(30, 40, 65, 0.7);
        }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #c0c1ff !important; box-shadow: none !important; }
        select option {
          background-color: #171f33; 
          color: #dae2fd; 
        }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
        }
      `}</style>
      
      {/* Top AppBar */}
      <header className="w-full sticky top-0 z-40 bg-surface dark:bg-surface border-b border-surface-container-highest flex items-center justify-between px-md h-14">
        <div className="flex items-center gap-md">
          <button onClick={() => router.back()} className="text-primary dark:text-primary-fixed hover:bg-surface-container-high transition-colors duration-150 p-2 rounded-full active:scale-95 flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Đăng ký Tăng ca & Công tác</h1>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container flex items-center justify-center bg-primary-container text-on-primary-container font-bold">
          {user?.name?.substring(0, 2).toUpperCase() || 'US'}
        </div>
      </header>

      <main className="max-w-md mx-auto px-margin-mobile pt-lg space-y-lg lg:max-w-4xl lg:pt-12 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
        
        {/* Registration Form */}
        <section className="space-y-4">
          <h3 className="font-label-md text-label-md text-primary uppercase tracking-wider px-base font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">edit_document</span>
            Biểu mẫu Đăng ký
          </h3>
          <div className="glass-effect rounded-xl p-md shadow-md">
            <form onSubmit={handleSubmit} className="space-y-md">
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-base uppercase">Loại yêu cầu</label>
                <div className="relative">
                  <select 
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-3 font-body-md text-body-md text-on-surface transition-all focus:border-primary appearance-none cursor-pointer"
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    required
                  >
                    <option value="ot">Tăng ca tại văn phòng</option>
                    <option value="business_trip">Công tác ngoài thị trường</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-base uppercase">Ngày</label>
                <input 
                  type="date" 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-3 font-body-md text-body-md text-on-surface transition-all focus:border-primary"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant ml-base uppercase">Giờ bắt đầu</label>
                  <input 
                    type="time" 
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-3 font-body-md text-body-md text-on-surface transition-all focus:border-primary"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant ml-base uppercase">Giờ kết thúc</label>
                  <input 
                    type="time" 
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-3 font-body-md text-body-md text-on-surface transition-all focus:border-primary"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {requestType === "business_trip" && (
                <div className="space-y-xs animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="font-label-sm text-label-sm text-on-surface-variant ml-base uppercase">Địa điểm làm việc</label>
                  <input 
                    type="text" 
                    placeholder="Nhập địa điểm công tác..."
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-3 font-body-md text-body-md text-on-surface transition-all focus:border-primary"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required={requestType === "business_trip"}
                  />
                </div>
              )}

              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-base uppercase">Lý do / Nội dung công việc</label>
                <textarea 
                  rows={3}
                  placeholder="Mô tả chi tiết công việc..."
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-3 font-body-md text-body-md text-on-surface transition-all focus:border-primary resize-none"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || showSuccess}
                className={`w-full font-bold py-3.5 rounded-lg hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg mt-2 ${
                  showSuccess ? 'bg-status-success/20 text-status-success border border-status-success/30 shadow-none' : 'bg-primary text-on-primary-container shadow-primary/20'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
                    Đang gửi...
                  </>
                ) : showSuccess ? (
                  <>
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Gửi thành công
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Gửi yêu cầu
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Request History */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-base">
            <h3 className="font-label-md text-label-md text-primary uppercase tracking-wider font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">history</span>
              Lịch sử Đăng ký
            </h3>
            <span className="font-label-sm text-on-surface-variant hover:text-primary cursor-pointer transition-colors underline">Xem tất cả</span>
          </div>
          
          <div className="space-y-3">
            {/* History Item 1 */}
            <div className="glass-effect rounded-xl p-md shadow-md flex flex-col gap-2 border border-outline-variant/20 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between border-b border-surface-container-highest pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary">work_history</span>
                  <span className="font-body-md font-bold">Tăng ca tại văn phòng</span>
                </div>
                <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold border ${getStatusStyle('pending')}`}>Chờ duyệt</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <p className="font-label-sm text-on-surface-variant">Ngày đăng ký</p>
                  <p className="font-body-sm font-medium">Hôm nay, 20/05/2024</p>
                </div>
                <div className="text-right">
                  <p className="font-label-sm text-on-surface-variant">Thời gian</p>
                  <p className="font-body-sm font-mono font-bold text-primary">18:00 - 20:30</p>
                </div>
              </div>
            </div>

            {/* History Item 2 */}
            <div className="glass-effect rounded-xl p-md shadow-md flex flex-col gap-2 border border-outline-variant/20 opacity-80 hover:opacity-100 hover:border-primary/40 transition-all">
              <div className="flex items-center justify-between border-b border-surface-container-highest pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">flight_takeoff</span>
                  <span className="font-body-md font-bold">Công tác ngoài thị trường</span>
                </div>
                <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold border ${getStatusStyle('approved')}`}>Đã duyệt</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <p className="font-label-sm text-on-surface-variant">Ngày đăng ký</p>
                  <p className="font-body-sm font-medium">15/05/2024</p>
                </div>
                <div className="text-right">
                  <p className="font-label-sm text-on-surface-variant">Thời gian</p>
                  <p className="font-body-sm font-mono font-bold text-primary">08:00 - 17:00</p>
                </div>
                <div className="col-span-2 pt-1">
                  <p className="font-label-sm text-on-surface-variant">Địa điểm</p>
                  <p className="font-body-sm italic">Chi nhánh Quận 1, TP.HCM</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Success Toast */}
      <div 
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] md:w-[400px] glass-effect bg-surface-container-high border-primary/50 p-4 rounded-xl flex items-center gap-3 transition-transform duration-500 z-[100] shadow-2xl ${
          showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-48 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-status-success/20 border border-status-success/30 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-status-success">check_circle</span>
        </div>
        <div className="flex flex-col">
          <p className="font-body-md text-on-surface font-bold">Gửi yêu cầu thành công</p>
          <p className="font-label-sm text-on-surface-variant">Yêu cầu đã được gửi tới Quản lý để chờ phê duyệt.</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
