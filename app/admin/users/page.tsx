"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { showToast } from "@/components/GlobalToast";

// Mock User Data
const initialUsers = [
  { id: "U001", name: "Nguyễn Văn Nhân Viên", username: "staff_100", role: "staff", department: "Kinh Doanh", status: "active", avatar: "NV" },
  { id: "U002", name: "Trần Quản Lý", username: "manager_100", role: "manager", department: "Kinh Doanh", status: "active", avatar: "QL" },
  { id: "U003", name: "Trưởng phòng TCHC", username: "manager_hr", role: "manager", department: "TCHC", status: "inactive", avatar: "TC" },
  { id: "U004", name: "Giám Đốc", username: "director_100", role: "director", department: "Ban Giám Đốc", status: "active", avatar: "GĐ" },
  { id: "U005", name: "Lê Quản Trị Hệ Thống", username: "admin_company_100", role: "admin_company", department: "IT", status: "active", avatar: "QT" },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "security">("info");
  
  useEffect(() => {
    // RBAC: Only admin or admin_company can access
    if (user && !["admin_company", "admin"].includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesDept = deptFilter === "all" || u.department === deptFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesDept && matchesStatus;
  });

  const handleOpenDrawer = (u: any) => {
    setSelectedUser(u);
    setActiveTab("info");
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedUser(null), 300); // Wait for transition
  };

  const handleSave = () => {
    showToast("Đã lưu thông tin người dùng", "success");
    handleCloseDrawer();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin_company": return <span className="px-2 py-1 bg-tertiary/20 text-tertiary rounded-md text-[10px] font-bold uppercase tracking-wider">Admin</span>;
      case "director": return <span className="px-2 py-1 bg-primary/20 text-primary rounded-md text-[10px] font-bold uppercase tracking-wider">Director</span>;
      case "manager": return <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-md text-[10px] font-bold uppercase tracking-wider">Manager</span>;
      default: return <span className="px-2 py-1 bg-surface-container-highest text-on-surface-variant rounded-md text-[10px] font-bold uppercase tracking-wider">Staff</span>;
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen font-body-md flex flex-col relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .glass-card { background: rgba(23, 31, 51, 0.7); backdrop-filter: blur(8px); border: 1px solid rgba(144, 143, 160, 0.2); }
      ` }} />
      
      {/* Header */}
      <header className="w-full sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="transition-all duration-150 active:scale-95 text-primary">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-headline-sm font-headline-sm text-primary font-bold">Quản lý Tài khoản</h1>
            <p className="text-label-sm text-on-surface-variant leading-none">Hệ thống có {users.length} tài khoản</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center border border-outline-variant cursor-pointer">
            <span className="text-on-primary-container font-bold text-[12px]">{user?.name?.substring(0, 2).toUpperCase() || 'AD'}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Top Bar: Search, Filters & Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative group w-full lg:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">search</span>
              <input 
                type="text" 
                placeholder="Tìm kiếm ID, Tên, Username..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none transition-all placeholder:text-outline/50 text-[14px]"
              />
            </div>
            
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-surface-container-low border border-outline-variant text-on-surface text-[13px] rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">Tất cả Vai trò</option>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="director">Director</option>
              <option value="admin_company">Admin</option>
            </select>
            
            <select 
              value={deptFilter} 
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-surface-container-low border border-outline-variant text-on-surface text-[13px] rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">Tất cả Phòng ban</option>
              <option value="Kinh Doanh">Kinh Doanh</option>
              <option value="TCHC">TCHC</option>
              <option value="Ban Giám Đốc">Ban Giám Đốc</option>
              <option value="IT">IT</option>
            </select>
            
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-container-low border border-outline-variant text-on-surface text-[13px] rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">Tất cả Trạng thái</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Action Split Button */}
          <div className="flex shadow-md rounded-lg overflow-hidden shrink-0">
            <button className="bg-[#6B4EFF] hover:bg-[#5a42d9] text-white px-5 py-2.5 text-[14px] font-bold transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">person_add</span> Tạo tài khoản
            </button>
            <div className="w-[1px] bg-white/20"></div>
            <button className="bg-[#6B4EFF] hover:bg-[#5a42d9] text-white px-3 py-2.5 transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">expand_more</span>
            </button>
          </div>
        </div>

        {/* Data Grid */}
        <div className="glass-card rounded-xl border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest/50 text-outline text-[12px] uppercase tracking-wider border-b border-outline-variant/50">
                  <th className="px-6 py-4 font-bold">Họ Tên & Avatar</th>
                  <th className="px-6 py-4 font-bold">Username</th>
                  <th className="px-6 py-4 font-bold">Vai trò</th>
                  <th className="px-6 py-4 font-bold">Phòng ban</th>
                  <th className="px-6 py-4 font-bold">Trạng thái</th>
                  <th className="px-6 py-4 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">Không tìm thấy tài khoản nào phù hợp.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr 
                      key={u.id} 
                      className="hover:bg-surface-container-lowest transition-colors group cursor-pointer"
                      onClick={() => handleOpenDrawer(u)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-[14px]">
                            {u.avatar}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-on-surface">{u.name}</p>
                            <p className="text-[11px] text-outline">{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] text-on-surface-variant font-medium">
                        {u.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(u.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[13px] text-on-surface-variant">
                        {u.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-[#10B981] animate-pulse' : 'bg-error'}`}></span>
                          <span className="text-[13px] font-medium text-on-surface-variant capitalize">{u.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" title="Reset Password">
                            <span className="material-symbols-outlined text-[18px]">key</span>
                          </button>
                          <button className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-error transition-colors" title="Deactivate">
                            <span className="material-symbols-outlined text-[18px]">lock</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Slide-out Drawer */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleCloseDrawer}
      ></div>
      
      {/* Drawer Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-surface border-l border-outline-variant z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {selectedUser && (
          <>
            {/* Drawer Header */}
            <div className="p-6 border-b border-outline-variant/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent"></div>
              <div className="relative flex flex-col items-center text-center mt-4 space-y-3">
                <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center border-2 border-primary shadow-lg text-primary text-[24px] font-bold">
                  {selectedUser.avatar}
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-on-surface">{selectedUser.name}</h3>
                  <p className="text-[13px] text-outline font-medium mt-1">ID: {selectedUser.id} • {selectedUser.department}</p>
                </div>
                <div className="flex gap-2 justify-center">
                  {getRoleBadge(selectedUser.role)}
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${selectedUser.status === 'active' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-error/20 text-error'}`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-outline-variant px-6 pt-4 gap-6">
              <button 
                onClick={() => setActiveTab("info")}
                className={`pb-3 text-[14px] font-bold border-b-2 transition-colors ${activeTab === "info" ? "border-primary text-primary" : "border-transparent text-outline hover:text-on-surface-variant"}`}
              >
                Thông tin
              </button>
              <button 
                onClick={() => setActiveTab("security")}
                className={`pb-3 text-[14px] font-bold border-b-2 transition-colors ${activeTab === "security" ? "border-primary text-primary" : "border-transparent text-outline hover:text-on-surface-variant"}`}
              >
                Bảo mật
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "info" ? (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-outline">Tên đăng nhập (Username)</label>
                    <input 
                      type="text" 
                      defaultValue={selectedUser.username}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-[14px] text-on-surface focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-outline">Phòng ban</label>
                    <select 
                      defaultValue={selectedUser.department}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-[14px] text-on-surface focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="Kinh Doanh">Kinh Doanh</option>
                      <option value="TCHC">TCHC</option>
                      <option value="Ban Giám Đốc">Ban Giám Đốc</option>
                      <option value="IT">IT</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-outline">Vai trò hệ thống</label>
                    <select 
                      defaultValue={selectedUser.role}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-[14px] text-on-surface focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="staff">Nhân viên (Staff)</option>
                      <option value="manager">Quản lý (Manager)</option>
                      <option value="director">Giám đốc (Director)</option>
                      <option value="admin_company">Quản trị viên (Admin)</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="glass-card rounded-xl p-4 border border-outline-variant/50 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">password</span>
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold mb-1">Mật khẩu hệ thống</h4>
                      <p className="text-[12px] text-on-surface-variant mb-3">Tạo ngẫu nhiên mật khẩu mới và gửi qua email cho người dùng.</p>
                      <button className="text-[12px] font-bold bg-surface-container-high hover:bg-surface-variant px-4 py-2 rounded-lg transition-colors border border-outline-variant">
                        Tạo mật khẩu ngẫu nhiên
                      </button>
                    </div>
                  </div>
                  
                  <div className="glass-card rounded-xl p-4 border border-outline-variant/50 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-tertiary">security_update_good</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[14px] font-bold mb-1">Yêu cầu đổi mật khẩu</h4>
                      <p className="text-[12px] text-on-surface-variant mb-3">Buộc người dùng phải đổi mật khẩu ở lần đăng nhập tiếp theo.</p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-surface bg-surface-container" />
                        <span className="text-[13px] font-medium text-on-surface">Kích hoạt</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-outline-variant bg-surface-container-lowest flex gap-3">
              <button 
                onClick={handleCloseDrawer}
                className="flex-1 px-4 py-2.5 rounded-lg border border-outline-variant font-bold text-[14px] text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Đóng
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-bold text-[14px] shadow-md transition-colors"
              >
                Lưu thay đổi
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
