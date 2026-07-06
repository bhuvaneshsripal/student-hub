import { create } from 'zustand';

interface NotificationUiState {
  dismissedIds: string[];
  dismiss: (ids: string[]) => void;
  clearAll: (ids: string[]) => void;
}

// Intentionally not persisted — notifications are derived live from other
// stores (attendance, tasks, exams), so "clearing" them just hides the
// current batch for this session; they'll reappear if the underlying data
// still qualifies next time you reload.
export const useNotificationUiStore = create<NotificationUiState>((set) => ({
  dismissedIds: [],
  dismiss: (ids) => set((s) => ({ dismissedIds: [...new Set([...s.dismissedIds, ...ids])] })),
  clearAll: (ids) => set((s) => ({ dismissedIds: [...new Set([...s.dismissedIds, ...ids])] })),
}));
