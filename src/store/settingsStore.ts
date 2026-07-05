import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '../types';

interface SettingsState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  profile: Profile;
  updateProfile: (p: Partial<Profile>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      profile: {
        name: 'Alex Rivera',
        registerNumber: 'REG2024CS041',
        department: 'Computer Science',
        year: '3rd Year',
        semester: 'Semester 5',
        avatar: '',
      },
      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
    }),
    { name: 'studenthub-settings' }
  )
);
