import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '../types';

interface SettingsState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  profile: Profile;
  updateProfile: (p: Partial<Profile>) => void;
  hasOnboarded: boolean;
  completeOnboarding: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      profile: {
        name: '',
        registerNumber: '',
        department: '',
        year: '',
        semester: '',
        avatar: '',
      },
      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      hasOnboarded: false,
      completeOnboarding: () => set({ hasOnboarded: true }),
    }),
    { name: 'studenthub-settings' }
  )
);
