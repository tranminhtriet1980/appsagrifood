"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { showToast } from "@/components/GlobalToast";
import BottomNav from "@/components/BottomNav";
import NotificationBell from "@/components/NotificationBell";

export default function ApprovalsPage() {
  const user = useAuthStore((state) => state.user);
  const leaveRequests = useAppStore((state) => state.leaveRequests);
  const updateRequestStatus = useAppStore((state) => state.updateRequestStatus);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const filteredRequests = leaveRequests.filter((req) => {
    if (user?.viewAll) {
      return req.status === 'PENDING_DIRECTOR';
    }
    if (user?.departmentId === 'TCHC') {
      return req.status === 'PENDING_HR';
    }
    if (user?.departmentId === 'KINH_DOANH') {
      return req.departmentId === 'KINH_DOANH' && req.status === 'PENDING_DEPT';
    }
    return false;
  });

  const handleRequest = (req: any, action: 'approve' | 'reject') => {
    let newStatus = req.status;
    let msg = "";

    if (action === 'reject') {
      newStatus = 'REJECTED';
      msg = `Đã từ chối đơn của ${req.userName}`;
    } else {
      if (req.status === 'PENDING_DEPT') {
        newStatus = 'PENDING_HR';
        msg = `Đã duyệt cấp Phòng. Chuyển TCHC.`;
      } else if (req.status === 'PENDING_HR') {
        // RẼ NHÁNH ĐIỀU KIỆN TẠI BƯỚC TCHC
        if (req.type === 'Phép năm (AL)' && req.duration < 3) {
          newStatus = 'APPROVED'; // Ủy quyền chốt
          msg = `Đã chốt duyệt đơn thành công`;
        } else {
          newStatus = 'PENDING_DIRECTOR'; // Đẩy lên GĐ do số ngày >=3 hoặc khác Phép năm
          msg = `Đã chuyển đơn lên Giám đốc phê duyệt`;
        }
      } else if (req.status === 'PENDING_DIRECTOR') {
        newStatus = 'APPROVED';
        msg = `Đã duyệt cuối! Lịch trực và Dashboard đã được cập nhật.`;
      }
    }

    updateRequestStatus(req.id, newStatus);
    
    // Notify staff
    const title = action === 'approve' ? 'Cập nhật đơn phép' : 'Đơn bị từ chối';
    const body = action === 'approve' 
      ? (newStatus === 'APPROVED' ? '✅ Đơn xin nghỉ phép của bạn đã được duyệt hoàn toàn' : '🔄 Đơn của bạn đã qua một cấp duyệt')
      : '❌ Đơn xin nghỉ phép của bạn đã bị từ chối';

    addNotification({
      senderName: user?.name || 'Hệ thống',
      title: title,
      message: body,
      time: 'Vừa xong',
      targetRole: 'staff',
      targetUserId: req.userId
    });
    
    if (newStatus === 'APPROVED') {
      showToast("✅ Đơn xin nghỉ phép đã được duyệt hoàn toàn", "success");
    }

    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  useEffect(() => {
    setIsMounted(true);
    // RBAC: Cho phép Manager, Director, Admin
    if (user && !["manager", "director", "admin_company", "admin"].includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!isMounted) return <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">Đang tải...</div>;

  return (
    <div className="bg-background text-on-surface min-h-screen pb-24 font-body-md">
      <style jsx global>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .glass-card { background: rgba(23, 31, 51, 0.7); backdrop-filter: blur(8px); border: 1px solid rgba(144, 143, 160, 0.2); }
      `}</style>
      
      {/* TopAppBar with Action-Oriented Header */}
      <header className="w-full top-0 sticky z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="transition-all duration-150 active:scale-95 text-primary">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex flex-col">
            <h1 className="text-headline-md font-headline-md text-primary font-bold">Phê duyệt</h1>
            <p className="text-label-sm text-on-surface-variant leading-none">{filteredRequests.length} việc cần xử lý ngay</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border border-outline-variant cursor-pointer ml-2" onClick={() => router.push('/settings')}>
            <span className="text-on-primary-container font-bold text-[12px]">{user?.name?.substring(0, 2).toUpperCase() || 'MG'}</span>
          </div>
        </div>
      </header>

      <main className="px-4 pt-4 space-y-6 max-w-4xl mx-auto w-full">
        {/* Filter Section (Persistent) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-label-sm font-label-sm uppercase tracking-wider text-outline">Chi nhánh quản lý</h2>
            <span className="material-symbols-outlined text-outline text-[16px]">tune</span>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4">
            <button className="px-4 py-1.5 bg-primary text-on-primary rounded-full text-label-md font-bold whitespace-nowrap">Tất cả chi nhánh</button>
            <button className="px-4 py-1.5 bg-surface-container-high text-on-surface-variant rounded-full text-label-md font-bold whitespace-nowrap">Emart Gò Vấp</button>
            <button className="px-4 py-1.5 bg-surface-container-high text-on-surface-variant rounded-full text-label-md font-bold whitespace-nowrap">Sagrifood Q7</button>
            <button className="px-4 py-1.5 bg-surface-container-high text-on-surface-variant rounded-full text-label-md font-bold whitespace-nowrap">Sagrifood Gò Vấp</button>
          </div>
        </section>

        {/* Branch Overview Widget (Risk Alert) */}
        <section className="grid grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-4 border-l-4 border-l-error">
            <p className="text-label-sm text-outline mb-1 font-bold">Sagrifood Q7</p>
            <div className="flex items-center gap-1 text-error font-bold mb-1">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span className="text-[14px]">Rủi ro cao</span>
            </div>
            <p className="text-[10px] text-on-surface-variant">Thiếu 2 Lead hôm nay</p>
          </div>
          <div className="glass-card rounded-xl p-4 border-l-4 border-l-tertiary">
            <p className="text-label-sm text-outline mb-1 font-bold">Emart Gò Vấp</p>
            <div className="flex items-center gap-1 text-tertiary font-bold mb-1">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span className="text-[14px]">Cảnh báo</span>
            </div>
            <p className="text-[10px] text-on-surface-variant">Tỷ lệ hiện diện 82%</p>
          </div>
        </section>

        {/* Prioritized Work Queue: Xử lý gấp */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <h2 className="text-[20px] font-bold">Xử lý gấp (1)</h2>
          </div>
          
          {/* Shift Swap Card with Timeline and Impact */}
          <div className="glass-card rounded-xl border border-error/30 overflow-hidden">
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-tertiary font-bold border border-outline-variant">TH</div>
                  <div>
                    <h4 className="text-[16px] font-bold">Trần Hoa</h4>
                    <p className="text-[11px] text-outline font-medium">Sagrifood Q7 • Đổi ca hôm nay</p>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary border border-outline-variant">
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                </button>
              </div>
              
              {/* Operational Impact Badge */}
              <div className="bg-error-container/20 px-3 py-1.5 rounded-lg border border-error/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[16px]">priority_high</span>
                <p className="text-[11px] text-error font-bold">Cảnh báo: Thiếu người tại quầy Thu ngân nếu duyệt.</p>
              </div>
              
              {/* Timeline / Roster Context */}
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-outline font-bold">Bối cảnh ca trực</p>
                <div className="flex items-center gap-1 h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary/40 w-1/4"></div>
                  <div className="h-full bg-error w-1/5"></div>
                  <div className="h-full bg-primary/40 w-1/3"></div>
                  <div className="h-full bg-surface-container-high w-1/6"></div>
                </div>
                <div className="flex justify-between text-[10px] text-outline px-1">
                  <span>06:00</span>
                  <span>14:00</span>
                  <span>22:00</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4 py-2 bg-surface-container-lowest rounded-lg border border-outline-variant/30">
                <div className="text-center">
                  <p className="text-[11px] text-outline font-medium">Đang trực</p>
                  <p className="text-[14px] font-bold">08:00 - 12:00</p>
                </div>
                <span className="material-symbols-outlined text-outline">trending_flat</span>
                <div className="text-center">
                  <p className="text-[11px] text-outline font-medium">Đổi sang</p>
                  <p className="text-[14px] font-bold">13:00 - 17:00</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 border-t border-outline-variant h-12">
              <button className="flex items-center justify-center gap-2 text-on-surface-variant hover:bg-surface-variant transition-colors text-[12px] font-bold">
                <span className="material-symbols-outlined text-[18px]">close</span> Từ chối
              </button>
              <button className="flex items-center justify-center gap-2 text-primary hover:bg-primary/10 transition-colors border-l border-outline-variant text-[12px] font-bold">
                <span className="material-symbols-outlined text-[18px]">check_circle</span> Phê duyệt
              </button>
            </div>
          </div>
        </section>

        {/* Standard Queue: Đơn chờ duyệt */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold">Đơn chờ duyệt ({filteredRequests.length})</h2>
            <button className="text-primary text-[12px] font-bold">Xem tất cả</button>
          </div>
          
          {filteredRequests.length === 0 ? (
            <div className="text-center text-on-surface-variant py-8 bg-surface-container/50 rounded-xl border border-outline-variant/30">
              Không có đơn nào cần xử lý lúc này.
            </div>
          ) : (
            filteredRequests.map(req => (
              <div key={req.id} className="glass-card rounded-xl border border-outline-variant overflow-hidden">
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold border border-outline-variant">{req.avatar}</div>
                      <div>
                        <h4 className="text-[16px] font-bold">{req.userName}</h4>
                        <p className="text-[11px] text-outline font-medium">{req.branch} • {req.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary border border-outline-variant">
                        <span className="material-symbols-outlined text-[18px]">call</span>
                      </button>
                      <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary border border-outline-variant">
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/30">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-outline text-[20px]">calendar_today</span>
                      <p className="text-[14px] font-bold">{req.dateStr}</p>
                    </div>
                    {/* Impact Badge */}
                    <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold uppercase">Quân số 92% - Ổn định</span>
                  </div>
                  
                  <p className="text-[14px] text-on-surface-variant italic">"{req.reason}"</p>
                </div>
                <div className="grid grid-cols-2 border-t border-outline-variant h-12">
                  <button onClick={() => handleRequest(req, 'reject')} className="flex items-center justify-center gap-2 text-on-surface-variant hover:bg-surface-variant transition-colors text-[12px] font-bold">
                    <span className="material-symbols-outlined text-[18px]">close</span> Từ chối
                  </button>
                  <button onClick={() => handleRequest(req, 'approve')} className="flex items-center justify-center gap-2 text-primary hover:bg-primary/10 transition-colors border-l border-outline-variant text-[12px] font-bold">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span> Phê duyệt
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-status-success/90 border border-status-success text-on-primary px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in whitespace-nowrap">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="font-label-md font-bold text-white">{toastMessage}</span>
          </div>
        )}

        {/* Operational Forecast (Compact) */}
        <section className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold text-outline uppercase">Tình hình phủ ca tuần này</h2>
            <span className="material-symbols-outlined text-primary text-[18px]">trending_up</span>
          </div>
          <div className="flex items-end justify-between h-16 gap-2">
            <div className="flex-1 bg-primary/20 h-[60%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/20 h-[80%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary h-full rounded-t-sm relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary">T4</div>
            </div>
            <div className="flex-1 bg-primary/20 h-[70%] rounded-t-sm"></div>
            <div className="flex-1 bg-error/50 h-[40%] rounded-t-sm relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-error">T6</div>
            </div>
            <div className="flex-1 bg-primary/20 h-[75%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/20 h-[65%] rounded-t-sm"></div>
          </div>
          <div className="flex justify-between text-[10px] text-outline font-medium">
            <span>T2</span><span>T3</span><span className="text-primary font-bold">T4</span><span>T5</span><span className="text-error font-bold">T6</span><span>T7</span><span>CN</span>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
