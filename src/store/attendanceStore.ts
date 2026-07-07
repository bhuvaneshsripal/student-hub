import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AttendanceSubject } from "../types";

import {
  loadAttendance,
  saveAttendance,
  subscribeAttendance,
} from "../services/attendanceService";

const seed: AttendanceSubject[] = [];

export const SAFE_THRESHOLD = 80;

export function attendancePercent(s: AttendanceSubject) {
  return s.total === 0 ? 0 : (s.attended / s.total) * 100;
}

export function classesNeededForThreshold(
  s: AttendanceSubject,
  threshold: number
) {
  if (attendancePercent(s) >= threshold) return 0;

  const x = Math.ceil(
    (threshold * s.total - 100 * s.attended) /
      (100 - threshold)
  );

  return Math.max(0, x);
}

export function classesCanMissForThreshold(
  s: AttendanceSubject,
  threshold: number
) {
  if (attendancePercent(s) < threshold) return 0;

  const x = Math.floor(
    (s.attended * 100) / threshold - s.total
  );

  return Math.max(0, x);
}

export function classesNeededForSafe(s: AttendanceSubject) {
  return classesNeededForThreshold(s, SAFE_THRESHOLD);
}

export function classesCanMissSafe(s: AttendanceSubject) {
  return classesCanMissForThreshold(s, SAFE_THRESHOLD);
}

export function attendanceStatus(
  pct: number
): "safe" | "warning" | "danger" {
  if (pct >= SAFE_THRESHOLD) return "safe";
  if (pct >= 65) return "warning";
  return "danger";
}

interface AttendanceState {
  subjects: AttendanceSubject[];

  semesterStart: string;
  semesterEnd: string;

  setSubjects: (
    subjects: AttendanceSubject[]
  ) => void;

  sync: () => Promise<void>;

  addSubject: (
    name: string,
    total: number,
    attended: number
  ) => Promise<void>;

  updateSubject: (
    id: string,
    patch: Partial<AttendanceSubject>
  ) => Promise<void>;

  removeSubject: (
    id: string
  ) => Promise<void>;

  restoreSubject: (
    subject: AttendanceSubject
  ) => Promise<void>;

  markToday: (
    id: string,
    present: boolean
  ) => Promise<void>;

  setSemesterDates: (
    start: string,
    end: string
  ) => void;
}

export const useAttendanceStore =
  create<AttendanceState>()(
    persist(
      (set, get) => ({
        subjects: seed,

        semesterStart: "",

        semesterEnd: "",

        setSubjects: (subjects) => {
          set({ subjects });
        },

        sync: async () => {
          const subjects =
            await loadAttendance();

          set({ subjects });

          subscribeAttendance((subjects) => {
            set({ subjects });
          });
        },

        addSubject: async (
          name,
          total,
          attended
        ) => {
          const subjects = [
            ...get().subjects,
            {
              id: crypto.randomUUID(),
              name,
              total,
              attended,
            },
          ];

          set({ subjects });

          await saveAttendance(subjects);
        },

        updateSubject: async (
          id,
          patch
        ) => {
          const subjects = get().subjects.map(
            (subject) =>
              subject.id === id
                ? {
                    ...subject,
                    ...patch,
                  }
                : subject
          );

          set({ subjects });

          await saveAttendance(subjects);
        },

        removeSubject: async (id) => {
          const subjects =
            get().subjects.filter(
              (subject) => subject.id !== id
            );

          set({ subjects });

          await saveAttendance(subjects);
        },

        restoreSubject: async (subject) => {
          const subjects = [
            ...get().subjects.filter((s) => s.id !== subject.id),
            subject,
          ];

          set({ subjects });

          await saveAttendance(subjects);
        },

        markToday: async (
          id,
          present
        ) => {
          const subjects = get().subjects.map(
            (subject) =>
              subject.id === id
                ? {
                    ...subject,
                    total: subject.total + 1,
                    attended:
                      subject.attended +
                      (present ? 1 : 0),
                  }
                : subject
          );

          set({ subjects });

          await saveAttendance(subjects);
        },

        setSemesterDates: (
          start,
          end
        ) => {
          set({
            semesterStart: start,
            semesterEnd: end,
          });
        },
      }),
      {
        name: "studenthub-attendance",
      }
    )
  );

export function semesterDayCounts(
  start: string,
  end: string
):
  | {
      totalDays: number;
      workingDays: number;
    }
  | null {
  if (!start || !end) return null;

  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");

  if (
    Number.isNaN(s.getTime()) ||
    Number.isNaN(e.getTime()) ||
    e < s
  ) {
    return null;
  }

  let totalDays = 0;
  let workingDays = 0;

  for (
    let d = new Date(s);
    d <= e;
    d.setDate(d.getDate() + 1)
  ) {
    totalDays++;

    if (d.getDay() !== 0) {
      workingDays++;
    }
  }

  return {
    totalDays,
    workingDays,
  };
}