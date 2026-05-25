"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import AddEmployeeModal from "@/components/AddEmployeeModal";

interface Employee {
  id: string;
  code: string;
  name: string;
  position: string;
  department: string;
  phone: string;
  status: "working" | "on_leave" | "resigned";
  avatar: string;
}

const MOCK_EMPLOYEES: Employee[] = [
  { id: "1", code: "NV001", name: "Nguyễn Thị Hoa", position: "Cửa hàng phó", department: "Khối Cửa hàng", phone: "0901234567", status: "working", avatar: "" },
  { id: "2", code: "NV002", name: "Trần Văn Nam", position: "Thu ngân", department: "Khối Cửa hàng", phone: "0912345678", status: "working", avatar: "" },
  { id: "3", code: "NV003", name: "Lê Ngọc Bích", position: "Sơ chế", department: "Khối Sản xuất", phone: "0923456789", status: "on_leave", avatar: "" },
  { id: "4", code: "NV004", name: "Phạm Văn Hùng", position: "Nhân viên Kho", department: "Khối Logistics", phone: "0934567890", status: "working", avatar: "" },
  { id: "5", code: "NV005", name: "Hoàng Thị Lan", position: "Bán hàng", department: "Khối Cửa hàng", phone: "0945678901", status: "working", avatar: "" },
  { id: "6", code: "NV006", name: "Vũ Đình Tuấn", position: "Bảo vệ", department: "Khối Hành chính", phone: "0956789012", status: "working", avatar: "" },
  { id: "7", code: "NV007", name: "Đặng Mỹ Linh", position: "Kiểm soát chất lượng", department: "Khối Sản xuất", phone: "0967890123", status: "working", avatar: "" },
  { id: "8", code: "NV008", name: "Bùi Trọng Nghĩa", position: "Giao hàng", department: "Khối Logistics", phone: "0978901234", status: "working", avatar: "" },
  { id: "9", code: "NV009", name: "Ngô Thanh Tùng", position: "Cửa hàng trưởng", department: "Khối Cửa hàng", phone: "0989012345", status: "on_leave", avatar: "" },
  { id: "10", code: "NV010", name: "Đỗ Hải Yến", position: "Thu ngân", department: "Khối Cửa hàng", phone: "0990123456", status: "working", avatar: "" }
];

const POSITIONS = ["Tất cả", "Cửa hàng trưởng", "Cửa hàng phó", "Thu ngân", "Bán hàng", "Sơ chế", "Nhân viên Kho", "Bảo vệ", "Kiểm soát chất lượng", "Giao hàng"];

export default function EmployeesPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("Tất cả");
  const [toastMessage, setToastMessage] = useState("");
  
  // Modal State
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Manager Check
    if (user && !["manager", "director", "admin_company", "admin"].includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!isMounted) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">Đang tải...</div>;
  }

  // Filter Logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter === "Tất cả" || emp.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  const handleResetPassword = (emp: Employee) => {
    if (window.confirm(`Bạn có chắc chắn muốn cấp lại mật khẩu mặc định (123456) cho nhân viên ${emp.name}?`)) {
      setToastMessage(`Đã cấp lại mật khẩu cho ${emp.name} thành công`);
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const openDetailModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="font-body-md text-body-md min-h-screen bg-background text-on-surface pb-24 md:pb-0 overflow-x-hidden flex flex-col">
      <style jsx global>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>

      {/* Top App Bar */}
      <header className="w-full sticky top-0 z-40 bg-surface border-b border-surface-container-highest flex items-center justify-between px-md h-14">
        <div className="flex items-center gap-md">
          <button onClick={() => router.push('/dashboard')} className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-primary active:scale-95">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="material-symbols-outlined text-primary hidden md:block">groups</span>
          <h2 className="font-headline-md text-headline-md font-bold text-primary">Quản lý nhân viên</h2>
        </div>
        <div className="flex items-center gap-md">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-xs bg-primary text-on-primary px-sm py-xs rounded-lg hover:brightness-110 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            <span className="font-label-md text-label-md hidden md:block font-bold">Thêm nhân viên</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-md md:p-lg space-y-md md:space-y-lg max-w-7xl mx-auto w-full">
        
        {/* Filters and Search */}
        <section className="bg-surface-container border border-surface-container-highest p-md rounded-xl flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative w-full md:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc mã nhân viên..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <span className="material-symbols-outlined text-on-surface-variant shrink-0">filter_list</span>
            <select 
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg px-4 py-2 focus:outline-none focus:border-primary shrink-0 cursor-pointer"
            >
              {POSITIONS.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Data Table */}
        <section className="bg-surface-container border border-surface-container-highest rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-high border-b border-surface-container-highest">
                  <th className="px-md py-sm font-label-sm text-on-surface-variant uppercase w-16 text-center">Avatar</th>
                  <th className="px-md py-sm font-label-sm text-on-surface-variant uppercase">Mã NV</th>
                  <th className="px-md py-sm font-label-sm text-on-surface-variant uppercase">Họ Tên</th>
                  <th className="px-md py-sm font-label-sm text-on-surface-variant uppercase">Chức vụ</th>
                  <th className="px-md py-sm font-label-sm text-on-surface-variant uppercase">SĐT</th>
                  <th className="px-md py-sm font-label-sm text-on-surface-variant uppercase">Trạng thái</th>
                  <th className="px-md py-sm font-label-sm text-on-surface-variant uppercase text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-50 mb-2">person_search</span>
                      <p className="text-on-surface-variant">Không tìm thấy nhân viên nào phù hợp.</p>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-surface-container-high transition-colors group">
                      <td className="px-md py-2 flex justify-center">
                        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm border border-primary/20">
                          {emp.name.split(' ').pop()?.[0]?.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-md py-2 font-body-md text-on-surface font-mono text-sm">{emp.code}</td>
                      <td className="px-md py-2 font-body-md text-on-surface font-bold">{emp.name}</td>
                      <td className="px-md py-2 font-label-md text-on-surface-variant">{emp.position}</td>
                      <td className="px-md py-2 font-label-md text-on-surface-variant">{emp.phone}</td>
                      <td className="px-md py-2">
                        {emp.status === 'working' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-success/20 border border-status-success/30 text-status-success text-[12px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span> Đang làm việc
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tertiary-container/20 border border-tertiary/30 text-tertiary text-[12px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Đang nghỉ phép
                          </span>
                        )}
                      </td>
                      <td className="px-md py-2">
                        <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openDetailModal(emp)} className="p-1.5 rounded bg-surface-container-highest hover:bg-primary/20 hover:text-primary transition-colors text-on-surface-variant" title="Xem chi tiết">
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          <button onClick={() => {}} className="p-1.5 rounded bg-surface-container-highest hover:bg-secondary/20 hover:text-secondary-fixed transition-colors text-on-surface-variant" title="Chỉnh sửa">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button onClick={() => handleResetPassword(emp)} className="p-1.5 rounded bg-surface-container-highest hover:bg-error/20 hover:text-error transition-colors text-on-surface-variant" title="Cấp lại mật khẩu">
                            <span className="material-symbols-outlined text-[20px]">key</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Mock */}
          <div className="p-4 border-t border-surface-container-highest flex items-center justify-between text-on-surface-variant font-label-sm">
            <span>Hiển thị {filteredEmployees.length} kết quả</span>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary font-bold">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
            </div>
          </div>
        </section>
      </main>

      {/* Employee Detail Modal */}
      {isDetailModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container w-full max-w-lg rounded-2xl border border-surface-container-highest shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-surface-container-highest p-6 flex justify-between items-start relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
              
              <div className="flex items-center gap-4 z-10">
                <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-2xl border-4 border-surface-container shadow-sm">
                  {selectedEmployee.name.split(' ').pop()?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-headline-md text-on-surface font-bold">{selectedEmployee.name}</h3>
                  <p className="font-label-md text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">badge</span> {selectedEmployee.code}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors z-10">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-high p-3 rounded-lg border border-outline-variant/20">
                  <span className="font-label-sm text-on-surface-variant block mb-1">Chức vụ</span>
                  <span className="font-body-md text-on-surface font-bold">{selectedEmployee.position}</span>
                </div>
                <div className="bg-surface-container-high p-3 rounded-lg border border-outline-variant/20">
                  <span className="font-label-sm text-on-surface-variant block mb-1">Khối/Bộ phận</span>
                  <span className="font-body-md text-on-surface font-bold">{selectedEmployee.department}</span>
                </div>
                <div className="bg-surface-container-high p-3 rounded-lg border border-outline-variant/20">
                  <span className="font-label-sm text-on-surface-variant block mb-1">Số điện thoại</span>
                  <span className="font-body-md text-on-surface font-bold">{selectedEmployee.phone}</span>
                </div>
                <div className="bg-surface-container-high p-3 rounded-lg border border-outline-variant/20">
                  <span className="font-label-sm text-on-surface-variant block mb-1">Trạng thái</span>
                  <span className={`font-body-md font-bold ${selectedEmployee.status === 'working' ? 'text-status-success' : 'text-tertiary'}`}>
                    {selectedEmployee.status === 'working' ? 'Đang làm việc' : 'Đang nghỉ phép'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-surface-container-highest flex justify-end gap-3 bg-surface-container-low">
              <button onClick={() => setIsDetailModalOpen(false)} className="px-4 py-2 rounded-lg font-label-md text-on-surface hover:bg-surface-container-highest transition-colors">Đóng</button>
              <button onClick={() => { setIsDetailModalOpen(false); handleResetPassword(selectedEmployee); }} className="px-4 py-2 rounded-lg font-label-md font-bold bg-error-container text-on-error-container border border-error/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">key</span> Cấp lại mật khẩu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 md:bottom-10 left-1/2 transform -translate-x-1/2 bg-surface-container-high border border-primary text-on-surface px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-3 animate-fade-in-up">
          <span className="material-symbols-outlined text-status-success">check_circle</span>
          <p className="font-label-md font-bold">{toastMessage}</p>
        </div>
      )}

      {/* Add Employee Modal (AI OCR) */}
      <AddEmployeeModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={() => {
          setIsAddModalOpen(false);
          setToastMessage("Đã thêm nhân viên mới thành công từ dữ liệu AI!");
          setTimeout(() => setToastMessage(""), 3000);
        }} 
      />

      {/* Global Bottom Navigation For Mobile View */}
      <BottomNav />
    </div>
  );
}
