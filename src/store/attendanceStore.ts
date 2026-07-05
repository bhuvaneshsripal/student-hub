import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AttendanceSubject } from '../types';

const seed: AttendanceSubject[] = [
  { id: 'a1', name: 'Data Structures', total: 40, attended: 34 },
  { id: 'a2', name: 'Operating Systems', total: 38, attended: 27 },
  { id: 'a3', name: 'Database Systems', total: 35, attended: 22 },
  { id: 'a4', name: 'Computer Networks', total: 30, attended: 29 },
];

export const SAFE_THRESHOLD = 80;

export function attendancePercent(s: AttendanceSubject) {
  return s.total === 0 ? 0 : (s.attended / s.total) * 100;
}

export function classesNeededForThreshold(s: AttendanceSubject, threshold: number) {
  // find min x such that (attended + x) / (total + x) >= threshold%
  if (attendancePercent(s) >= threshold) return 0;
  const x = Math.ceil((threshold * s.total - 100 * s.attended) / (100 - threshold));
  return Math.max(0, x);
}

export function classesCanMissForThreshold(s: AttendanceSubject, threshold: number) {
  // find max x such that attended / (total + x) >= threshold%
  if (attendancePercent(s) < threshold) return 0;
  const x = Math.floor((s.attended * 100) / threshold - s.total);
  return Math.max(0, x);
}

// Convenience wrappers using the app-wide 80% safe threshold
export function classesNeededForSafe(s: AttendanceSubject) {
  return classesNeededForThreshold(s, SAFE_THRESHOLD);
}

export function classesCanMissSafe(s: AttendanceSubject) {
  return classesCanMissForThreshold(s, SAFE_THRESHOLD);
}

export function attendanceStatus(pct: number): 'safe' | 'warning' | 'danger' {
  if (pct >= SAFE_THRESHOLD) return 'safe';
  if (pct >= 65) return 'warning';
  return 'danger';
}

interface AttendanceState {
  subjects: AttendanceSubject[];
  addSubject: (name: string, total: number, attended: number) => void;
  updateSubject: (id: string, patch: Partial<AttendanceSubject>) => void;
  removeSubject: (id: string) => void;
  markToday: (id: string, present: boolean) => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set) => ({
      subjects: seed,
      addSubject: (name, total, attended) => set((s) => ({
        subjects: [...s.subjects, { id: crypto.randomUUID(), name, total, attended }],
      })),
      updateSubject: (id, patch) => set((s) => ({
        subjects: s.subjects.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
      removeSubject: (id) => set((s) => ({ subjects: s.subjects.filter((x) => x.id !== id) })),
      markToday: (id, present) => set((s) => ({
        subjects: s.subjects.map((x) => x.id === id
          ? { ...x, total: x.total + 1, attended: x.attended + (present ? 1 : 0) }
          : x),
      })),
    }),
    { name: 'studenthub-attendance' }
  )
);
