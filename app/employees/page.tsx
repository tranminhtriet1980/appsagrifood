"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { danhSachNhanVienMock, NhanVien } from "@/data/nhanVienMock";

// Tính thâm niên
const calculateTenure = (joinDateStr: string) => {
  const joinDate = new Date(joinDateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - joinDate.getTime());
  const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
  return diffYears;
};

// Hàm lấy màu sắc cho Badge chi nhánh
const getBranchBadgeColor = (branch: string) => {
  if (branch.includes("Coop")) return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300";
  if (branch.includes("BigC") || branch.includes("Emart")) return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300";
  if (branch.includes("Lotte")) return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300";
  return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300";
};

export default function EmployeesPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("Tất cả");
  const [genderFilter, setGenderFilter] = useState("Tất cả");
  
  // Modal State
  const [selectedEmployee, setSelectedEmployee] = useState<NhanVien | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (user && !["manager", "director", "admin_company", "admin"].includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!isMounted) return <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">Đang tải...</div>;

  // Lọc dữ liệu
  const filteredEmployees = danhSachNhanVienMock.filter(emp => {
    const matchesSearch = emp.hoTen.toLowerCase().includes(searchQuery.toLowerCase()) || emp.maNV.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = branchFilter === "Tất cả" || emp.store === branchFilter;
    const matchesGender = genderFilter === "Tất cả" || emp.gioiTinh === genderFilter;
    return matchesSearch && matchesBranch && matchesGender;
  });

  // Extract unique branches
  const branches = ["Tất cả", ...Array.from(new Set(danhSachNhanVienMock.map(e => e.store)))];

  // --- STATS ---
  const totalStaff = danhSachNhanVienMock.length;
  const maleCount = danhSachNhanVienMock.filter(e => e.gioiTinh === 'Nam').length;
  const femaleCount = totalStaff - maleCount;
  const malePercentage = Math.round((maleCount / totalStaff) * 100);
  
  // Nhân viên mới (Giả sử trong vòng 30 ngày)
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const newEmployees = danhSachNhanVienMock.filter(e => new Date(e.ngayVaoLam) >= thirtyDaysAgo);

  return (
    <div className="font-body-md text-body-md min-h-screen bg-background text-on-surface pb-24 md:pb-0 overflow-x-hidden flex flex-col">
      <style jsx global>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>

      {/* Header */}
      <header className="w-full sticky top-0 z-40 bg-surface border-b border-surface-container-highest flex items-center px-md h-14">
        <button onClick={() => router.push('/dashboard')} className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-primary active:scale-95 mr-2">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-headline-md text-headline-md font-bold text-primary">Quản lý nhân sự Sagrifood</h2>
      </header>

      <main className="flex-1 p-md md:p-lg space-y-md md:space-y-lg max-w-7xl mx-auto w-full">
        
        {/* --- HR ANALYTICS DASHBOARD --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Card 1: Tổng nhân sự */}
          <div className="bg-surface-container p-5 rounded-2xl border border-surface-container-highest shadow-sm flex items-center justify-between hover:border-primary/50 transition-colors">
            <div>
              <p className="text-on-surface-variant font-label-md mb-1 uppercase tracking-wider">Tổng Nhân Sự</p>
              <h3 className="text-4xl font-bold text-primary">{totalStaff}</h3>
              <p className="text-sm text-on-surface-variant mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-status-success text-sm">trending_up</span> Đang hoạt động
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">groups</span>
            </div>
          </div>

          {/* Card 2: Tỷ lệ Nam / Nữ */}
          <div className="bg-surface-container p-5 rounded-2xl border border-surface-container-highest shadow-sm flex items-center gap-6 hover:border-primary/50 transition-colors">
            {/* Simple CSS Pie Chart */}
            <div 
              className="w-16 h-16 rounded-full shadow-inner flex-shrink-0"
              style={{
                background: `conic-gradient(#3b82f6 ${malePercentage}%, #ec4899 ${malePercentage}% 100%)`
              }}
            ></div>
            <div className="flex-1">
              <p className="text-on-surface-variant font-label-md mb-2 uppercase tracking-wider">Tỷ lệ Giới tính</p>
              <div className="flex justify-between items-center mb-1">
                <span className="flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Nam ({malePercentage}%)
                </span>
                <span className="font-mono text-sm">{maleCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1 text-sm font-bold text-pink-600 dark:text-pink-400">
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div> Nữ ({100 - malePercentage}%)
                </span>
                <span className="font-mono text-sm">{femaleCount}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Nhân sự mới */}
          <div className="bg-surface-container p-5 rounded-2xl border border-surface-container-highest shadow-sm flex flex-col justify-center hover:border-primary/50 transition-colors">
             <div className="flex justify-between items-start mb-2">
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider">Nhân sự mới (30 ngày)</p>
                <span className="bg-secondary-container text-on-secondary-container text-xs px-2 py-0.5 rounded-full font-bold">
                  +{newEmployees.length}
                </span>
             </div>
             {newEmployees.length > 0 ? (
               <div className="flex -space-x-2 overflow-hidden mt-1 px-2">
                 {newEmployees.map(emp => (
                   <div key={emp.id} title={emp.hoTen} className="inline-block h-8 w-8 rounded-full ring-2 ring-surface bg-primary text-white flex items-center justify-center text-xs font-bold">
                     {emp.hoTen.split(' ').pop()?.[0]}
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-sm text-on-surface-variant italic">Không có nhân viên mới</p>
             )}
          </div>
        </section>

        {/* Filters */}
        <section className="bg-surface-container border border-surface-container-highest p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative w-full md:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc mã..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant text-[18px]">store</span>
              <select 
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary cursor-pointer appearance-none"
              >
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="relative w-28">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant text-[18px]">wc</span>
              <select 
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary cursor-pointer appearance-none"
              >
                <option value="Tất cả">Giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>
        </section>

        {/* Data Table */}
        <section className="bg-surface-container border border-surface-container-highest rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-surface-container-high border-b border-surface-container-highest text-sm">
                  <th className="px-4 py-3 font-semibold text-on-surface-variant uppercase text-center w-14">Avatar</th>
                  <th className="px-4 py-3 font-semibold text-on-surface-variant uppercase">Mã NV</th>
                  <th className="px-4 py-3 font-semibold text-on-surface-variant uppercase">Họ Tên</th>
                  <th className="px-4 py-3 font-semibold text-on-surface-variant uppercase">Giới tính</th>
                  <th className="px-4 py-3 font-semibold text-on-surface-variant uppercase">Quầy phụ trách / Chi nhánh</th>
                  <th className="px-4 py-3 font-semibold text-on-surface-variant uppercase">Thâm niên</th>
                  <th className="px-4 py-3 font-semibold text-on-surface-variant uppercase text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-50 mb-2">person_search</span>
                      <p className="text-on-surface-variant">Không tìm thấy dữ liệu.</p>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(emp => {
                    const tenure = calculateTenure(emp.ngayVaoLam);
                    const isVeteran = tenure >= 5;
                    const avatarBg = emp.gioiTinh === 'Nam' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300';
                    
                    return (
                      <tr key={emp.id} className="hover:bg-surface-container-high transition-colors group cursor-pointer" onClick={() => { setSelectedEmployee(emp); setIsDetailModalOpen(true); }}>
                        <td className="px-4 py-3 flex justify-center">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${avatarBg}`}>
                            {emp.hoTen.split(' ').pop()?.[0]?.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-on-surface-variant">{emp.maNV}</td>
                        <td className="px-4 py-3 font-bold text-on-surface">{emp.hoTen}</td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant">{emp.gioiTinh}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getBranchBadgeColor(emp.store)}`}>
                            {emp.store}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{tenure} năm</span>
                            {isVeteran && (
                              <span className="material-symbols-outlined text-[16px] text-yellow-500" title="Nhân viên kỳ cựu">workspace_premium</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors">
                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Employee Detail Modal - Cập nhật Giao diện (2 cột) */}
      {isDetailModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface w-full max-w-3xl rounded-2xl border border-surface-container-highest shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-surface-container-highest px-6 py-5 flex justify-between items-center relative overflow-hidden">
              <div className="flex items-center gap-4 z-10">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl border-2 border-surface ${selectedEmployee.gioiTinh === 'Nam' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300'}`}>
                  {selectedEmployee.hoTen.split(' ').pop()?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-headline-sm text-on-surface font-bold leading-tight">{selectedEmployee.hoTen}</h3>
                  <p className="font-label-md text-on-surface-variant flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">badge</span> {selectedEmployee.maNV}</span>
                    &bull;
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">wc</span> {selectedEmployee.gioiTinh}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors z-10 active:scale-95">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Profile Content (2 Columns) */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface">
              
              {/* Cột 1: Thông tin cá nhân */}
              <div className="space-y-5">
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 border-b border-surface-container-highest pb-2">
                  <span className="material-symbols-outlined text-[18px]">person</span> Thông tin Cá nhân
                </h4>
                
                <div className="bg-surface-container-low p-4 rounded-xl space-y-4">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wide font-semibold">Giới tính</p>
                    <p className="font-medium text-on-surface text-[15px]">{selectedEmployee.gioiTinh}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wide font-semibold">Địa chỉ làm việc</p>
                    <p className="font-medium text-on-surface text-[15px] flex items-start gap-1">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0 mt-0.5">location_on</span>
                      {selectedEmployee.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cột 2: Thông tin công việc (Tập trung Địa điểm) */}
              <div className="space-y-5">
                <h4 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2 border-b border-surface-container-highest pb-2">
                  <span className="material-symbols-outlined text-[18px]">work</span> Thông tin Công việc
                </h4>

                <div className="bg-surface-container-low p-4 rounded-xl space-y-4">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wide font-semibold">Quầy phụ trách / Nơi làm việc</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold border ${getBranchBadgeColor(selectedEmployee.store)}`}>
                         <span className="material-symbols-outlined text-[16px] mr-1">store</span>
                         {selectedEmployee.store}
                       </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wide font-semibold">Ngày vào làm</p>
                      <p className="font-medium text-on-surface font-mono text-[15px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">calendar_today</span>
                        {selectedEmployee.ngayVaoLam}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wide font-semibold">Ngày ký Hợp đồng</p>
                      <p className="font-medium text-on-surface font-mono text-[15px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">edit_document</span>
                        {selectedEmployee.ngayKyHD}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-surface-container-highest mt-2">
                    <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wide font-semibold">Thâm niên công tác</p>
                    <p className="font-medium text-on-surface flex items-center gap-2 text-[15px]">
                      <span className="text-primary font-bold">{calculateTenure(selectedEmployee.ngayVaoLam)} năm</span>
                      {calculateTenure(selectedEmployee.ngayVaoLam) >= 5 && (
                        <span className="inline-flex items-center gap-1 text-[13px] font-bold text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 px-2.5 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-900/50">
                          <span className="material-symbols-outlined text-[14px]">stars</span> Nhân viên kỳ cựu
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

