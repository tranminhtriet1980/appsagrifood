"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import BottomNav from "@/components/BottomNav";
import { toast } from "react-hot-toast";
import { useTrueTime } from "@/hooks/useTrueTime";

// Helper: IndexedDB cho Offline Check-in
const DB_NAME = 'HRM_OfflineDB';
const STORE_NAME = 'checkins';

const initDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

const saveCheckinOffline = async (data: any) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).add(data);
  return new Promise((resolve) => {
    tx.oncomplete = () => resolve(true);
  });
};

const getOfflineCheckins = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();
  return new Promise<any[]>((resolve) => {
    request.onsuccess = () => resolve(request.result);
  });
};

const clearOfflineCheckins = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).clear();
  return new Promise((resolve) => {
    tx.oncomplete = () => resolve(true);
  });
};

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

function ManagerAttendancePage({ user, router }: { user: any, router: any }) {
  const [activeTab, setActiveTab] = useState<TabType>("Hôm nay");

  return (
    <div className="min-h-screen bg-[#0b1326] text-on-surface font-body-md flex flex-col pb-24">
      <style jsx global>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-card { background: linear-gradient(135deg, rgba(23, 31, 51, 0.8) 0%, rgba(11, 19, 38, 0.9) 100%); backdrop-filter: blur(16px); border: 1px solid rgba(144, 143, 160, 0.2); box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
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

function StaffAttendancePage({ router, user }: { router: any, user: any }) {
  const [timeStr, setTimeStr] = useState("08:00:24");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Custom hook đồng bộ thời gian máy chủ chống gian lận
  const { getTrueTime } = useTrueTime();

  // Khởi tạo Camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.error("Lỗi khởi tạo camera:", err);
        toast.error("Không thể truy cập Camera. Vui lòng cấp quyền cho trình duyệt!", {
          duration: 4000,
          style: { background: '#ef4444', color: '#fff' }
        });
      }
    };
    
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Cập nhật Live Clock
  useEffect(() => {
    const updateClock = () => {
      // Dùng hàm getTrueTime() thay vì new Date() để luôn có giờ máy chủ chuẩn
      const now = getTrueTime();
      const time = now.toLocaleTimeString('en-GB', { hour12: false });
      setTimeStr(time);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);

    // Bắt sự kiện mạng Offline / Online
    const handleOffline = () => {
      setIsOffline(true);
      toast("⚠️ Đã mất kết nối mạng. Chế độ Offline được kích hoạt.", {
        style: { background: '#f59e0b', color: '#fff' }
      });
    };

    const handleOnline = async () => {
      setIsOffline(false);
      try {
        const pending = await getOfflineCheckins();
        if (pending.length > 0) {
          toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)).then(clearOfflineCheckins),
            {
              loading: `Đang đồng bộ ${pending.length} bản ghi chấm công offline...`,
              success: `Đồng bộ hoàn tất. Hệ thống ghi nhận giờ gốc của ${pending.length} bản ghi.`,
              error: 'Lỗi đồng bộ dữ liệu.',
            }
          );
        }
      } catch (e) {
        console.error("Lỗi đọc IndexedDB", e);
      }
    };
    
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    
    // Sử dụng giờ hệ thống chuẩn làm timestamp
    const trueTimestamp = getTrueTime().toISOString();
    
    const checkinData = {
      userId: user?.id || 'staff',
      timestamp: trueTimestamp,
      type: 'check-in',
      imageBase64: 'data:image/jpeg;base64,...', // Fake base64 for demo
      status: 'pending'
    };

    if (isOffline) {
      // Lưu vào IndexedDB
      await saveCheckinOffline(checkinData);
      setTimeout(() => {
        setIsCheckingIn(false);
        toast(`✅ Đã lưu chấm công lúc ${timeStr}. Sẽ tải lên hệ thống khi có mạng lại.`, {
          duration: 4000,
          style: { background: '#10B981', color: '#fff' }
        });
        setShowSuccess(true);
      }, 1000);
    } else {
      // Gọi API thực tế
      setTimeout(() => {
        setIsCheckingIn(false);
        setShowSuccess(true);
      }, 1800);
    }
  };

  const handleReset = () => {
    setShowSuccess(false);
    // Quay về Dashboard sau khi chấm công thành công
    router.push("/dashboard");
  };

  return (
    <div className="bg-background text-on-surface selection:bg-primary/30 min-h-screen relative">
      <style jsx global>{`
        .glow-pulse {
            animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px 0px rgba(192, 193, 255, 0.1); }
            50% { box-shadow: 0 0 40px 10px rgba(192, 193, 255, 0.3); }
        }
        .scan-line {
            position: absolute;
            width: 100%;
            height: 2px;
            background: #c0c1ff;
            top: 0;
            left: 0;
            animation: scan 3s linear infinite;
            opacity: 0.5;
            box-shadow: 0 0 15px #c0c1ff;
        }
        @keyframes scan {
            0% { top: 0; }
            100% { top: 100%; }
        }
      `}</style>
      
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="flex items-center">
            <span className="material-symbols-outlined text-primary">close</span>
          </button>
          <h1 className="text-[24px] text-primary font-bold">Chấm công nhanh</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 px-3 py-1 bg-surface-container rounded-full">
            {isOffline ? (
              <>
                <span className="material-symbols-outlined text-error text-[14px]">cloud_off</span>
                <span className="text-[12px] font-medium text-error">Ngoại tuyến</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-status-success text-[14px]">cloud_done</span>
                <span className="text-[12px] font-medium text-status-success">Đồng bộ</span>
              </>
            )}
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
        </div>
      </header>

      {/* Cảnh báo rớt mạng */}
      {isOffline && (
        <div className="fixed top-16 left-0 right-0 bg-[#f59e0b] text-white px-4 py-2 text-sm font-bold flex items-center justify-center gap-2 z-40 animate-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[18px]">wifi_off</span>
          ⚠️ Mất kết nối mạng. Ảnh chấm công sẽ được lưu tạm vào máy.
        </div>
      )}

      <main className={`min-h-screen pt-20 pb-28 px-6 flex flex-col items-center ${isOffline ? 'mt-8' : ''}`}>
        {/* Live Clock Section */}
        <section className="w-full text-center mb-8">
          <div className="text-[32px] md:text-[48px] font-bold text-primary tracking-tighter" id="live-clock">
            {timeStr}
          </div>
          <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-widest mt-1">
            Thứ Hai, 22 Tháng 5
          </p>
        </section>

        {/* Biometric / Scanner Preview Area */}
        <section className="relative w-full aspect-square max-w-[320px] bg-surface-container rounded-xl overflow-hidden border border-outline-variant group">
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="scan-line z-10"></div>
            {/* Camera Feed */}
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          </div>
          {/* Floating ID Box */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-primary/50 rounded-xl flex items-center justify-center bg-primary/5">
              <span className="material-symbols-outlined text-primary text-5xl opacity-40">face</span>
            </div>
          </div>
          {/* Status Indicator Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-surface-container-highest/90 backdrop-blur p-3 rounded-lg border border-outline/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-status-success animate-pulse"></div>
              <span className="text-[14px] text-on-surface">Đã nhận diện khuôn mặt</span>
            </div>
            <span className="material-symbols-outlined text-status-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
        </section>

        {/* Location & Meta Section */}
        <section className="w-full mt-8 space-y-4 max-w-[500px]">
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-container/20 rounded-full flex items-center justify-center shrink-0">
               <span className="material-symbols-outlined text-primary">location_on</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[12px] font-medium text-on-surface-variant">Vị trí hiện tại</h3>
              <p className="text-[16px] text-on-surface truncate">Văn phòng Bitexco, TP. Hồ Chí Minh</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[12px] font-medium text-status-success bg-status-success/10 px-2 py-1 rounded">Trong vùng</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <h3 className="text-[12px] font-medium text-on-surface-variant mb-1">Ca làm việc</h3>
              <p className="text-[16px] font-bold text-on-surface">Ca Sáng (08:00 - 17:30)</p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <h3 className="text-[12px] font-medium text-on-surface-variant mb-1">Trạng thái</h3>
              <p className="text-[16px] font-bold text-tertiary">Chưa Check-in</p>
            </div>
          </div>
        </section>

        {/* Main Action Button */}
        <section className="fixed bottom-10 left-6 right-6 flex flex-col gap-4 max-w-[500px] mx-auto z-40">
          <button 
            className="w-full bg-primary py-5 rounded-full flex items-center justify-center gap-3 active:scale-[0.97] transition-all glow-pulse disabled:opacity-70 disabled:cursor-not-allowed disabled:animate-none" 
            onClick={handleCheckIn}
            disabled={isCheckingIn}
          >
            {isCheckingIn ? (
              <>
                <svg className="animate-spin h-6 w-6 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-on-primary text-[24px] font-bold">Đang xử lý...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-on-primary text-3xl">fingerprint</span>
                <span className="text-on-primary text-[24px] font-bold">Xác nhận Check-in</span>
              </>
            )}
          </button>
          
          <button className="w-full py-4 rounded-full border border-outline-variant flex items-center justify-center gap-2 text-on-surface-variant hover:bg-surface-container transition-colors bg-background/80 backdrop-blur-md">
            <span className="material-symbols-outlined text-[20px]">edit_note</span>
            <span className="text-[16px]">Ghi chú hoặc Đính kèm hình ảnh</span>
          </button>

          <button 
            onClick={() => router.push('/history')}
            className="w-full mt-2 text-primary text-[14px] font-medium flex items-center justify-center gap-1 hover:underline"
          >
            <span>Xem lịch sử chấm công</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </section>
      </main>

      {/* Success Feedback Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
            <div className="w-32 h-32 bg-status-success rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-status-success/40">
              <span className="material-symbols-outlined text-white text-7xl">check</span>
            </div>
            <h2 className="text-[32px] md:text-[48px] font-bold text-on-surface mb-2">Thành công!</h2>
            <p className="text-[16px] text-on-surface-variant mb-10 max-w-xs leading-relaxed">
              Bạn đã hoàn tất Check-in vào lúc <span className="font-bold text-on-surface">{timeStr}</span> tại Văn phòng Bitexco.
            </p>
            <button 
              className="px-10 py-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold rounded-full transition-colors" 
              onClick={handleReset}
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AttendancePage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-background flex items-center justify-center text-on-surface">Đang tải...</div>;

  const isManager = user && ["manager", "director", "admin_company", "admin"].includes(user.role);

  return isManager ? <ManagerAttendancePage user={user} router={router} /> : <StaffAttendancePage router={router} user={user} />;
}
