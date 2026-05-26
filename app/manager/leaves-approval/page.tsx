"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LeaveRequest {
  id: string;
  name: string;
  role: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  substitute: string;
  duration: number;
}

const INITIAL_REQUESTS: LeaveRequest[] = [
  { id: '1', name: 'Nguyễn Văn A', role: 'Bán hàng', leaveType: 'Nghỉ phép năm', startDate: '27/05/2026', endDate: '28/05/2026', reason: 'Giải quyết công việc gia đình ở quê.', status: 'Pending', substitute: 'Lê Văn C', duration: 2 },
  { id: '2', name: 'Trần Thị B', role: 'Thu ngân', leaveType: 'Nghỉ ốm (BHXH)', startDate: '29/05/2026', endDate: '29/05/2026', reason: 'Khám sức khỏe định kỳ và lấy thuốc.', status: 'Pending', substitute: 'Vũ Thị F', duration: 1 },
  { id: '3', name: 'Phạm Thị D', role: 'Nhân viên Kho', leaveType: 'Nghỉ phép năm', startDate: '01/06/2026', endDate: '03/06/2026', reason: 'Có lịch cá nhân quan trọng không thể dời.', status: 'Pending', substitute: 'Đặng Văn E', duration: 3 },
  { id: '4', name: 'Vũ Thị F', role: 'Thu ngân', leaveType: 'Nghỉ không lương', startDate: '05/06/2026', endDate: '05/06/2026', reason: 'Đi học quân sự bổ túc.', status: 'Pending', substitute: 'Trần Thị B', duration: 1 }
];

export default function ManagerLeavesApprovalPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_REQUESTS);
  
  // Toasts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = (id: string, action: 'Approved' | 'Rejected') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    const name = requests.find(r => r.id === id)?.name;
    const actionText = action === 'Approved' ? 'đã phê duyệt' : 'đã từ chối';
    triggerToast(`Đã ghi nhận: ${actionText} đơn xin nghỉ của ${name}`, 'success');
  };

  return (
    <div className="flex-1 min-h-screen bg-[#0b1326] text-on-surface pb-32 animate-fade-in">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#1b2a47] border border-primary text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">info</span>
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      <header className="w-full sticky top-0 z-40 bg-[#0f1d36]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard')} 
            className="p-2 rounded-full text-primary hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-white">Phê Duyệt Đơn Nghỉ Phép</h1>
        </div>
        <div className="text-sm text-slate-400 font-bold">
          Chờ duyệt: <span className="text-primary">{requests.filter(r => r.status === 'Pending').length} đơn</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {requests.filter(r => r.status === 'Pending').length === 0 ? (
          <div className="bg-[#13223f] border border-dashed border-white/10 rounded-2xl p-12 text-center text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2 text-primary">done_all</span>
            <p className="font-bold text-lg text-white">Sạch đơn chờ duyệt!</p>
            <p className="text-sm mt-1">Toàn bộ đơn xin nghỉ phép đã được giải quyết.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {requests.map((req) => (
              req.status === 'Pending' && (
                <div key={req.id} className="bg-[#13223f] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {req.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-white leading-tight">{req.name}</h4>
                        <p className="text-xs text-slate-400">{req.role}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-xs font-bold rounded ml-auto md:ml-0">
                        {req.leaveType}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-[#0f1d36]/50 p-3 rounded-lg border border-white/5 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 block mb-0.5">Thời gian nghỉ</span>
                        <span className="font-bold text-white">{req.startDate} - {req.endDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-0.5">Tổng số ngày</span>
                        <span className="font-bold text-white">{req.duration} ngày</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-0.5">Người bàn giao</span>
                        <span className="font-bold text-primary">{req.substitute}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-xs block mb-1">Lý do xin nghỉ</span>
                      <p className="text-sm text-slate-200 italic">"{req.reason}"</p>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 min-w-[120px] justify-end">
                    <button 
                      onClick={() => handleAction(req.id, 'Approved')}
                      className="flex-1 md:flex-none px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span> Duyệt
                    </button>
                    <button 
                      onClick={() => handleAction(req.id, 'Rejected')}
                      className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-bold rounded-lg hover:bg-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span> Từ chối
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* Lịch sử xử lý đơn trong phiên */}
        {requests.filter(r => r.status !== 'Pending').length > 0 && (
          <div className="bg-[#13223f]/50 border border-white/5 rounded-xl p-5 mt-8">
            <h3 className="font-bold text-slate-300 mb-3 text-sm">Lịch sử xử lý trong phiên</h3>
            <div className="divide-y divide-white/5">
              {requests.filter(r => r.status !== 'Pending').map(req => (
                <div key={req.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-bold text-white">{req.name}</span>
                    <span className="text-slate-400"> - {req.leaveType} ({req.duration} ngày)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    req.status === 'Approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {req.status === 'Approved' ? 'Đã duyệt' : 'Đã từ chối'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
