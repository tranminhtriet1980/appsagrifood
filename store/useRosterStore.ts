import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useNotificationStore } from './useNotificationStore';

export interface Shift {
  id: string;
  userId: string;
  departmentId: string;
  date: string;
  shiftType: string;
  status: 'Draft' | 'Published';
}

interface RosterState {
  globalShifts: Shift[];
  offDayRequests: Record<string, string>; // staffId -> date
  addOrUpdateShift: (params: { userId: string, departmentId: string, date: string, shiftType: string }) => void;
  requestOffDay: (staffId: string, date: string) => void;
  publishLocationShifts: (departmentId: string) => void;
  removeShift: (userId: string, date: string) => void;
}

const INITIAL_SHIFTS: Shift[] = [
  { id: '1', userId: 's1', departmentId: 'loc1', date: '25/05', shiftType: 'Sáng', status: 'Published' },
  { id: '2', userId: 's1', departmentId: 'loc1', date: '26/05', shiftType: 'Chiều', status: 'Published' },
  { id: '3', userId: 's2', departmentId: 'loc1', date: '25/05', shiftType: 'Chiều', status: 'Published' },
  { id: '4', userId: 's3', departmentId: 'loc1', date: '26/05', shiftType: 'Sáng', status: 'Published' },
  { id: '5', userId: 's4', departmentId: 'loc1', date: '27/05', shiftType: 'Sáng', status: 'Published' },
  { id: '6', userId: 's5', departmentId: 'loc1', date: '25/05', shiftType: 'Sáng', status: 'Published' },
  { id: '7', userId: 's6', departmentId: 'loc1', date: '28/05', shiftType: 'Chiều', status: 'Published' },
];

export const useRosterStore = create<RosterState>()(
  persist(
    (set) => ({
      globalShifts: INITIAL_SHIFTS,
      offDayRequests: {},

      addOrUpdateShift: ({ userId, departmentId, date, shiftType }) =>
        set((state) => {
          const newShifts = state.globalShifts.filter(s => !(s.userId === userId && s.date === date));
          newShifts.push({
            id: `${userId}_${date}_${Date.now()}`,
            userId,
            departmentId,
            date,
            shiftType,
            status: 'Draft'
          });
          return { globalShifts: newShifts };
        }),

      requestOffDay: (staffId, date) =>
        set((state) => ({
          offDayRequests: {
            ...state.offDayRequests,
            [staffId]: date,
          },
        })),

      publishLocationShifts: (departmentId) =>
        set((state) => {
          const newlyPublishedShifts: Shift[] = [];
          const newShifts = state.globalShifts.map(s => {
            if (s.departmentId === departmentId && s.status === 'Draft') {
              const publishedShift = { ...s, status: 'Published' as const };
              newlyPublishedShifts.push(publishedShift);
              return publishedShift;
            }
            return s;
          });
          
          Object.entries(state.offDayRequests).forEach(([staffId, date]) => {
            const existing = newShifts.find(s => s.userId === staffId && s.date === date);
            if (existing) {
              existing.shiftType = 'OFF';
              existing.status = 'Published';
            } else {
              const newOffShift: Shift = {
                id: `${staffId}_${date}_off`,
                userId: staffId,
                departmentId,
                date,
                shiftType: 'OFF',
                status: 'Published'
              };
              newShifts.push(newOffShift);
              newlyPublishedShifts.push(newOffShift);
            }
          });

          // Shoot notifications
          const notifStore = useNotificationStore.getState();
          newlyPublishedShifts.forEach(shift => {
             notifStore.addNotification({
                senderName: 'Quản lý',
                title: 'Lịch làm việc tuần mới',
                message: `Quản lý đã công bố lịch tuần mới. Bạn có lịch vào ngày ${shift.date} (${shift.shiftType}).`,
                time: 'Vừa xong',
                targetRole: 'staff',
                targetUserId: shift.userId
             });
          });

          return { globalShifts: newShifts, offDayRequests: {} };
        }),

      removeShift: (userId, date) =>
        set((state) => ({
          globalShifts: state.globalShifts.filter(s => !(s.userId === userId && s.date === date))
        })),
    }),
    {
      name: 'roster-storage',
    }
  )
);
