import Link from "next/link";

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-surface border-r border-outline-variant h-screen sticky top-0 hidden lg:flex flex-col">
      <div className="p-6 border-b border-outline-variant">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
          Admin Portal
        </h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors font-medium">
          <span className="material-symbols-outlined">monitoring</span>
          Tổng quan Kỹ thuật
        </Link>
        <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors font-medium">
          <span className="material-symbols-outlined">group</span>
          Quản lý Người dùng
        </Link>
        <Link href="/admin/departments" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors font-medium">
          <span className="material-symbols-outlined">account_tree</span>
          Cơ cấu Tổ chức
        </Link>
        <Link href="/admin/logs" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors font-medium">
          <span className="material-symbols-outlined">receipt_long</span>
          Nhật ký Hệ thống
        </Link>
      </nav>
      <div className="p-4 border-t border-outline-variant">
        <p className="text-xs text-outline text-center">Sagrifood HRM v1.0</p>
      </div>
    </aside>
  );
}
