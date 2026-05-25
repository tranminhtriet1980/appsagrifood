import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Alert {
  id: string;
  type: "error" | "warning";
  title: string;
  message: string;
}

export interface ShiftSlot {
  day: number;
  shift: "morning" | "afternoon" | "night";
  staff: Staff[];
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  hours: number;
  avatar: string;
  status: "normal" | "overtime" | "warning";
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  departmentId: string;
  branch: string;
  type: string;
  dateStr: string;
  day: number;
  duration: number;
  status: 'PENDING_DEPT' | 'PENDING_HR' | 'PENDING_DIRECTOR' | 'APPROVED' | 'REJECTED';
  reason: string;
}

interface AppState {
  leaveBalance: { remaining: number; used: number; total: number };
  dashboardAlerts: Alert[];
  roster: ShiftSlot[];
  leaveRequests: LeaveRequest[];
  approveLeave: (userId: string, day: number) => void;
  updateRequestStatus: (id: string, newStatus: LeaveRequest['status']) => void;
  addAlert: (alert: Alert) => void;
  removeAlert: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      leaveBalance: { remaining: 12, used: 2, total: 14 },
      dashboardAlerts: [],
      leaveRequests: [
        {
          id: 'REQ-001',
          userId: 'NM',
          userName: 'Nguyễn Minh',
          avatar: 'NM',
          departmentId: 'KINH_DOANH',
          branch: 'Emart Gò Vấp',
          type: 'Phép năm (AL)',
          dateStr: '24/05 - 26/05',
          day: 24,
          duration: 3,
          status: 'PENDING_DEPT',
          reason: 'Giải quyết việc gia đình cá nhân, đã nhờ anh Tuấn trực thay ca tối.'
        },
        {
          id: 'REQ-002',
          userId: 'LHC',
          userName: 'Lê Hoàng Cường',
          avatar: 'LHC',
          departmentId: 'KINH_DOANH',
          branch: 'Sagrifood Q7',
          type: 'Phép năm (AL)',
          dateStr: '25/05',
          day: 25,
          duration: 1,
          status: 'PENDING_HR',
          reason: 'Bị sốt nhẹ cần nghỉ ngơi 1 ngày.'
        },
        {
          id: 'REQ-003',
          userId: 'TTB',
          userName: 'Trần Thị Bình',
          avatar: 'TTB',
          departmentId: 'TCHC',
          branch: 'Lotte Mart Q7',
          type: 'Nghỉ việc riêng',
          dateStr: '26/05',
          day: 26,
          duration: 1,
          status: 'PENDING_DIRECTOR',
          reason: 'Xin nghỉ dự lễ tốt nghiệp của em gái.'
        }
      ],
      roster: [
        {
          day: 24, // Assuming day 24 (T2)
          shift: "morning",
          staff: [
            { id: "NM", name: "Nguyễn Minh", role: "Thu ngân", hours: 40, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRAx8obu96-nBMWPpy8ZG2eid-lG1ZIMGjtxj0nguAxC5pYBFN4gLVuxtf895BlHpgcgDVBs5OiHb1F_57QxteKi5y7dcZD-bzZXmX86D3-L7svaUSrEgAZr9IUHtFgHZQBNIMIrgAOMIDlEMjOQ3X5rTcplOpg_lWLr2KWTsTOOfHsUe2_HyqO6uKdRZ0Odr_eBNw3FjUxZjgfoTtJ5LUeoqxG-DVUf_7vqDlUZp3OmmDVJW8gcJUWN6Wnb-3f8QAjnJmoxa-6PFb", status: "normal" }
          ]
        },
        {
          day: 25,
          shift: "morning",
          staff: [
            { id: "101", name: "An Nguyễn", role: "", hours: 0, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCAeSLexUHoOsAVSSXvv_VC_ghE5xoFCD6IBWww-D6VhOnrpa58mnyBxZ6uo4tH7NevDTgeegYC1nwVyTbSOfiR_JEChLFefhHGVqxtOs7BDCPbGI5qcGvcGEtSGKovK-ngCxRt-2jqGkNLjGGfdxFwM1mevjusg40aNAdR5-fJljzEiKJCLdIQMaTLOjgSqtRfbT_ckP60W9oRDNmGuyO3bOmx8I1rbJsCBs4A4PulEvVVs5mJ5gzGKDAsTz-k61jiYhDKbmrJK4co", status: "normal" },
            { id: "102", name: "Bình Lê", role: "", hours: 0, avatar: "https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg", status: "normal" }
          ]
        },
        {
          day: 26,
          shift: "morning",
          staff: [
            { id: "103", name: "Cường Đỗ", role: "", hours: 0, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuABSiZJMTiYvqEBNieE9ktgTRhRZcMjLowMriEOyfiweohEd7P4fdrTwk09m8hBlqhY93SI5nkT5fDMJ2_O4dmhpw144wwXmQxQD8r5q2nUp3YOBXFsqVxAWtoH2THfUZ8OLFl0ggadUVvMQPF8Hl23TSqgAkN4JKPykAz6Imp3enVg7crOke5RtNe_wMjTNLJT5-7s7EIRoMOY41uTseEUZf9fSnPNcT_eZCx5shV6ICi9FcOTcEz1HqdO2zxKgMBZW0gscx67w7Cm", status: "normal" }
          ]
        },
        {
          day: 27,
          shift: "morning",
          staff: [
            { id: "104", name: "Duy Trần", role: "", hours: 0, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDib9nYCFN5KWtKK86iXQB_30f5rwEMBE3CiGfBkXNsyOL4oWT7---3o5hguMImv8jBohQuK-aVW81WttYtQGRfeMo22gxuJ9Pq7s6HWGgp6p5Qzc0Acmejy4GiWsvdsggizxjt32_w818mn4NUdY4-4Nhul-Civ8Tw9-4RF_ezZkJDb3ZqGqrvt8NTpmvqLfft6vEUhucBr_JtdK0Dcn1Jxq8sN7Qtbd65fmW1zfT3g7RKWUykiCy7pg3gmMwWyvEG_iIxkQwXRLfN", status: "normal" }
          ]
        }
      ],
      updateRequestStatus: (id, newStatus) => set((state) => {
        const reqIndex = state.leaveRequests.findIndex(r => r.id === id);
        if (reqIndex === -1) return state;
        
        const updatedRequests = [...state.leaveRequests];
        updatedRequests[reqIndex] = { ...updatedRequests[reqIndex], status: newStatus };
        
        // If final approved, we also trigger approveLeave to deduct balance and remove from roster
        if (newStatus === 'APPROVED') {
           // Schedule a side-effect by using get()
           // Note: In Zustand, you can call other actions from get()
           setTimeout(() => {
             get().approveLeave(updatedRequests[reqIndex].userId, updatedRequests[reqIndex].day);
           }, 0);
        }
        
        return { leaveRequests: updatedRequests };
      }),
      approveLeave: (userId, day) => set((state) => {
        // 1. Trừ ngày phép (giả sử trừ 1 ngày)
        const newBalance = { 
          ...state.leaveBalance, 
          remaining: Math.max(0, state.leaveBalance.remaining - 1),
          used: state.leaveBalance.used + 1 
        };
        
        // 2. Gạch tên khỏi ca trực của ngày đó
        let removedFromShift = false;
        let missingShift = "";
        const newRoster = state.roster.map(slot => {
          if (slot.day === day) {
            const hasStaff = slot.staff.some(s => s.id === userId);
            if (hasStaff) {
              removedFromShift = true;
              missingShift = slot.shift === 'morning' ? 'Sáng' : slot.shift === 'afternoon' ? 'Chiều' : 'Đêm';
              return {
                ...slot,
                staff: slot.staff.filter(s => s.id !== userId)
              };
            }
          }
          return slot;
        });

        // 3. Bật cảnh báo nếu bị thiếu người (bắn vào dashboardAlerts)
        let newAlerts = [...state.dashboardAlerts];
        if (removedFromShift) {
          newAlerts.push({
            id: `alert-${Date.now()}`,
            type: "warning",
            title: "Cần chú ý",
            message: `⚠️ Thiếu nhân sự ca ${missingShift} ngày ${day}/05 (Nghỉ phép)`
          });
        }

        return { leaveBalance: newBalance, roster: newRoster, dashboardAlerts: newAlerts };
      }),
      addAlert: (alert) => set((state) => ({ dashboardAlerts: [...state.dashboardAlerts, alert] })),
      removeAlert: (id) => set((state) => ({ dashboardAlerts: state.dashboardAlerts.filter(a => a.id !== id) })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
