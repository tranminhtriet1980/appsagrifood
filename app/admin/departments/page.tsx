"use client";

import { useState } from "react";
import NotificationBell from "@/components/NotificationBell";
import { useAuthStore } from "@/store/useAuthStore";

export default function DepartmentsPage() {
  const user = useAuthStore((state) => state.user);
  const [departments, setDepartments] = useState([
    { id: "TCHC", name: "Phòng Tổ chức Hành chính", managerId: "manager_hr", employeeCount: 12 },
    { id: "KINH_DOANH", name: "Phòng Kinh doanh", managerId: "manager_kd", employeeCount: 45 },
    { id: "MARKETING", name: "Phòng Marketing", managerId: "manager_mkt", employeeCount: 8 },
    { id: "IT", name: "Phòng Công nghệ Thông tin", managerId: "admin_company_100", employeeCount: 5 },
  ]);
  const [selectedDept, setSelectedDept] = useState<any>(null);

  return (
    <div className="bg-background text-on-surface min-h-screen font-body-md flex flex-col pb-10">
      <style jsx global>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-card { background: rgba(23, 31, 51, 0.7); backdrop-filter: blur(8px); border: 1px solid rgba(144, 143, 160, 0.2); }
      `}</style>
      
      {/* Header */}
      <header className="w-full sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-headline-sm font-headline-sm text-primary font-bold">Cơ cấu Tổ chức</h1>
            <p className="text-label-sm text-on-surface-variant leading-none">Organization Chart & Departments</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border border-outline-variant cursor-pointer ml-2">
            <span className="text-on-primary-container font-bold text-[12px]">{user?.name?.substring(0, 2).toUpperCase() || 'AD'}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full h-[calc(100vh-64px)] flex gap-6">
        
        {/* Lẽ trái (30%): Cây tổ chức (Tree View 2 cấp) */}
        <div className="w-[30%] glass-card rounded-2xl flex flex-col overflow-hidden border border-outline-variant h-full">
          <div className="p-4 border-b border-outline-variant bg-surface/50">
            <h2 className="text-[16px] font-bold text-on-surface">Cấu trúc Công ty</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {/* Node Gốc */}
            <div className="flex items-center gap-2 text-primary font-bold mb-3 cursor-default">
              <span className="material-symbols-outlined text-[20px]">domain</span>
              Sagrifood
            </div>
            {/* Các Node Cấp 1 */}
            <div className="ml-5 border-l border-outline-variant/50 pl-4 space-y-2">
              {departments.map((dept) => (
                <div 
                  key={dept.id} 
                  onClick={() => setSelectedDept(dept)}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-[14px] ${selectedDept?.id === dept.id ? 'bg-primary/20 text-primary font-bold' : 'text-on-surface hover:bg-surface-container'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">account_balance</span>
                  {dept.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lẽ phải (70%): Bảng chi tiết */}
        <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden border border-outline-variant h-full relative">
          {!selectedDept ? (
            <div className="flex-1 flex flex-col items-center justify-center text-outline">
              <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">account_tree</span>
              <p>Chọn một phòng ban để xem chi tiết</p>
            </div>
          ) : (
            <>
              {/* Form Chi tiết */}
              <div className="p-6 border-b border-outline-variant bg-surface-container/30">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-[20px] font-bold text-on-surface">{selectedDept.name}</h2>
                    <p className="text-[12px] text-outline font-mono">Mã PB: {selectedDept.id}</p>
                  </div>
                  <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold hover:bg-primary/90 text-sm shadow-md">
                    Lưu Thay Đổi
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-bold text-on-surface-variant mb-1">Tên phòng ban</label>
                    <input 
                      type="text" 
                      defaultValue={selectedDept.name} 
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-on-surface-variant mb-1">Trưởng phòng phụ trách</label>
                    <select 
                      defaultValue={selectedDept.managerId}
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                    >
                      <option value="manager_hr">manager_hr (Trưởng phòng TCHC)</option>
                      <option value="manager_kd">manager_kd (Trưởng phòng Kinh doanh)</option>
                      <option value="manager_mkt">manager_mkt (Trưởng phòng MKT)</option>
                      <option value="admin_company_100">admin_company_100 (IT Admin)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Danh sách nhân sự */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-4 flex justify-between items-center bg-surface-container/10">
                  <h3 className="text-[14px] font-bold text-on-surface">Nhân sự trực thuộc ({selectedDept.employeeCount})</h3>
                  <button className="text-primary text-[13px] font-bold hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">person_add</span> Thêm
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-surface/90 backdrop-blur-sm z-10">
                      <tr className="text-outline text-[12px] border-b border-outline-variant">
                        <th className="py-2 px-4 font-bold">Mã NV</th>
                        <th className="py-2 px-4 font-bold">Họ & Tên</th>
                        <th className="py-2 px-4 font-bold">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30 text-[13px]">
                      {[...Array(5)].map((_, i) => (
                        <tr key={i} className="hover:bg-surface-container/30 transition-colors">
                          <td className="py-3 px-4 font-mono text-on-surface-variant">EMP-{1000 + i}</td>
                          <td className="py-3 px-4 font-bold text-on-surface">Nhân viên {selectedDept.name} {i+1}</td>
                          <td className="py-3 px-4">
                            <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] border border-outline-variant">Staff</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-center mt-4 text-outline text-[12px] italic">Hiển thị mẫu 5 nhân viên.</div>
                </div>
              </div>
            </>
          )}
        </div>

      </main>
    </div>
  );
}
