"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { showToast } from "@/components/GlobalToast";
import AddEmployeeModal from "@/components/AddEmployeeModal";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  branch: string; // Home store
  currentAssignedStore: string; // Active working store (may differ during temp assignment)
  phone: string;
  startDate: string;
  contractExpiry: string;
  status: "Chính thức" | "Thử việc" | "Thai sản" | "Nghỉ việc";
  avatar: string;
}

interface CrossStoreAssignment {
  empId: string;
  fromStore: string;
  toStore: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason: string;
}

interface AssignFormState {
  toStore: string;
  startDate: string;
  endDate: string;
  reason: string;
}

const INITIAL_EMPLOYEES: Employee[] = [
  { id: "EMP-001", name: "Nguyễn Văn An", position: "Bán hàng", department: "Kinh Doanh", branch: "Emart Gò Vấp", currentAssignedStore: "Coop Cống Quỳnh", phone: "0901234567", startDate: "15/01/2024", contractExpiry: "15/01/2027", status: "Chính thức", avatar: "NA" },
  { id: "EMP-002", name: "Trần Thị Bình", position: "Thu ngân", department: "Kinh Doanh", branch: "Lotte Mart Q7", currentAssignedStore: "Lotte Mart Q7", phone: "0912345678", startDate: "01/03/2024", contractExpiry: "25/06/2026", status: "Thử việc", avatar: "TB" },
  { id: "EMP-003", name: "Lê Văn Cường", position: "Nhân viên Kho", department: "Kho vận", branch: "Sagrifood Q1", currentAssignedStore: "Sagrifood Q1", phone: "0923456789", startDate: "10/06/2023", contractExpiry: "10/06/2025", status: "Chính thức", avatar: "LC" },
  { id: "EMP-004", name: "Phạm Thị Dung", position: "Kế toán", department: "TCHC", branch: "Văn phòng HQ", currentAssignedStore: "Văn phòng HQ", phone: "0934567890", startDate: "20/02/2022", contractExpiry: "20/02/2024", status: "Nghỉ việc", avatar: "PD" },
  { id: "EMP-005", name: "Đặng Văn Em", position: "Bảo vệ", department: "Hành chính", branch: "Emart Gò Vấp", currentAssignedStore: "Emart Gò Vấp", phone: "0945678901", startDate: "05/05/2023", contractExpiry: "05/05/2026", status: "Thai sản", avatar: "DE" },
  { id: "EMP-006", name: "Vũ Thị Fát", position: "Thu ngân", department: "Kinh Doanh", branch: "Emart Gò Vấp", currentAssignedStore: "Emart Gò Vấp", phone: "0956789012", startDate: "11/09/2024", contractExpiry: "11/09/2025", status: "Chính thức", avatar: "VF" },
];

// EMP-001 is pre-assigned to Coop Cống Quỳnh as demo
const INITIAL_ASSIGNMENTS: CrossStoreAssignment[] = [
  { empId: "EMP-001", fromStore: "Emart Gò Vấp", toStore: "Coop Cống Quỳnh", startDate: "2026-06-10", endDate: "2026-06-25", reason: "Hỗ trợ khai trương" },
];

const MOCK_SCHEDULE = [
  { day: "T2", shift: "Ca sáng", location: "Quầy 1 - Emart", hours: 8 },
  { day: "T3", shift: "Ca chiều", location: "Quầy 2 - Emart", hours: 8 },
  { day: "T4", shift: "Ca sáng", location: "Quầy 1 - Emart", hours: 10 },
  { day: "T5", shift: "Ca sáng", location: "Quầy 1 - Emart", hours: 8 },
  { day: "T6", shift: "Ca chiều", location: "Kho chính", hours: 8 },
  { day: "T7", shift: "Ca sáng", location: "Quầy 1 - Emart", hours: 8 },
  { day: "CN", shift: "Nghỉ", location: "-", hours: 0 },
];

const ALL_STORES = ["Emart Gò Vấp", "Lotte Mart Q7", "Sagrifood Q1", "Văn phòng HQ", "Coop Cống Quỳnh", "BigC Q7"];
const DEPARTMENTS = ["Tất cả", "Kinh Doanh", "Kho vận", "TCHC", "Hành chính"];
const BRANCHES = ["Tất cả", "Emart Gò Vấp", "Lotte Mart Q7", "Sagrifood Q1", "Văn phòng HQ"];

const TODAY = "2026-06-11";

const isExpiringSoon = (expiryStr: string) => {
  if (!expiryStr) return false;
  const [d, m, y] = expiryStr.split('/');
  const expiryDate = new Date(`${y}-${m}-${d}`);
  const today = new Date(TODAY);
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 30;
};

const getActiveAssignment = (empId: string, assignments: CrossStoreAssignment[]): CrossStoreAssignment | null => {
  const today = new Date(TODAY);
  return assignments.find(a =>
    a.empId === empId &&
    new Date(a.startDate) <= today &&
    new Date(a.endDate) >= today
  ) ?? null;
};

export default function AdminEmployeesPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [assignments, setAssignments] = useState<CrossStoreAssignment[]>(INITIAL_ASSIGNMENTS);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("Tất cả");
  const [branchFilter, setBranchFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("Tất cả trạng thái");
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "schedule">("info");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [crossStoreTarget, setCrossStoreTarget] = useState<Employee | null>(null);
  const [assignForm, setAssignForm] = useState<AssignFormState>({ toStore: "", startDate: "", endDate: "", reason: "" });

  const isAdmin = user?.role === "admin" || user?.role === "admin_company";

  const handleAssignCrossStore = () => {
    if (!crossStoreTarget || !assignForm.toStore || !assignForm.startDate || !assignForm.endDate) {
      showToast("Vui lòng điền đầy đủ thông tin phân công", "error");
      return;
    }
    const newAssignment: CrossStoreAssignment = {
      empId: crossStoreTarget.id,
      fromStore: crossStoreTarget.branch,
      toStore: assignForm.toStore,
      startDate: assignForm.startDate,
      endDate: assignForm.endDate,
      reason: assignForm.reason,
    };
    setAssignments(prev => [...prev.filter(a => a.empId !== crossStoreTarget.id), newAssignment]);
    setEmployees(prev => prev.map(e =>
      e.id === crossStoreTarget.id ? { ...e, currentAssignedStore: assignForm.toStore } : e
    ));
    setCrossStoreTarget(null);
    setAssignForm({ toStore: "", startDate: "", endDate: "", reason: "" });
    showToast(`Đã phân công ${crossStoreTarget.name} tới ${assignForm.toStore}`, "success");
  };

  const handleRevokeCrossStore = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    setAssignments(prev => prev.filter(a => a.empId !== empId));
    setEmployees(prev => prev.map(e =>
      e.id === empId ? { ...e, currentAssignedStore: e.branch } : e
    ));
    showToast("Đã hủy phân công tăng cường", "success");
  };

  const handleAddEmployee = () => {
    // In production this would use the modal's form data
    const newEmp: Employee = {
      id: `EMP-00${employees.length + 1}`,
      name: "Nhân viên mới",
      position: "Nhân viên",
      department: "Kinh Doanh",
      branch: "Emart Gò Vấp",
      currentAssignedStore: "Emart Gò Vấp",
      phone: "09xxxxxxxx",
      startDate: new Date().toLocaleDateString("vi-VN"),
      contractExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString("vi-VN"),
      status: "Thử việc",
      avatar: "NV",
    };
    setEmployees(prev => [newEmp, ...prev]);
    setIsAddModalOpen(false);
    showToast("Thêm nhân viên thành công!", "success");
  };

  useEffect(() => {
    if (selectedEmp) {
      setActiveTab("info");
    }
  }, [selectedEmp]);

  useEffect(() => {
    if (user && !["admin_company", "admin"].includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.id.includes(search);
    const matchDept = deptFilter === "Tất cả" || e.department === deptFilter;
    const matchBranch = branchFilter === "Tất cả" || e.branch === branchFilter;
    const matchStatus = statusFilter === "Tất cả trạng thái" || e.status === statusFilter;
    return matchSearch && matchDept && matchBranch && matchStatus;
  });

  const handleToggleStatus = (id: string) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: e.status === "Nghỉ việc" ? "Chính thức" : "Nghỉ việc" } : e
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
    active: employees.filter((e) => ["Chính thức", "Thử việc"].includes(e.status)).length,
    inactive: employees.filter((e) => e.status === "Nghỉ việc").length,
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
              <option value="Tất cả trạng thái">Tất cả trạng thái</option>
              <option value="Chính thức">Chính thức</option>
              <option value="Thử việc">Thử việc</option>
              <option value="Thai sản">Thai sản</option>
              <option value="Nghỉ việc">Nghỉ việc</option>
            </select>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-on-primary px-5 py-2.5 rounded-lg font-bold text-[14px] shadow flex items-center gap-2 transition-all active:scale-95">
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
                  <th className="px-5 py-4 font-bold">Vị trí &amp; Phòng ban</th>
                  <th className="px-5 py-4 font-bold">Đang làm tại</th>
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
                  filtered.map((emp) => {
                      const activeAssign = getActiveAssignment(emp.id, assignments);
                      const isOnLoan = !!activeAssign;
                      return (
                    <tr
                      key={emp.id}
                      className="hover:bg-surface-container-lowest transition-colors group cursor-pointer"
                      onClick={() => setSelectedEmp(emp)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-[13px] ${
                            isOnLoan ? "bg-teal-500/10 border-teal-500/30 text-teal-400" : "bg-primary/10 border-primary/20 text-primary"
                          }`}>
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
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-[13px] font-medium text-on-surface">{emp.currentAssignedStore}</p>
                          {isOnLoan && (
                            <span className="text-[10px] text-outline line-through">{emp.branch}</span>
                          )}
                          {isOnLoan && (
                            <span className="flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                              <span className="material-symbols-outlined text-[11px]">swap_horiz</span>
                              Tăng cường
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[13px] text-on-surface-variant">{emp.startDate}</td>
                      <td className="px-5 py-4 flex flex-col gap-1 items-start">
                        <span className={`flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          emp.status === "Chính thức" ? "bg-[#10B981]/10 text-[#10B981]" :
                          emp.status === "Thử việc" ? "bg-[#EAB308]/10 text-[#EAB308]" :
                          emp.status === "Thai sản" ? "bg-[#A855F7]/10 text-[#A855F7]" :
                          "bg-error/10 text-error"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            emp.status === "Chính thức" ? "bg-[#10B981] animate-pulse" :
                            emp.status === "Thử việc" ? "bg-[#EAB308]" :
                            emp.status === "Thai sản" ? "bg-[#A855F7]" :
                            "bg-error"
                          }`} />
                          {emp.status}
                        </span>
                        {isExpiringSoon(emp.contractExpiry) && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-500 animate-pulse">
                            <span className="material-symbols-outlined text-[12px]">warning</span>
                            Sắp hết hạn HĐ
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isAdmin && emp.status !== "Thai sản" && emp.status !== "Nghỉ việc" && (
                            isOnLoan ? (
                              <button
                                onClick={() => handleRevokeCrossStore(emp.id)}
                                title="Hủy tăng cường"
                                className="w-8 h-8 rounded-full hover:bg-teal-500/10 flex items-center justify-center text-teal-400 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">undo</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => { setCrossStoreTarget(emp); setAssignForm({ toStore: "", startDate: "", endDate: "", reason: "" }); }}
                                title="Phân công tăng cường"
                                className="w-8 h-8 rounded-full hover:bg-teal-500/10 flex items-center justify-center text-on-surface-variant hover:text-teal-400 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                              </button>
                            )
                          )}
                          <button
                            onClick={() => handleToggleStatus(emp.id)}
                            title={emp.status === "Nghỉ việc" ? "Kích hoạt" : "Vô hiệu hóa"}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              emp.status !== "Nghỉ việc"
                                ? "hover:bg-error/10 text-on-surface-variant hover:text-error"
                                : "hover:bg-[#10B981]/10 text-on-surface-variant hover:text-[#10B981]"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {emp.status !== "Nghỉ việc" ? "lock" : "lock_open"}
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
                      );
                    })
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
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedEmp.status === "Chính thức" ? "bg-[#10B981]/20 text-[#10B981]" :
                  selectedEmp.status === "Thử việc" ? "bg-[#EAB308]/20 text-[#EAB308]" :
                  selectedEmp.status === "Thai sản" ? "bg-[#A855F7]/20 text-[#A855F7]" :
                  "bg-error/20 text-error"
                }`}>
                  {selectedEmp.status}
                </span>
              </div>
              <div className="flex border-b border-outline-variant mt-6 w-full px-6">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === "info" ? "border-primary text-primary" : "border-transparent text-outline hover:text-on-surface"
                  }`}
                >
                  Thông tin
                </button>
                <button
                  onClick={() => setActiveTab("schedule")}
                  className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === "schedule" ? "border-primary text-primary" : "border-transparent text-outline hover:text-on-surface"
                  }`}
                >
                  Lịch làm việc
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 text-sm">
              {activeTab === "info" ? (
                <div className="space-y-4">
                  {/* Cross-store assignment banner */}
                  {(() => {
                    const assign = getActiveAssignment(selectedEmp.id, assignments);
                    if (!assign) return null;
                    return (
                      <div className="bg-teal-500/10 border border-teal-500/25 rounded-xl p-3 flex items-start gap-3">
                        <span className="material-symbols-outlined text-teal-400 text-[22px] mt-0.5">swap_horiz</span>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-teal-400 mb-0.5">Đi tăng cường tại {assign.toStore}</p>
                          <p className="text-[11px] text-outline">{assign.startDate} → {assign.endDate}</p>
                          {assign.reason && <p className="text-[11px] text-teal-400/70 mt-0.5">Lý do: {assign.reason}</p>}
                        </div>
                        {isAdmin && (
                          <button onClick={() => handleRevokeCrossStore(selectedEmp.id)} className="text-[11px] text-teal-400 hover:text-teal-300 font-bold underline">
                            Hủy
                          </button>
                        )}
                      </div>
                    );
                  })()}
                  {[
                    { label: "Quầy gốc (Home)", value: selectedEmp.branch, icon: "home" },
                    { label: "Đang làm tại", value: selectedEmp.currentAssignedStore, icon: "store" },
                    { label: "Phòng ban", value: selectedEmp.department, icon: "account_tree" },
                    { label: "Số điện thoại", value: selectedEmp.phone, icon: "phone" },
                    { label: "Ngày vào làm", value: selectedEmp.startDate, icon: "calendar_today" },
                    { label: "Hết hạn HĐ", value: selectedEmp.contractExpiry, icon: "event_busy" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-4 p-3 bg-surface-container rounded-xl">
                      <span className="material-symbols-outlined text-primary text-[20px]">{row.icon}</span>
                      <div>
                        <p className="text-xs text-outline font-bold">{row.label}</p>
                        <p className="font-bold text-on-surface">{row.value}</p>
                      </div>
                    </div>
                  ))}
                  {isAdmin && !getActiveAssignment(selectedEmp.id, assignments) && selectedEmp.status !== "Thai sản" && selectedEmp.status !== "Nghỉ việc" && (
                    <button
                      onClick={() => { setCrossStoreTarget(selectedEmp); setAssignForm({ toStore: "", startDate: "", endDate: "", reason: "" }); }}
                      className="w-full py-2 rounded-xl border border-teal-500/30 text-teal-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-teal-500/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                      Phân công tăng cường liên điểm
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedEmp.status === "Thai sản" ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center bg-surface-container rounded-xl border border-outline-variant/30 mt-4">
                      <span className="material-symbols-outlined text-[48px] text-purple-500 mb-2">lock</span>
                      <h4 className="font-bold text-on-surface mb-1">Đang nghỉ thai sản</h4>
                      <p className="text-xs text-outline">Theo Điều 139 BLLĐ, hệ thống tạm khóa phân ca cho nhân sự đang trong thời gian nghỉ thai sản.</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-primary/10 rounded-xl p-4 flex items-center justify-between border border-primary/20">
                        <div>
                          <p className="text-xs font-bold text-primary mb-1">Tổng giờ làm dự kiến</p>
                          <p className="text-2xl font-extrabold text-primary">
                            {MOCK_SCHEDULE.reduce((sum, item) => sum + item.hours, 0)}h <span className="text-sm font-medium">/ tuần</span>
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-primary text-[32px]">schedule</span>
                      </div>
                      
                      {MOCK_SCHEDULE.reduce((sum, item) => sum + item.hours, 0) > 48 && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3">
                          <span className="material-symbols-outlined text-red-500">warning</span>
                          <div>
                            <p className="text-sm font-bold text-red-500">Vượt quá giờ luật định (&gt;48h/tuần)</p>
                            <p className="text-xs text-red-500/80">Theo Điều 105 BLLĐ, thời giờ làm việc bình thường không quá 48 giờ trong 1 tuần.</p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {MOCK_SCHEDULE.map((s) => (
                          <div key={s.day} className="flex items-center justify-between p-3 bg-surface-container rounded-xl border border-outline-variant/30">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[13px] border ${
                                s.shift === "Nghỉ" ? "bg-surface-container-high text-outline border-outline-variant" : "bg-surface text-on-surface border-outline-variant/50"
                              }`}>
                                {s.day}
                              </div>
                              <div>
                                <p className={`font-bold text-[13px] ${s.shift === "Nghỉ" ? "text-outline" : "text-on-surface"}`}>{s.location}</p>
                                <p className="text-[11px] text-outline">Giờ làm: {s.hours}h</p>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              s.shift === "Ca sáng" ? "bg-[#3B82F6]/10 text-[#3B82F6]" :
                              s.shift === "Ca chiều" ? "bg-[#F97316]/10 text-[#F97316]" :
                              "bg-outline-variant/30 text-outline"
                            }`}>
                              {s.shift}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
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

      {crossStoreTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-surface border border-outline-variant rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-teal-400">swap_horiz</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">Phân công Tăng cường</h3>
                <p className="text-xs text-outline">{crossStoreTarget.name} • {crossStoreTarget.branch}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-outline mb-1 block">Quầy đích (Destination)</label>
                <select
                  value={assignForm.toStore}
                  onChange={e => setAssignForm(p => ({ ...p, toStore: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal-400"
                >
                  <option value="">-- Chọn quầy --</option>
                  {ALL_STORES.filter(s => s !== crossStoreTarget.branch).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-outline mb-1 block">Ngày bắt đầu</label>
                  <input type="date" value={assignForm.startDate} onChange={e => setAssignForm(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal-400 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-outline mb-1 block">Ngày kết thúc</label>
                  <input type="date" value={assignForm.endDate} onChange={e => setAssignForm(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal-400 [color-scheme:dark]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-outline mb-1 block">Lý do / Ghi chú</label>
                <input type="text" placeholder="VD: Hỗ trợ khai trương, tăng ca cuối năm..."
                  value={assignForm.reason} onChange={e => setAssignForm(p => ({ ...p, reason: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setCrossStoreTarget(null)} className="flex-1 py-2.5 rounded-lg border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container transition-colors text-sm">
                Hủy
              </button>
              <button onClick={handleAssignCrossStore} className="flex-1 py-2.5 rounded-lg bg-teal-500 text-white font-bold hover:bg-teal-400 active:scale-95 transition-all text-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check</span>
                Xác nhận phân công
              </button>
            </div>
          </div>
        </div>
      )}

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddEmployee}
      />
    </div>
  );
}
