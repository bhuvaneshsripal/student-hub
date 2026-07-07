import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '../types';

export type ColorScheme = 'blue' | 'yellow';

const defaultProfile: Profile = {
  name: '',
  registerNumber: '',
  department: '',
  year: '',
  semester: '',
  avatar: '',
};

interface SettingsState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  profile: Profile;
  updateProfile: (p: Partial<Profile>) => void;
  /** Resets the profile back to blank defaults. Used when a different
   * account logs in on this device, so the previous account's cached
   * profile is never shown — or uploaded — under the new account. */
  resetProfile: () => void;
  /** Which Firebase uid the locally-cached `profile` belongs to. Persisted
   * alongside the profile so CloudSync can tell whether the data sitting
   * in localStorage is actually this account's, or a leftover from a
   * previously logged-in account on the same device/browser. */
  profileOwnerUid: string | null;
  setProfileOwnerUid: (uid: string | null) => void;
  hasOnboarded: boolean;
  completeOnboarding: () => void;
  notificationSound: boolean;
  toggleNotificationSound: () => void;
  /** Minutes before a scheduled class to fire a browser notification. */
  classReminderMinutes: number;
  classReminders: boolean;
  toggleClassReminders: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      colorScheme: 'blue',
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
      profile: defaultProfile,
      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      resetProfile: () => set({ profile: defaultProfile }),
      profileOwnerUid: null,
      setProfileOwnerUid: (uid) => set({ profileOwnerUid: uid }),
      hasOnboarded: false,
      completeOnboarding: () => set({ hasOnboarded: true }),
      notificationSound: true,
      toggleNotificationSound: () => set((s) => ({ notificationSound: !s.notificationSound })),
      classReminderMinutes: 15,
      classReminders: true,
      toggleClassReminders: () => set((s) => ({ classReminders: !s.classReminders })),
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
