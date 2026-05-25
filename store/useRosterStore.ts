import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RosterState {
  matrixData: Record<string, any>;
  offDayRequests: Record<string, string>; // staffId -> date (e.g. 's1' -> '25/05')
  setShift: (staffId: string, date: string, shiftValue: string) => void;
  requestOffDay: (staffId: string, date: string) => void;
  publishRoster: () => void;
  removeShift: (staffId: string, date: string) => void;
}

const INITIAL_MATRIX: Record<string, any> = {
  's1_25/05': { shift: 'Sáng' },
  's1_26/05': { shift: 'Chiều' },
  's2_25/05': { shift: 'Chiều' },
  's3_26/05': { shift: 'Sáng' },
  's4_27/05': { shift: 'Sáng' },
  's5_25/05': { shift: 'Sáng' },
  's6_28/05': { shift: 'Chiều' },
};

export const useRosterStore = create<RosterState>()(
  persist(
    (set) => ({
      matrixData: INITIAL_MATRIX,
      offDayRequests: {},

      setShift: (staffId, date, shiftValue) =>
        set((state) => ({
          matrixData: {
            ...state.matrixData,
            [`${staffId}_${date}`]: { shift: shiftValue },
          },
        })),

      requestOffDay: (staffId, date) =>
        set((state) => ({
          offDayRequests: {
            ...state.offDayRequests,
            [staffId]: date,
          },
        })),

      publishRoster: () =>
        set((state) => {
          const newMatrix = { ...state.matrixData };
          // Convert all requests to actual OFF shifts
          Object.entries(state.offDayRequests).forEach(([staffId, date]) => {
            newMatrix[`${staffId}_${date}`] = { shift: 'OFF' };
          });
          return { matrixData: newMatrix, offDayRequests: {} };
        }),

      removeShift: (staffId, date) =>
        set((state) => {
          const newMatrix = { ...state.matrixData };
          delete newMatrix[`${staffId}_${date}`];
          return { matrixData: newMatrix };
        }),
    }),
    {
      name: 'roster-storage',
    }
  )
);
