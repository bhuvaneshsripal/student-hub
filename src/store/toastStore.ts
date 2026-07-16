import { create } from 'zustand';
import { useSettingsStore } from './settingsStore';

export interface Toast {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'info';
  onUndo?: () => void;
}

interface PushOptions {
  onUndo?: () => void;
  /** How long the toast stays on screen, in ms. Defaults to 3000 (3s). */
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, variant?: Toast['variant'], options?: PushOptions) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, variant = 'info', options) => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, variant, onUndo: options?.onUndo }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), options?.duration ?? 3000);

    // If the user has turned on system notifications, mirror every in-app
    // toast as a native OS notification too — same as any other app.
    if (
      useSettingsStore.getState().systemNotifications &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification('Studo', { body: message, icon: '/studo-logo.png' });
      } catch {
        // Notifications can throw in some contexts (e.g. service worker
        // required on some platforms) — fail silently, toast still shows.
      }
    }
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
