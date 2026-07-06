import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AttendanceSubject } from '../types';

const seed: AttendanceSubject[] = [];

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
  semesterStart: string; // "YYYY-MM-DD"
  semesterEnd: string; // "YYYY-MM-DD"
  addSubject: (name: string, total: number, attended: number) => void;
  updateSubject: (id: string, patch: Partial<AttendanceSubject>) => void;
  removeSubject: (id: string) => void;
  markToday: (id: string, present: boolean) => void;
  setSemesterDates: (start: string, end: string) => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set) => ({
      subjects: seed,
      semesterStart: '',
      semesterEnd: '',
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
      setSemesterDates: (start, end) => set({ semesterStart: start, semesterEnd: end }),
    }),
    { name: 'studenthub-attendance' }
  )
);

/** Total calendar days and estimated working days (excluding Sundays)
 * between the stored semester start/end dates. Returns null if either
 * date is missing or the range is invalid. */
export function semesterDayCounts(start: string, end: string): { totalDays: number; workingDays: number } | null {
  if (!start || !end) return null;
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return null;
  let totalDays = 0;
  let workingDays = 0;
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    totalDays++;
    if (d.getDay() !== 0) workingDays++; // exclude Sundays
  }
  return { totalDays, workingDays };
}
