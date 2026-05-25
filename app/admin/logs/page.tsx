"use client";

import { useState } from "react";
import NotificationBell from "@/components/NotificationBell";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuditLogsPage() {
  const user = useAuthStore((state) => state.user);

  // Fake Audit Logs
  const [logs] = useState([
    { id: "LOG-001", time: "2026-05-25 15:30:12", user: "manager_hr", category: "System", action: "Phê duyệt đơn phép (REQ-992)", ip: "192.168.1.104", status: "SUCCESS" },
    { id: "LOG-002", time: "2026-05-25 15:28:05", user: "admin_company_100", category: "Admin", action: "Thay đổi Role tài khoản (staff_012)", ip: "113.190.23.44", status: "SUCCESS" },
    { id: "LOG-003", time: "2026-05-25 14:15:22", user: "manager_kd", category: "User", action: "Đăng nhập hệ thống", ip: "14.232.112.9", status: "SUCCESS" },
    { id: "LOG-004", time: "2026-05-25 14:10:01", user: "staff_055", category: "Security", action: "Sai mật khẩu quá 5 lần (staff_055)", ip: "115.75.211.8", status: "FAILED" },
    { id: "LOG-005", time: "2026-05-25 13:45:00", user: "director_100", category: "System", action: "Từ chối đơn phép (REQ-991)", ip: "118.69.252.17", status: "SUCCESS" },
    { id: "LOG-006", time: "2026-05-25 11:20:11", user: "admin_company_100", category: "Admin", action: "Khóa tài khoản (staff_008)", ip: "113.190.23.44", status: "SUCCESS" },
  ]);

  const [isBackupOpen, setIsBackupOpen] = useState(false);

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
            <h1 className="text-headline-sm font-headline-sm text-primary font-bold">Nhật ký Hệ thống</h1>
            <p className="text-label-sm text-on-surface-variant leading-none">Security & Audit Logs</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          
          {/* Backup Management Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsBackupOpen(!isBackupOpen)}
              className="flex items-center gap-2 bg-surface-container border border-outline-variant text-on-surface-variant px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
              Quản lý Lưu trữ (Backups)
              <span className="material-symbols-outlined text-[18px]">arrow_drop_down</span>
            </button>
            
            {isBackupOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-surface border border-outline-variant rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-outline-variant bg-surface-container/50">
                  <p className="text-[12px] text-outline font-bold">BẢN SAO LƯU HÀNG THÁNG</p>
                  <p className="text-[10px] text-on-surface-variant">Tự động gom file ZIP giải phóng DB</p>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {['04/2026', '03/2026', '02/2026'].map((month, idx) => (
                    <div key={idx} className="p-3 border-b border-outline-variant/30 hover:bg-surface-container transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">folder_zip</span>
                        <div>
                          <p className="text-[13px] text-on-surface font-bold">Backup_Log_Thang{month.replace('/', '_')}.zip</p>
                          <p className="text-[11px] text-outline">Kích thước: {(Math.random() * 5 + 1).toFixed(1)} MB</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1.5 text-primary hover:bg-primary/10 rounded" title="Tải xuống">
                          <span className="material-symbols-outlined text-[16px]">download</span>
                        </button>
                        <button className="p-1.5 text-error hover:bg-error/10 rounded" title="Phục hồi (Restore)">
                          <span className="material-symbols-outlined text-[16px]">settings_backup_restore</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <NotificationBell />
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border border-outline-variant cursor-pointer ml-2">
            <span className="text-on-primary-container font-bold text-[12px]">{user?.name?.substring(0, 2).toUpperCase() || 'AD'}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-container/50 p-4 rounded-2xl border border-outline-variant/50">
          <div className="flex gap-4 w-full md:w-auto">
            <input type="date" className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary" />
            <select className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary">
              <option value="">Tất cả Hành động</option>
              <option value="LOGIN">Đăng nhập</option>
              <option value="APPROVE">Phê duyệt</option>
              <option value="UPDATE">Cập nhật dữ liệu</option>
            </select>
          </div>
          <div className="relative w-full md:w-80 group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm User, IP, Target..."
              className="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface placeholder:text-outline"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-outline-variant">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest text-on-surface-variant text-[12px] uppercase tracking-wider border-b border-outline-variant">
                <th className="py-3 px-6 font-bold w-48">Thời gian</th>
                <th className="py-3 px-6 font-bold w-40">Tài khoản</th>
                <th className="py-3 px-6 font-bold w-40">IP Truy cập</th>
                <th className="py-3 px-6 font-bold w-32 text-center">Phân loại</th>
                <th className="py-3 px-6 font-bold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-[13px] font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="py-3 px-6 text-outline">{log.time}</td>
                  <td className="py-3 px-6 text-on-surface font-bold">{log.user}</td>
                  <td className="py-3 px-6 text-outline">{log.ip}</td>
                  <td className="py-3 px-6 text-center">
                    {log.category === 'Security' && <span className="bg-error/10 text-error border border-error/20 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase">Bảo mật</span>}
                    {log.category === 'Admin' && <span className="bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase">Admin</span>}
                    {log.category === 'User' && <span className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase">Đăng nhập</span>}
                    {log.category === 'System' && <span className="bg-tertiary/10 text-tertiary border border-tertiary/20 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase">Hệ thống</span>}
                  </td>
                  <td className="py-3 px-6 text-on-surface-variant">
                    {log.action}
                    {log.status === 'FAILED' && <span className="ml-2 text-error font-bold text-[10px] uppercase"> (Failed)</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-outline-variant flex justify-between items-center text-sm text-outline font-sans">
            <span>Hiển thị 1 - 6 trên tổng 1,248 bản ghi</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-surface-container rounded hover:bg-surface-container-highest transition-colors disabled:opacity-50">Trước</button>
              <button className="px-3 py-1 bg-surface-container rounded hover:bg-surface-container-highest transition-colors disabled:opacity-50">Sau</button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
