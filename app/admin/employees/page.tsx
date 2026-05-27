"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { showToast } from "@/components/GlobalToast";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  branch: string;
  phone: string;
  startDate: string;
  status: "active" | "inactive";
  avatar: string;
}

const INITIAL_EMPLOYEES: Employee[] = [
  { id: "EMP-001", name: "Nguyễn Văn An", position: "Bán hàng", department: "Kinh Doanh", branch: "Emart Gò Vấp", phone: "0901234567", startDate: "15/01/2024", status: "active", avatar: "NA" },
  { id: "EMP-002", name: "Trần Thị Bình", position: "Thu ngân", department: "Kinh Doanh", branch: "Lotte Mart Q7", phone: "0912345678", startDate: "01/03/2024", status: "active", avatar: "TB" },
  { id: "EMP-003", name: "Lê Văn Cường", position: "Nhân viên Kho", department: "Kho vận", branch: "Sagrifood Q1", phone: "0923456789", startDate: "10/06/2023", status: "active", avatar: "LC" },
  { id: "EMP-004", name: "Phạm Thị Dung", position: "Kế toán", department: "TCHC", branch: "Văn phòng HQ", phone: "0934567890", startDate: "20/02/2022", status: "inactive", avatar: "PD" },
  { id: "EMP-005", name: "Đặng Văn Em", position: "Bảo vệ", department: "Hành chính", branch: "Emart Gò Vấp", phone: "0945678901", startDate: "05/05/2023", status: "active", avatar: "DE" },
  { id: "EMP-006", name: "Vũ Thị Fát", position: "Thu ngân", department: "Kinh Doanh", branch: "Emart Gò Vấp", phone: "0956789012", startDate: "11/09/2024", status: "active", avatar: "VF" },
];

const DEPARTMENTS = ["Tất cả", "Kinh Doanh", "Kho vận", "TCHC", "Hành chính"];
const BRANCHES = ["Tất cả", "Emart Gò Vấp", "Lotte Mart Q7", "Sagrifood Q1", "Văn phòng HQ"];

export default function AdminEmployeesPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("Tất cả");
  const [branchFilter, setBranchFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState<Employee | null>(null);

  useEffect(() => {
    if (user && !["admin_company", "admin"].includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.id.includes(search);
    const matchDept = deptFilter === "Tất cả" || e.department === deptFilter;
    const matchBranch = branchFilter === "Tất cả" || e.branch === branchFilter;
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchDept && matchBranch && matchStatus;
  });

  const handleToggleStatus = (id: string) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: e.status === "active" ? "inactive" : "active" } : e
      )
    );
    showToast("Đã cập nhật trạng thái nhân viên", "success");
  };

  const handleDelete = (emp: Employee) => {
    setIsDeleteConfirm(emp);
  };

  const confirmDelete = () => {
    if (!isDeleteConfirm) return;
    setEmployees((prev) => prev.filter((e) => e.id !== isDeleteConfirm.id));
    showToast(`Đã xóa nhân viên ${isDeleteConfirm.name}`, "success");
    setIsDeleteConfirm(null);
    setSelectedEmp(null);
  };

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "active").length,
    inactive: employees.filter((e) => e.status === "inactive").length,
  };

  return (
    <div className="bg-background text-on-surface min-h-screen font-body-md flex flex-col pb-10">
      <style dangerouslySetInnerHTML={{ __html: `
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-card { background: rgba(23, 31, 51, 0.7); backdrop-filter: blur(8px); border: 1px solid rgba(144, 143, 160, 0.2); }
      ` }} />

      {/* Header */}
      <header className="w-full sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant px-6 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-headline-sm font-bold text-primary">Quản lý Nhân sự</h1>
          <p className="text-label-sm text-on-surface-variant leading-none">Danh sách toàn bộ nhân viên trong hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center border border-outline-variant cursor-pointer">
            <span className="text-on-primary-container font-bold text-[12px]">
              {user?.name?.substring(0, 2).toUpperCase() || "AD"}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Tổng nhân viên", value: stats.total, color: "text-primary", icon: "people" },
            { label: "Đang làm việc", value: stats.active, color: "text-[#10B981]", icon: "work" },
            { label: "Đã nghỉ việc", value: stats.inactive, color: "text-error", icon: "work_off" },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full bg-current/10 flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
              </div>
              <div>
                <p className="text-xs text-outline font-bold uppercase">{s.label}</p>
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative group w-full lg:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                type="text"
                placeholder="Tìm theo tên hoặc mã NV..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-[14px]"
              />
            </div>
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="bg-surface-container-low border border-outline-variant text-on-surface text-[13px] rounded-lg px-3 py-2.5 focus:outline-none">
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="bg-surface-container-low border border-outline-variant text-on-surface text-[13px] rounded-lg px-3 py-2.5 focus:outline-none">
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-surface-container-low border border-outline-variant text-on-surface text-[13px] rounded-lg px-3 py-2.5 focus:outline-none">
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang làm</option>
              <option value="inactive">Đã nghỉ</option>
            </select>
          </div>
          <button className="bg-primary hover:bg-primary/90 text-on-primary px-5 py-2.5 rounded-lg font-bold text-[14px] shadow flex items-center gap-2 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Thêm nhân viên
          </button>
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest/50 text-outline text-[12px] uppercase tracking-wider border-b border-outline-variant/50">
                  <th className="px-5 py-4 font-bold">Nhân viên</th>
                  <th className="px-5 py-4 font-bold">Vị trí & Phòng ban</th>
                  <th className="px-5 py-4 font-bold">Chi nhánh</th>
                  <th className="px-5 py-4 font-bold">Ngày vào làm</th>
                  <th className="px-5 py-4 font-bold">Trạng thái</th>
                  <th className="px-5 py-4 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-on-surface-variant">
                      Không tìm thấy nhân viên phù hợp.
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-surface-container-lowest transition-colors group cursor-pointer"
                      onClick={() => setSelectedEmp(emp)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-[13px]">
                            {emp.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface text-[14px]">{emp.name}</p>
                            <p className="text-[11px] text-outline">{emp.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[13px] font-medium text-on-surface">{emp.position}</p>
                        <p className="text-[11px] text-outline">{emp.department}</p>
                      </td>
                      <td className="px-5 py-4 text-[13px] text-on-surface-variant">{emp.branch}</td>
                      <td className="px-5 py-4 text-[13px] text-on-surface-variant">{emp.startDate}</td>
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          emp.status === "active"
                            ? "bg-[#10B981]/10 text-[#10B981]"
                            : "bg-error/10 text-error"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${emp.status === "active" ? "bg-[#10B981] animate-pulse" : "bg-error"}`} />
                          {emp.status === "active" ? "Đang làm" : "Đã nghỉ"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleToggleStatus(emp.id)}
                            title={emp.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              emp.status === "active"
                                ? "hover:bg-error/10 text-on-surface-variant hover:text-error"
                                : "hover:bg-[#10B981]/10 text-on-surface-variant hover:text-[#10B981]"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {emp.status === "active" ? "lock" : "lock_open"}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(emp)}
                            title="Xóa nhân viên"
                            className="w-8 h-8 rounded-full hover:bg-error/10 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-outline-variant flex justify-between items-center text-sm text-outline">
            <span>Hiển thị {filtered.length} / {employees.length} nhân viên</span>
          </div>
        </div>
      </main>

      {/* Detail Panel (slide-over) */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${selectedEmp ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSelectedEmp(null)}
      />
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-surface border-l border-outline-variant z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${selectedEmp ? "translate-x-0" : "translate-x-full"}`}>
        {selectedEmp && (
          <>
            <div className="p-6 border-b border-outline-variant relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent" />
              <div className="relative flex flex-col items-center text-center mt-2 space-y-3">
                <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center border-2 border-primary text-primary text-2xl font-bold">
                  {selectedEmp.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface">{selectedEmp.name}</h3>
                  <p className="text-xs text-outline mt-1">{selectedEmp.id} · {selectedEmp.position}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedEmp.status === "active" ? "bg-[#10B981]/20 text-[#10B981]" : "bg-error/20 text-error"}`}>
                  {selectedEmp.status === "active" ? "Đang làm việc" : "Đã nghỉ việc"}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
              {[
                { label: "Phòng ban", value: selectedEmp.department, icon: "account_tree" },
                { label: "Chi nhánh", value: selectedEmp.branch, icon: "store" },
                { label: "Số điện thoại", value: selectedEmp.phone, icon: "phone" },
                { label: "Ngày vào làm", value: selectedEmp.startDate, icon: "calendar_today" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-4 p-3 bg-surface-container rounded-xl">
                  <span className="material-symbols-outlined text-primary text-[20px]">{row.icon}</span>
                  <div>
                    <p className="text-xs text-outline font-bold">{row.label}</p>
                    <p className="font-bold text-on-surface">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-outline-variant flex gap-3">
              <button
                onClick={() => setSelectedEmp(null)}
                className="flex-1 py-2.5 rounded-lg border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => handleDelete(selectedEmp)}
                className="flex-1 py-2.5 rounded-lg bg-error/10 border border-error/20 text-error font-bold hover:bg-error/20 transition-colors"
              >
                Xóa tài khoản
              </button>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {isDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-surface border border-outline-variant rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-3xl">delete_forever</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface">Xác nhận xóa nhân viên</h3>
              <p className="text-sm text-on-surface-variant">
                Bạn có chắc muốn xóa <span className="font-bold text-on-surface">{isDeleteConfirm.name}</span> khỏi hệ thống? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteConfirm(null)} className="flex-1 py-2.5 rounded-lg border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
                Hủy bỏ
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-lg bg-error text-on-error font-bold hover:bg-error/90 active:scale-95 transition-all">
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
