"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import BottomNav from "@/components/BottomNav";

export default function ReportsPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<{name: string, violation: string} | null>(null);

  const openModal = (name: string, violation: string) => {
    setSelectedStaff({ name, violation });
    setIsModalOpen(true);
  };

  const handleSendWarning = () => {
    setIsModalOpen(false);
    setToastMessage(`Đã gửi cảnh báo thành công tới ${selectedStaff?.name}`);
    setTimeout(() => setToastMessage(""), 3500);
  };

  useEffect(() => {
    setIsMounted(true);
    // RBAC: Chỉ cho phép Manager, Director, Admin
    if (user && !["manager", "director", "admin_company", "admin"].includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!isMounted) return <div className="min-h-screen bg-background flex items-center justify-center text-on-surface">Đang tải...</div>;

  return (
    <div className="bg-background text-on-surface min-h-screen pb-24 font-body-md flex flex-col">
      <style jsx global>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .glass-card { background: rgba(23, 31, 51, 0.7); backdrop-filter: blur(8px); border: 1px solid rgba(144, 143, 160, 0.1); }
      `}</style>
      
      {/* Top App Bar */}
      <header className="w-full sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-surface-container-highest flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-on-surface-variant active:scale-95 transition-transform">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-headline-md text-[18px] font-bold text-primary">Báo cáo Vận hành</h1>
        </div>
        <div className="flex items-center">
          <button className="bg-[#1b5e20] text-white px-3 py-1.5 rounded-lg text-label-md flex items-center gap-1 hover:brightness-110 transition-all font-bold active:scale-95">
            <span className="material-symbols-outlined text-[18px]">download</span> Xuất file
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full space-y-6">
        
        {/* Controls */}
        <div className="flex gap-2 w-full">
          <button className="flex-1 bg-surface-container-high text-on-surface px-3 py-2 rounded-lg text-[13px] flex items-center justify-between border border-outline-variant active:scale-95 transition-transform">
            Tháng 05/2026 <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
          <button className="flex-1 bg-surface-container-high text-on-surface px-3 py-2 rounded-lg text-[13px] flex items-center justify-between border border-outline-variant active:scale-95 transition-transform">
            Tất cả chi nhánh <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Card 1 */}
          <div className="glass-card p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Tỷ lệ đi làm</span>
              <div className="bg-green-500/10 text-green-400 p-1 rounded">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
              </div>
            </div>
            <div>
              <div className="text-[24px] font-bold text-on-surface leading-tight">93.5%</div>
              <div className="text-[10px] text-green-400 mt-1 flex items-center gap-1 font-medium">
                +2% <span className="text-on-surface-variant/60">so với tháng trước</span>
              </div>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="glass-card p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Tổng ngày công</span>
              <div className="bg-primary/10 text-primary p-1 rounded">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              </div>
            </div>
            <div>
              <div className="text-[24px] font-bold text-on-surface leading-tight">586 Ngày</div>
              <div className="text-[10px] text-on-surface-variant mt-1 font-medium">Dữ liệu tính đến 25/05</div>
            </div>
          </div>
          
          {/* Card 3 */}
          <div className="glass-card p-4 rounded-xl flex flex-col justify-between border-l-4 border-l-tertiary">
            <div className="flex justify-between items-start mb-2">
              <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Tổng giờ OT</span>
              <div className="bg-tertiary/10 text-tertiary p-1 rounded">
                <span className="material-symbols-outlined text-[16px]">timer</span>
              </div>
            </div>
            <div>
              <div className="text-[24px] font-bold text-on-surface leading-tight">45 Giờ</div>
              <div className="text-[10px] text-tertiary mt-1 flex items-center gap-1 font-medium">
                Tăng 12% <span className="text-on-surface-variant/60">đợt khuyến mãi</span>
              </div>
            </div>
          </div>
          
          {/* Card 4 */}
          <div className="glass-card p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Đơn nghỉ phép</span>
              <div className="bg-surface-container-highest text-on-surface-variant p-1 rounded">
                <span className="material-symbols-outlined text-[16px]">assignment_return</span>
              </div>
            </div>
            <div>
              <div className="text-[24px] font-bold text-on-surface leading-tight">12 Đơn</div>
              <div className="text-[10px] text-on-surface-variant mt-1 font-medium">8 đơn đã duyệt, 4 chờ</div>
            </div>
          </div>
        </div>

        {/* Analysis Charts */}
        <div className="space-y-6">
          {/* Bar Chart Section */}
          <div className="glass-card p-4 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[16px] text-on-surface">Tần suất đi muộn</h3>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer text-[20px]">more_vert</span>
            </div>
            <div className="h-48 flex items-end justify-around gap-2 px-2">
              <div 
                className="flex flex-col items-center gap-2 flex-1 max-w-[80px] cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => router.push('/reports/details')}
              >
                <div className="w-full bg-primary/20 rounded-t-lg relative group h-[45%]">
                  <div className="absolute inset-0 bg-primary opacity-40 rounded-t-lg transition-opacity"></div>
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary">12</span>
                </div>
                <span className="text-[10px] text-center text-on-surface-variant font-medium whitespace-nowrap overflow-hidden text-ellipsis w-full">Emart</span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1 max-w-[80px]">
                <div className="w-full bg-primary/20 rounded-t-lg relative group h-[85%]">
                  <div className="absolute inset-0 bg-primary opacity-40 rounded-t-lg transition-opacity"></div>
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary">24</span>
                </div>
                <span className="text-[10px] text-center text-on-surface-variant font-medium whitespace-nowrap overflow-hidden text-ellipsis w-full">Lotte Q7</span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1 max-w-[80px]">
                <div className="w-full bg-primary/20 rounded-t-lg relative group h-[30%]">
                  <div className="absolute inset-0 bg-primary opacity-40 rounded-t-lg transition-opacity"></div>
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary">8</span>
                </div>
                <span className="text-[10px] text-center text-on-surface-variant font-medium whitespace-nowrap overflow-hidden text-ellipsis w-full">Sagri Q1</span>
              </div>
            </div>
          </div>

          {/* Donut Chart Section */}
          <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/2">
              <h3 className="font-bold text-[16px] text-on-surface mb-6">Cơ cấu lý do nghỉ phép</h3>
              <div className="flex justify-center items-center">
                <div className="relative w-32 h-32 rounded-full flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[12px] border-primary-container/20"></div>
                  <div className="absolute inset-0 rounded-full border-[12px] border-primary border-t-transparent border-r-transparent rotate-45"></div>
                  <div className="absolute inset-0 rounded-full border-[12px] border-tertiary border-l-transparent border-b-transparent border-r-transparent -rotate-12"></div>
                  <div className="text-center">
                    <p className="text-[20px] font-bold">12</p>
                    <p className="text-[9px] text-on-surface-variant uppercase font-medium">Đơn/tháng</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 space-y-3">
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> 
                  <span className="font-medium text-on-surface-variant">Phép năm</span>
                </div>
                <span className="font-bold text-on-surface">60%</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span> 
                  <span className="font-medium text-on-surface-variant">Ốm đau</span>
                </div>
                <span className="font-bold text-on-surface">25%</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-outline"></span> 
                  <span className="font-medium text-on-surface-variant">Việc riêng</span>
                </div>
                <span className="font-bold text-on-surface">15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* HR Alerts Table */}
        <div className="glass-card rounded-xl overflow-hidden mt-6">
          <div className="px-4 py-3 border-b border-surface-container-highest flex justify-between items-center">
            <h3 className="font-bold text-[16px] text-on-surface">Danh sách Cần Chú Ý</h3>
            <div className="bg-error-container/20 text-error text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">4 Cảnh báo</div>
          </div>
          
          <div className="divide-y divide-surface-container-highest">
            {/* Item 1 */}
            <div className="p-3 flex items-center justify-between hover:bg-surface-container-high/40 transition-colors">
              <div className="flex items-center gap-3">
                <img className="w-10 h-10 rounded-full bg-surface-variant object-cover border border-outline-variant/30" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Nguyễn Văn An" />
                <div>
                  <p className="font-bold text-[14px] text-on-surface">Nguyễn Văn An</p>
                  <p className="text-[11px] text-on-surface-variant">Emart Gò Vấp</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-error/10 text-error text-[10px] font-bold">Đi muộn 3 lần</span>
                </div>
              </div>
              <button onClick={() => openModal("Nguyễn Văn An", "Đi muộn 3 lần trong tuần")} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors active:scale-95">
                <span className="material-symbols-outlined text-[20px]">chat</span>
              </button>
            </div>
            
            {/* Item 2 */}
            <div className="p-3 flex items-center justify-between hover:bg-surface-container-high/40 transition-colors">
              <div className="flex items-center gap-3">
                <img className="w-10 h-10 rounded-full bg-surface-variant object-cover border border-outline-variant/30" src="https://i.pravatar.cc/150?u=a042581f4e29026704b" alt="Trần Thị Bình" />
                <div>
                  <p className="font-bold text-[14px] text-on-surface">Trần Thị Bình</p>
                  <p className="text-[11px] text-on-surface-variant">Lotte Mart Q7</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-tertiary/10 text-tertiary text-[10px] font-bold">Thiếu giờ công</span>
                </div>
              </div>
              <button onClick={() => openModal("Trần Thị Bình", "Thiếu giờ công trong tuần")} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors active:scale-95">
                <span className="material-symbols-outlined text-[20px]">chat</span>
              </button>
            </div>

            {/* Item 3 */}
            <div className="p-3 flex items-center justify-between hover:bg-surface-container-high/40 transition-colors">
              <div className="flex items-center gap-3">
                <img className="w-10 h-10 rounded-full bg-surface-variant object-cover border border-outline-variant/30" src="https://i.pravatar.cc/150?u=a042581f4e29026704c" alt="Lê Hoàng Cường" />
                <div>
                  <p className="font-bold text-[14px] text-on-surface">Lê Hoàng Cường</p>
                  <p className="text-[11px] text-on-surface-variant">Sagrifood Q1</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-error/10 text-error text-[10px] font-bold">Vắng không phép</span>
                </div>
              </div>
              <button onClick={() => openModal("Lê Hoàng Cường", "Vắng không phép ngày hôm nay")} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors active:scale-95">
                <span className="material-symbols-outlined text-[20px]">chat</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Cảnh Báo */}
      {isModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container rounded-2xl w-full max-w-md border border-outline-variant overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-surface-container-highest flex justify-between items-center">
              <h3 className="font-bold text-[18px] text-on-surface">Ghi nhận vi phạm & Nhắc nhở</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-error/10 p-3 rounded-lg border border-error/20 flex gap-3 items-start">
                <span className="material-symbols-outlined text-error mt-0.5">warning</span>
                <div>
                  <p className="text-[14px] font-bold text-error">Nội dung vi phạm:</p>
                  <p className="text-[13px] text-on-surface">Nhân viên {selectedStaff.name} {selectedStaff.violation.toLowerCase()}</p>
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant mb-1">Ghi chú thêm (Tùy chọn)</label>
                <textarea 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/50 outline-none resize-none h-24"
                  placeholder="Nhập lời nhắc nhở để gửi cho nhân viên..."
                ></textarea>
              </div>
            </div>
            <div className="p-4 border-t border-surface-container-highest flex gap-3">
              <button onClick={handleSendWarning} className="flex-1 py-2.5 bg-surface-container-high text-on-surface rounded-lg font-bold border border-outline-variant hover:bg-surface-variant transition-colors active:scale-95">
                Lưu hồ sơ kỷ luật
              </button>
              <button onClick={handleSendWarning} className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:brightness-110 transition-colors active:scale-95">
                Gửi cảnh báo Zalo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-status-success/90 border border-status-success text-on-primary px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in whitespace-nowrap">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-label-md font-bold text-white">{toastMessage}</span>
        </div>
      )}

      {/* Cập nhật BottomNav */}
      <BottomNav />
    </div>
  );
}
