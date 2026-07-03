"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuthStore } from "@/store/useAuthStore";
import BottomNav from "@/components/BottomNav";
import { toast } from "react-hot-toast";
import { useTrueTime } from "@/hooks/useTrueTime";
import ThemeToggle from "@/components/ThemeToggle";
import { haversineDistance, FACE_MATCH_THRESHOLD } from "@/lib/attendance";

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function ManagerAttendancePage({ user, router }: { user: any, router: any }) {
  const [activeTab, setActiveTab] = useState<TabType>("Hôm nay");

  // Áp dụng SWR để Polling real-time mỗi 5 giây
  const { data, isLoading } = useSWR(
    `/api/attendance/manager?tab=${activeTab}`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const employees = data?.employees || EMPLOYEES_MOCK;
  const stats = data?.stats || { total: 24, checkedIn: 18, late: 2, missing: 4 };

  return (
    <div className="min-h-screen bg-[#0b1326] text-on-surface font-body-md flex flex-col pb-24">
      <style dangerouslySetInnerHTML={{ __html: `
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-card { background: linear-gradient(135deg, rgba(23, 31, 51, 0.8) 0%, rgba(11, 19, 38, 0.9) 100%); backdrop-filter: blur(16px); border: 1px solid rgba(144, 143, 160, 0.2); box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="text-on-surface-variant hover:text-on-surface transition-colors" onClick={() => router.push('/dashboard')}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-headline-md text-[18px] font-bold text-on-surface">Quản lý Chấm công</h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="relative cursor-pointer" onClick={() => router.push('/settings')}>
            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold border border-primary">
              {user?.name?.substring(0, 2).toUpperCase() || 'MG'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></div>
          </div>
        </div>
      </header>

      {/* TOP CONTROLS */}
      <div className="px-4 pt-4 space-y-4 max-w-4xl mx-auto w-full">
        <button className="w-full flex items-center justify-between bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
            <span className="font-label-md text-[14px]">Tất cả địa điểm</span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
        </button>

        <div className="flex bg-surface-container-highest p-1 rounded-xl w-full">
          {["Hôm nay", "Tuần", "Tháng"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`flex-1 py-2 rounded-lg font-bold text-[13px] transition-all ${activeTab === tab
                ? "bg-primary text-on-primary shadow-lg"
                : "text-on-surface-variant hover:text-white"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button className="w-full flex items-center justify-center gap-2 bg-surface-container-high hover:bg-surface-container-highest border border-white/10 rounded-xl py-3 text-on-surface font-bold text-[14px] active:scale-[0.98] transition-transform">
          <span className="material-symbols-outlined text-primary text-[20px]">download</span>
          Xuất báo cáo
        </button>
      </div>

      {/* THỐNG KÊ KPI (2x2 Grid) */}
      <div className="px-4 py-6 grid grid-cols-2 gap-3 max-w-4xl mx-auto w-full">
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-1 border-white/5 relative overflow-hidden">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-[16px]">group</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Tổng quân số</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-headline-lg text-[28px] font-bold text-on-surface">{stats.total}</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex flex-col gap-1 border-white/5 relative overflow-hidden">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-[16px]">door_front</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Đã Check-in</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-headline-lg text-[28px] font-bold text-green-400">{stats.checkedIn}</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex flex-col gap-1 border-white/5 relative overflow-hidden border-l-4 border-l-orange-400">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Đi muộn</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-headline-lg text-[28px] font-bold text-orange-400">{stats.late}</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex flex-col gap-1 border-white/5 relative overflow-hidden border-l-4 border-l-error">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-[16px]">person_off</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Chưa Check-in</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-headline-lg text-[28px] font-bold text-error">{stats.missing}</span>
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
          {isLoading && <div className="text-center text-primary">Đang tải dữ liệu...</div>}
          {!isLoading && employees.map((emp: any) => (
            <div key={emp.id} className="glass-card rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {emp.avatar ? (
                    <img src={emp.avatar} alt={emp.name} className="w-11 h-11 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold border border-white/10">
                      {emp.name?.trim().split(/\s+/).slice(-2).map((w: string) => w[0]).join('').toUpperCase() || 'NV'}
                    </div>
                  )}
                  {emp.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#131b2e] rounded-full"></div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[14px] text-on-surface">{emp.name}</span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5">
                    {emp.id} • {emp.location}
                  </span>
                </div>
              </div>
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

      <button className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-[0_4px_20px_rgba(147,51,234,0.4)] active:scale-90 transition-transform z-40">
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>

      <BottomNav />
    </div>
  );
}

// ============================================================
//  STAFF: Chấm công GPS + Khuôn mặt
// ============================================================
interface Profile {
  id: number;
  name: string;
  employeeCode: string | null;
  site: { id: number; name: string; latitude: number; longitude: number; radius: number } | null;
  hasFace: boolean;
  faceDescriptor: number[] | null;
}

function StaffAttendancePage({ router, user }: { router: any, user: any }) {
  const [timeStr, setTimeStr] = useState("--:--:--");
  const [dateStr, setDateStr] = useState("");
  const [busy, setBusy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  const [punchType, setPunchType] = useState<'in' | 'out'>('in');
  const [modelReady, setModelReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [gps, setGps] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { getTrueTime } = useTrueTime();

  const site = profile?.site || null;
  const inRange = site && distance != null ? distance <= site.radius : null;

  // ---- Tải hồ sơ (site + khuôn mặt đã đăng ký) ----
  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) setProfile(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ---- Khởi tạo Camera ----
  useEffect(() => {
    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Lỗi camera:", err);
        toast.error("Không thể truy cập Camera. Vui lòng cấp quyền!", { duration: 4000 });
      }
    })();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, []);

  // ---- Tải model nhận diện khuôn mặt ----
  useEffect(() => {
    (async () => {
      try {
        const face = await import("@/lib/face-client");
        await face.loadFaceModels();
        setModelReady(true);
      } catch (e) {
        console.error("Lỗi tải model khuôn mặt:", e);
        toast.error("Không tải được mô-đun nhận diện khuôn mặt");
      }
    })();
  }, []);

  // ---- Theo dõi GPS liên tục ----
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
      },
      (err) => console.warn("GPS error:", err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // ---- Tính khoảng cách tới site khi GPS/site đổi ----
  useEffect(() => {
    if (gps && site) {
      setDistance(haversineDistance(gps.lat, gps.lng, site.latitude, site.longitude));
    }
  }, [gps, site]);

  // ---- Đồng hồ + trạng thái mạng ----
  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const tick = () => {
      const now = getTrueTime();
      setTimeStr(now.toLocaleTimeString('en-GB', { hour12: false }));
      setDateStr(now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long' }));
    };
    tick();
    const timer = setInterval(tick, 1000);

    const handleOffline = () => { setIsOffline(true); toast("⚠️ Mất mạng — chuyển sang chế độ Offline"); };
    const handleOnline = async () => {
      setIsOffline(false);
      try {
        const pending = await getOfflineCheckins();
        if (pending.length > 0) {
          toast.loading(`Đang đồng bộ ${pending.length} bản ghi offline...`, { id: 'sync' });
          const res = await fetch('/api/attendance/sync', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: pending }),
          });
          if (res.ok) { await clearOfflineCheckins(); toast.success('Đồng bộ hoàn tất', { id: 'sync' }); }
          else throw new Error('sync fail');
        }
      } catch { toast.error('Lỗi đồng bộ, sẽ thử lại sau', { id: 'sync' }); }
    };
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      clearInterval(timer);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [getTrueTime]);

  // ---- Chụp descriptor + ảnh từ video ----
  const captureFace = async (): Promise<{ descriptor: Float32Array; photo: string } | null> => {
    if (!videoRef.current) return null;
    const face = await import("@/lib/face-client");
    const descriptor = await face.getDescriptorFromMedia(videoRef.current);
    if (!descriptor) return null;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    let photo = "";
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      photo = canvas.toDataURL("image/jpeg", 0.6);
    }
    return { descriptor, photo };
  };

  // ---- Đăng ký khuôn mặt ----
  const handleRegisterFace = async () => {
    if (!modelReady) { toast("Đang tải mô-đun khuôn mặt, đợi chút..."); return; }
    setBusy(true);
    toast.loading("Đang quét khuôn mặt...", { id: 'reg' });
    try {
      const cap = await captureFace();
      if (!cap) { toast.error("Không phát hiện khuôn mặt. Đưa mặt vào khung và thử lại.", { id: 'reg' }); return; }
      const res = await fetch('/api/face/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptor: Array.from(cap.descriptor) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại');
      toast.success("Đăng ký khuôn mặt thành công!", { id: 'reg' });
      await loadProfile();
    } catch (e: any) {
      toast.error(e.message || "Lỗi đăng ký khuôn mặt", { id: 'reg' });
    } finally {
      setBusy(false);
    }
  };

  // ---- Chấm công (check-in / check-out) ----
  const handlePunch = async () => {
    if (busy) return;

    if (!profile?.hasFace) {
      toast.error("Bạn chưa đăng ký khuôn mặt. Hãy bấm 'Đăng ký khuôn mặt' trước.");
      return;
    }
    if (!modelReady) { toast("Đang tải mô-đun khuôn mặt, đợi chút..."); return; }

    // Chặn sớm nếu ngoài vùng (server vẫn kiểm tra lại)
    if (site && distance != null && distance > site.radius) {
      toast.error(`Bạn đang cách ${site.name} ~${Math.round(distance)}m (cho phép ${site.radius}m).`);
      return;
    }

    setBusy(true);
    toast.loading(punchType === 'in' ? "Đang xác thực khuôn mặt để Check-in..." : "Đang xác thực để Check-out...", { id: 'punch' });

    try {
      // 1. Khuôn mặt
      const cap = await captureFace();
      if (!cap) { toast.error("Không phát hiện khuôn mặt. Vui lòng thử lại.", { id: 'punch' }); setBusy(false); return; }

      const face = await import("@/lib/face-client");
      const dist = face.faceDistance(cap.descriptor, profile.faceDescriptor!);
      if (dist > FACE_MATCH_THRESHOLD) {
        toast.error(`Khuôn mặt không khớp (sai lệch ${dist.toFixed(2)}). Đây có đúng là bạn không?`, { id: 'punch' });
        setBusy(false);
        return;
      }
      const matchScore = Math.max(0, 1 - dist);

      // 2. GPS mới nhất
      let coords = gps;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 })
        );
        coords = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
        setGps(coords);
      } catch { /* dùng gps đang có */ }

      const payload = {
        type: punchType,
        timestamp: getTrueTime().toISOString(),
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        accuracy: coords?.accuracy ?? null,
        imageBase64: cap.photo,
        faceMatchScore: matchScore,
      };

      // 3. Offline -> lưu tạm; Online -> gọi API
      if (isOffline || !navigator.onLine) {
        await saveCheckinOffline({ id: Date.now().toString(), ...payload });
        toast.success("Đã lưu chấm công offline, sẽ đồng bộ khi có mạng.", { id: 'punch' });
        setSuccessMsg(`Đã lưu ${punchType === 'in' ? 'Check-in' : 'Check-out'} lúc ${timeStr} (offline)`);
        setShowSuccess(true);
        setBusy(false);
        return;
      }

      const res = await fetch('/api/attendance/check-in', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Chấm công thất bại", { id: 'punch', duration: 5000 }); setBusy(false); return; }

      toast.success(data.message || "Chấm công thành công", { id: 'punch' });
      setSuccessMsg(data.message || "Chấm công thành công");
      setShowSuccess(true);
    } catch (e: any) {
      toast.error(e.message || "Lỗi kết nối máy chủ", { id: 'punch' });
    } finally {
      setBusy(false);
    }
  };

  const distanceLabel = distance != null ? `${Math.round(distance)}m` : "Đang định vị...";

  return (
    <div className="bg-background text-on-surface min-h-screen relative">
      <style dangerouslySetInnerHTML={{ __html: `
        .scan-line { position:absolute; width:100%; height:2px; background:#c0c1ff; top:0; left:0; animation:scan 3s linear infinite; opacity:.5; box-shadow:0 0 15px #c0c1ff; }
        @keyframes scan { 0%{top:0} 100%{top:100%} }
      ` }} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')}><span className="material-symbols-outlined text-primary">close</span></button>
          <h1 className="text-[24px] text-primary font-bold">Chấm công</h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="flex items-center gap-1 px-3 py-1 bg-surface-container rounded-full">
            {isOffline ? (
              <><span className="material-symbols-outlined text-error text-[14px]">cloud_off</span><span className="text-[12px] font-medium text-error">Offline</span></>
            ) : (
              <><span className="material-symbols-outlined text-status-success text-[14px]">cloud_done</span><span className="text-[12px] font-medium text-status-success">Online</span></>
            )}
          </div>
        </div>
      </header>

      <main className="min-h-screen pt-20 pb-40 px-6 flex flex-col items-center">
        {/* Live Clock */}
        <section className="w-full text-center mb-6">
          <div className="text-[40px] md:text-[48px] font-bold text-primary tracking-tighter">{timeStr}</div>
          <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-widest mt-1 capitalize">{dateStr}</p>
        </section>

        {/* Toggle Check-in / Check-out */}
        <div className="flex bg-surface-container-highest p-1 rounded-xl w-full max-w-[320px] mb-4">
          {(['in', 'out'] as const).map((t) => (
            <button key={t} onClick={() => setPunchType(t)}
              className={`flex-1 py-2.5 rounded-lg font-bold text-[14px] transition-all ${punchType === t ? (t === 'in' ? 'bg-status-success text-white shadow-lg' : 'bg-primary text-on-primary shadow-lg') : 'text-on-surface-variant'}`}>
              {t === 'in' ? 'Vào ca (Check-in)' : 'Tan ca (Check-out)'}
            </button>
          ))}
        </div>

        {/* Camera */}
        <section className="relative w-full aspect-square max-w-[320px] bg-surface-container rounded-xl overflow-hidden border border-outline-variant">
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="scan-line z-10"></div>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-primary/50 rounded-xl flex items-center justify-center bg-primary/5">
              <span className="material-symbols-outlined text-primary text-5xl opacity-40">face</span>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-surface-container-highest/90 backdrop-blur p-2.5 rounded-lg border border-outline/20">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${modelReady ? 'bg-status-success animate-pulse' : 'bg-orange-400'}`}></div>
              <span className="text-[13px] text-on-surface">{modelReady ? 'Sẵn sàng nhận diện' : 'Đang tải nhận diện...'}</span>
            </div>
            {profile?.hasFace
              ? <span className="material-symbols-outlined text-status-success text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              : <span className="text-[11px] text-orange-400 font-bold">Chưa đăng ký</span>}
          </div>
        </section>

        {/* Nút chấm công */}
        <button onClick={handlePunch} disabled={busy || !modelReady}
          className={`mt-6 w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-lg active:scale-90 transition-all disabled:opacity-40 ${punchType === 'in' ? 'bg-status-success border-status-success/30' : 'bg-primary border-primary/30'}`}>
          {busy ? (
            <svg className="animate-spin h-7 w-7 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <span className="material-symbols-outlined text-[36px] text-white">{punchType === 'in' ? 'login' : 'logout'}</span>
          )}
        </button>
        <span className="text-[12px] text-on-surface-variant mt-2 font-bold uppercase tracking-widest">
          Bấm để {punchType === 'in' ? 'Check-in' : 'Check-out'}
        </span>

        {/* Đăng ký / đăng ký lại khuôn mặt — luôn hiển thị */}
        <button onClick={handleRegisterFace} disabled={busy || !modelReady}
          className={`mt-4 px-5 py-2.5 rounded-full font-bold text-[13px] flex items-center gap-2 disabled:opacity-40 border ${
            profile?.hasFace
              ? 'bg-surface-container border-outline-variant text-on-surface-variant'
              : 'bg-orange-500/15 border-orange-400/40 text-orange-400'
          }`}>
          <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
          {profile?.hasFace ? 'Đăng ký lại khuôn mặt' : 'Đăng ký khuôn mặt (làm 1 lần)'}
        </button>
        {!modelReady && (
          <span className="mt-1 text-[11px] text-on-surface-variant">Đang tải mô-đun nhận diện…</span>
        )}

        {/* Thông tin site + GPS + ca */}
        <section className="w-full mt-8 space-y-4 max-w-[500px]">
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-container/20 rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary">storefront</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[12px] font-medium text-on-surface-variant">Site chấm công</h3>
              <p className="text-[16px] text-on-surface truncate">{site ? site.name : 'Chưa gán site'}</p>
              <p className="text-[11px] text-on-surface-variant">Cách {distanceLabel}{gps ? ` · GPS ±${Math.round(gps.accuracy)}m` : ''}</p>
            </div>
            <div className="text-right shrink-0">
              {inRange === null ? (
                <span className="text-[12px] font-medium text-on-surface-variant bg-surface-container px-2 py-1 rounded">...</span>
              ) : inRange ? (
                <span className="text-[12px] font-medium text-status-success bg-status-success/10 px-2 py-1 rounded">Trong vùng</span>
              ) : (
                <span className="text-[12px] font-medium text-error bg-error/10 px-2 py-1 rounded">Ngoài vùng</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <h3 className="text-[12px] font-medium text-on-surface-variant mb-1">Nhân viên</h3>
              <p className="text-[15px] font-bold text-on-surface truncate">{profile?.name || user?.name || '—'}</p>
              <p className="text-[11px] text-on-surface-variant">{profile?.employeeCode || ''}</p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <h3 className="text-[12px] font-medium text-on-surface-variant mb-1">Giờ làm</h3>
              <p className="text-[15px] font-bold text-on-surface">08:00 - 17:00</p>
            </div>
          </div>
        </section>

        <button onClick={() => router.push('/history')} className="mt-8 text-primary text-[14px] font-medium flex items-center gap-1 hover:underline">
          <span>Xem lịch sử chấm công của tôi</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </main>

      {/* Success overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-status-success rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-status-success/40">
              <span className="material-symbols-outlined text-white text-6xl">check</span>
            </div>
            <h2 className="text-[28px] md:text-[40px] font-bold text-on-surface mb-2">Thành công!</h2>
            <p className="text-[15px] text-on-surface-variant mb-8 max-w-xs leading-relaxed">{successMsg}</p>
            <button className="px-10 py-3 bg-surface-container-high text-on-surface font-bold rounded-full"
              onClick={() => { setShowSuccess(false); router.push('/dashboard'); }}>
              Quay lại trang chủ
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default function AttendancePage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return <div className="min-h-screen bg-background flex items-center justify-center text-on-surface">Đang tải...</div>;

  const isManager = user && ["manager", "director", "admin_company", "admin"].includes(user.role);

  return isManager ? <ManagerAttendancePage user={user} router={router} /> : <StaffAttendancePage router={router} user={user} />;
}
