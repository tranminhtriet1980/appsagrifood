"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LateRecord {
  id: string;
  name: string;
  role: string;
  branch: string;
  date: string;
  shift: string;
  checkIn: string;
  expectedIn: string;
  lateMinutes: number;
  status: 'Unexcused' | 'Excused';
}

const INITIAL_LATE_RECORDS: LateRecord[] = [
  { id: '1', name: 'Nguyễn Văn A', role: 'Bán hàng', branch: 'Emart', date: '26/05/2026', shift: 'Ca Sáng', checkIn: '08:15 AM', expectedIn: '08:00 AM', lateMinutes: 15, status: 'Unexcused' },
  { id: '2', name: 'Trần Thị B', role: 'Thu ngân', branch: 'Lotte Q7', date: '26/05/2026', shift: 'Ca Chiều', checkIn: '01:45 PM', expectedIn: '01:00 PM', lateMinutes: 45, status: 'Unexcused' },
  { id: '3', name: 'Lê Văn C', role: 'Bán hàng', branch: 'Sagri Q1', date: '25/05/2026', shift: 'Ca Sáng', checkIn: '08:08 AM', expectedIn: '08:00 AM', lateMinutes: 8, status: 'Excused' },
  { id: '4', name: 'Phạm Thị D', role: 'Nhân viên Kho', branch: 'Emart', date: '25/05/2026', shift: 'Ca Sáng', checkIn: '08:20 AM', expectedIn: '08:00 AM', lateMinutes: 20, status: 'Unexcused' },
  { id: '5', name: 'Đặng Văn E', role: 'Bán hàng', branch: 'Lotte Q7', date: '24/05/2026', shift: 'Ca Chiều', checkIn: '01:10 PM', expectedIn: '01:00 PM', lateMinutes: 10, status: 'Excused' },
];

export default function ManagerAttendanceLogsPage() {
  const router = useRouter();
  const [filterBranch, setFilterBranch] = useState('All');
  const [records, setRecords] = useState<LateRecord[]>(INITIAL_LATE_RECORDS);

  const filteredRecords = filterBranch === 'All' 
    ? records 
    : records.filter(r => r.branch === filterBranch);

  const handleExcuse = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'Excused' as const } : r));
  };

  return (
    <div className="flex-1 min-h-screen bg-[#0b1326] text-on-surface pb-32 animate-fade-in">
      <header className="w-full sticky top-0 z-40 bg-[#0f1d36]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard')} 
            className="p-2 rounded-full text-primary hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-white">Tần Suất Đi Muộn & Log Chấm Công</h1>
        </div>
        <div>
          <select 
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="bg-[#1b2a47] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
          >
            <option value="All">Tất cả chi nhánh</option>
            <option value="Emart">Emart</option>
            <option value="Lotte Q7">Lotte Q7</option>
            <option value="Sagri Q1">Sagri Q1</option>
          </select>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Thống kê nhanh */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#13223f] border border-white/10 rounded-xl p-5 flex flex-col justify-between">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Tổng số lượt đi muộn</span>
            <span className="text-3xl font-extrabold text-orange-500 mt-2">{filteredRecords.length} lượt</span>
          </div>
          <div className="bg-[#13223f] border border-white/10 rounded-xl p-5 flex flex-col justify-between">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Số phút đi muộn TB</span>
            <span className="text-3xl font-extrabold text-white mt-2">
              {filteredRecords.length > 0 
                ? Math.round(filteredRecords.reduce((acc, curr) => acc + curr.lateMinutes, 0) / filteredRecords.length)
                : 0} phút
            </span>
          </div>
          <div className="bg-[#13223f] border border-white/10 rounded-xl p-5 flex flex-col justify-between">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Chờ giải trình</span>
            <span className="text-3xl font-extrabold text-red-500 mt-2">
              {filteredRecords.filter(r => r.status === 'Unexcused').length} ca
            </span>
          </div>
        </div>

        {/* Bảng Logs */}
        <div className="bg-[#13223f] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-white">Nhật ký đi muộn chi tiết</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f1d36] text-slate-400 border-b border-white/10 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Nhân viên</th>
                  <th className="p-4 font-semibold">Chi nhánh</th>
                  <th className="p-4 font-semibold">Ngày & Ca</th>
                  <th className="p-4 font-semibold">Giờ check-in</th>
                  <th className="p-4 font-semibold">Trễ (phút)</th>
                  <th className="p-4 font-semibold">Trạng thái</th>
                  <th className="p-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRecords.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{row.name}</div>
                      <div className="text-xs text-slate-400">{row.role}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-300">{row.branch}</td>
                    <td className="p-4 text-sm text-slate-300">
                      <div>{row.date}</div>
                      <div className="text-xs text-orange-400">{row.shift}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-300">
                      <span className="line-through text-slate-500 mr-2">{row.expectedIn}</span>
                      <span className="text-red-400 font-bold">{row.checkIn}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded">
                        +{row.lateMinutes} phút
                      </span>
                    </td>
                    <td className="p-4">
                      {row.status === 'Excused' ? (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded">
                          Đã Duyệt Lý Do
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded animate-pulse">
                          Chưa Báo Cáo
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {row.status === 'Unexcused' && (
                        <button 
                          onClick={() => handleExcuse(row.id)}
                          className="px-3 py-1 bg-primary text-white text-xs font-bold rounded hover:brightness-110 active:scale-95 transition-all"
                        >
                          Duyệt Châm Chước
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
