import { create } from 'zustand';

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
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
