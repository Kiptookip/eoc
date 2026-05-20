import { create } from 'zustand';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  toasts: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeToast: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  toasts: [],
  
  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: AppNotification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false,
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      toasts: [newNotification, ...state.toasts],
    }));

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 5000);
  },

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
