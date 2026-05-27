"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useAuthStore } from '@/store/useAuthStore';
import ThemeToggle from '@/components/ThemeToggle';

interface LeaveRequest {
  id: string;
  staffId: string;
  name: string;
  role: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  substitute: string;
  duration: number;
  submittedAt: string;
}

const LEAVE_TYPE_COLORS: Record<string, string> = {
  'Nghỉ phép năm': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Nghỉ ốm (BHXH)': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Nghỉ không lương': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Nghỉ việc riêng': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: '1',
    staffId: 's1',
    name: 'Nguyễn Văn A',
    role: 'Bán hàng',
    leaveType: 'Nghỉ phép năm',
    startDate: '27/05/2026',
    endDate: '28/05/2026',
    reason: 'Giải quyết công việc gia đình ở quê.',
    status: 'Pending',
    substitute: 'Lê Văn C',
    duration: 2,
    submittedAt: '26/05/2026 08:30',
  },
  {
    id: '2',
    staffId: 's2',
    name: 'Trần Thị B',
    role: 'Thu ngân',
    leaveType: 'Nghỉ ốm (BHXH)',
    startDate: '29/05/2026',
    endDate: '29/05/2026',
    reason: 'Khám sức khỏe định kỳ và lấy thuốc.',
    status: 'Pending',
    substitute: 'Vũ Thị F',
    duration: 1,
    submittedAt: '26/05/2026 09:15',
  },
  {
    id: '3',
    staffId: 's4',
    name: 'Phạm Thị D',
    role: 'Nhân viên Kho',
    leaveType: 'Nghỉ phép năm',
    startDate: '01/06/2026',
    endDate: '03/06/2026',
    reason: 'Có lịch cá nhân quan trọng không thể dời.',
    status: 'Pending',
    substitute: 'Đặng Văn E',
    duration: 3,
    submittedAt: '25/05/2026 17:00',
  },
  {
    id: '4',
    staffId: 's6',
    name: 'Vũ Thị F',
    role: 'Thu ngân',
    leaveType: 'Nghỉ không lương',
    startDate: '05/06/2026',
    endDate: '05/06/2026',
    reason: 'Đi học quân sự bổ túc.',
    status: 'Pending',
    substitute: 'Trần Thị B',
    duration: 1,
    submittedAt: '25/05/2026 14:22',
  },
];

export default function ManagerLeavesApprovalPage() {
  const router = useRouter();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const managerUser = useAuthStore((s) => s.user);

  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_REQUESTS);
  const [activeTab, setActiveTab] = useState<'Pending' | 'History'>('Pending');

  // Rejection modal state
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const pendingList = useMemo(() => requests.filter((r) => r.status === 'Pending'), [requests]);
  const historyList = useMemo(() => requests.filter((r) => r.status !== 'Pending'), [requests]);

  const handleApprove = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;

    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r)));

    // Notify staff
    addNotification({
      senderName: managerUser?.name || 'Quản lý',
      title: 'Đơn xin nghỉ đã được duyệt ✅',
      message: `Đơn nghỉ ${req.leaveType} từ ${req.startDate} đến ${req.endDate} của bạn đã được phê duyệt.`,
      time: 'Vừa xong',
      targetRole: 'staff',
      targetUserId: req.staffId,
    });

    triggerToast(`✅ Đã duyệt đơn nghỉ của ${req.name}`, 'success');
  };

  const handleOpenRejectModal = (req: LeaveRequest) => {
    setRejectReason('');
    setRejectModal({ id: req.id, name: req.name });
  };

  const handleConfirmReject = () => {
    if (!rejectModal) return;
    const req = requests.find((r) => r.id === rejectModal.id);
    if (!req) return;

    setRequests((prev) =>
      prev.map((r) => (r.id === rejectModal.id ? { ...r, status: 'Rejected' } : r))
    );

    // Notify staff about rejection
    addNotification({
      senderName: managerUser?.name || 'Quản lý',
      title: 'Đơn xin nghỉ bị từ chối ❌',
      message: `Đơn nghỉ ${req.leaveType} từ ${req.startDate} của bạn đã bị từ chối.${rejectReason ? ` Lý do: ${rejectReason}` : ''}`,
      time: 'Vừa xong',
      targetRole: 'staff',
      targetUserId: req.staffId,
    });

    triggerToast(`Đã từ chối đơn của ${req.name}`, 'error');
    setRejectModal(null);
    setRejectReason('');
  };

  const stats = useMemo(() => ({
    pending: requests.filter((r) => r.status === 'Pending').length,
    approved: requests.filter((r) => r.status === 'Approved').length,
    rejected: requests.filter((r) => r.status === 'Rejected').length,
    totalDays: requests
      .filter((r) => r.status === 'Pending')
      .reduce((acc, r) => acc + r.duration, 0),
  }), [requests]);

  return (
    <div className="flex-1 min-h-screen bg-background text-on-surface pb-32 animate-fade-in">

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-bold transition-all animate-in slide-in-from-top-2 duration-300 ${
            toast.type === 'success'
              ? 'bg-[#0f2b1e] border-green-500/40 text-green-300'
              : 'bg-[#2b0f0f] border-red-500/40 text-red-300'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === 'success' ? 'check_circle' : 'cancel'}
          </span>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="w-full sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container active:scale-95 transition-all"
            title="Quay lại Dashboard"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-on-surface leading-tight">Phê Duyệt Đơn Nghỉ Phép</h1>
            <p className="text-xs text-on-surface-variant">Quản lý & theo dõi đơn của nhân viên</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold">
          <ThemeToggle />
          {stats.pending > 0 ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-xs">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
              {stats.pending} chờ duyệt
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs">
              <span className="material-symbols-outlined text-[14px]">done_all</span>
              Hoàn tất
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Chờ duyệt', value: stats.pending, color: 'text-orange-400', bg: 'bg-orange-500/5 border-orange-500/15', icon: 'hourglass_empty' },
            { label: 'Đã duyệt', value: stats.approved, color: 'text-green-400', bg: 'bg-green-500/5 border-green-500/15', icon: 'check_circle' },
            { label: 'Từ chối', value: stats.rejected, color: 'text-red-400', bg: 'bg-red-500/5 border-red-500/15', icon: 'cancel' },
            { label: 'Ngày chờ duyệt', value: stats.totalDays, color: 'text-[#7c9fd4]', bg: 'bg-blue-500/5 border-blue-500/15', icon: 'calendar_month' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border rounded-xl p-3 flex flex-col gap-1`}>
              <span className="material-symbols-outlined text-[16px] text-slate-400">{s.icon}</span>
              <span className={`text-2xl font-extrabold ${s.color}`}>{s.value}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tab Switch */}
        <div className="flex bg-[#13223f] p-1 rounded-xl gap-1">
          {(['Pending', 'History'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab
                  ? 'bg-[#1b3560] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'Pending' ? `Chờ duyệt (${stats.pending})` : `Lịch sử (${historyList.length})`}
            </button>
          ))}
        </div>

        {/* --- PENDING LIST --- */}
        {activeTab === 'Pending' && (
          <div className="space-y-4">
            {pendingList.length === 0 ? (
              <div className="bg-[#13223f]/60 border border-dashed border-white/10 rounded-2xl p-14 text-center flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-5xl text-green-500">done_all</span>
                <p className="text-lg font-bold text-white">Không còn đơn nào chờ duyệt!</p>
                <p className="text-sm text-slate-400">Tất cả đơn xin nghỉ đã được xử lý trong phiên này.</p>
              </div>
            ) : (
              pendingList.map((req) => (
                <LeaveCard
                  key={req.id}
                  req={req}
                  onApprove={() => handleApprove(req.id)}
                  onReject={() => handleOpenRejectModal(req)}
                />
              ))
            )}
          </div>
        )}

        {/* --- HISTORY LIST --- */}
        {activeTab === 'History' && (
          <div className="space-y-3">
            {historyList.length === 0 ? (
              <div className="bg-[#13223f]/60 border border-dashed border-white/10 rounded-xl p-10 text-center text-slate-400 text-sm">
                Chưa có đơn nào được xử lý trong phiên này.
              </div>
            ) : (
              historyList.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#13223f] border border-white/5 rounded-xl px-5 py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1b3560] flex items-center justify-center font-bold text-[#7c9fd4] text-sm">
                      {req.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{req.name}</p>
                      <p className="text-xs text-slate-400">{req.leaveType} · {req.duration} ngày · {req.startDate}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      req.status === 'Approved'
                        ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                        : 'bg-red-500/15 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {req.status === 'Approved' ? '✅ Đã duyệt' : '❌ Đã từ chối'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Rejection Reason Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-[#13223f] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-400">cancel</span>
              </div>
              <div>
                <h3 className="font-bold text-white">Từ chối đơn nghỉ</h3>
                <p className="text-xs text-slate-400">của {rejectModal.name}</p>
              </div>
            </div>

            <label className="block text-xs text-slate-400 font-bold uppercase mb-2">
              Lý do từ chối <span className="text-slate-500">(Tùy chọn)</span>
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="VD: Thiếu nhân sự trong ngày đó, vui lòng điều chỉnh lịch..."
              className="w-full bg-[#0b1326] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 resize-none focus:outline-none focus:border-[#7c9fd4] transition-colors"
            />

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 rounded-lg font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 rounded-lg font-bold text-red-300 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 active:scale-95 transition-all"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaveCard({
  req,
  onApprove,
  onReject,
}: {
  req: LeaveRequest;
  onApprove: () => void;
  onReject: () => void;
}) {
  const tagClass = LEAVE_TYPE_COLORS[req.leaveType] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <div className="bg-[#13223f] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group">
      {/* Top Row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#1b3560] flex items-center justify-center font-bold text-[#7c9fd4] text-sm border border-[#7c9fd4]/20">
            {req.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-white leading-tight">{req.name}</h4>
            <p className="text-xs text-slate-400">{req.role} · Nộp: {req.submittedAt}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${tagClass}`}>
          {req.leaveType}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-3 gap-3 bg-[#0b1326]/50 p-3 rounded-xl border border-white/5 mb-4 text-xs">
        <div>
          <span className="text-slate-500 block mb-0.5">Thời gian nghỉ</span>
          <span className="font-bold text-white">{req.startDate}</span>
          {req.startDate !== req.endDate && (
            <span className="text-slate-400 block">→ {req.endDate}</span>
          )}
        </div>
        <div>
          <span className="text-slate-500 block mb-0.5">Tổng số ngày</span>
          <span className="font-bold text-orange-300 text-base">{req.duration}</span>
          <span className="text-slate-400"> ngày</span>
        </div>
        <div>
          <span className="text-slate-500 block mb-0.5">Người bàn giao</span>
          <span className="font-bold text-[#7c9fd4]">{req.substitute}</span>
        </div>
      </div>

      {/* Reason */}
      <div className="mb-5">
        <span className="text-slate-500 text-xs block mb-1">Lý do xin nghỉ</span>
        <p className="text-sm text-slate-200 italic leading-relaxed">"{req.reason}"</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onReject}
          className="flex-1 py-2.5 bg-red-500/8 text-red-400 border border-red-500/20 text-sm font-bold rounded-xl hover:bg-red-500/15 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
          Từ chối
        </button>
        <button
          onClick={onApprove}
          className="flex-[1.5] py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-500 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-green-900/30"
        >
          <span className="material-symbols-outlined text-[16px]">check</span>
          Phê duyệt
        </button>
      </div>
    </div>
  );
}
