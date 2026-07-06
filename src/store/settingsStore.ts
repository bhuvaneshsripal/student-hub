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
  notificationSound: boolean;
  toggleNotificationSound: () => void;
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
      notificationSound: true,
      toggleNotificationSound: () => set((s) => ({ notificationSound: !s.notificationSound })),
    }),
    { name: 'studenthub-settings' }
  )
);

/** Plays a short, original two-tone chime using the Web Audio API — no
 * external audio file needed. Used for the notification bell when the
 * "notification sound" setting is enabled. */
export function playNotificationSound() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = now + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.2);
    });
    setTimeout(() => ctx.close(), 500);
  } catch {
    // Web Audio unavailable — fail silently, sound is a nice-to-have.
  }
}
