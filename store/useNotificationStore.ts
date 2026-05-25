import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AppNotification {
  id: string;
  senderName: string;
  senderAvatar?: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  targetRole: 'manager' | 'staff' | 'all';
  targetUserId?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notif: Omit<AppNotification, "id" | "isRead">) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [
        {
          id: 'mock-1',
          senderName: 'Hệ thống',
          title: 'Chào mừng',
          message: 'Chào mừng bạn đến với hệ thống HRM Sagrifood.',
          time: 'Vừa xong',
          isRead: false,
          targetRole: 'all'
        }
      ],
      unreadCount: 1,
      addNotification: (notif) => set((state) => {
        const newNotif: AppNotification = {
          ...notif,
          id: `notif-${Date.now()}`,
          isRead: false
        };
        const newNotifications = [newNotif, ...state.notifications];
        return {
          notifications: newNotifications,
          unreadCount: state.unreadCount + 1
        };
      }),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      })),
      markAsRead: (id) => set((state) => {
        const newNotifs = state.notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        );
        const newCount = newNotifs.filter(n => !n.isRead).length;
        return {
          notifications: newNotifs,
          unreadCount: newCount
        };
      })
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
