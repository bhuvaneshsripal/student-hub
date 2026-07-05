import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ClassBlock } from '../types';

const seed: ClassBlock[] = [
  { id: 'c1', day: 'Monday', subject: 'Data Structures', faculty: 'Dr. Menon', room: 'CS-201', start: '09:00', end: '10:00', color: '#F2C94C' },
  { id: 'c2', day: 'Monday', subject: 'Operating Systems', faculty: 'Prof. Iyer', room: 'CS-105', start: '10:15', end: '11:15', color: '#FFB800' },
  { id: 'c3', day: 'Wednesday', subject: 'Database Systems', faculty: 'Dr. Rao', room: 'CS-201', start: '09:00', end: '10:00', color: '#FFE066' },
  { id: 'c4', day: 'Friday', subject: 'Computer Networks', faculty: 'Dr. Singh', room: 'CS-303', start: '11:30', end: '12:30', color: '#17B26A' },
];

interface TimetableState {
  classes: ClassBlock[];
  addClass: (c: Omit<ClassBlock, 'id'>) => void;
  updateClass: (id: string, c: Partial<ClassBlock>) => void;
  removeClass: (id: string) => void;
  hasConflict: (c: Omit<ClassBlock, 'id'> & { id?: string }) => boolean;
}

export const useTimetableStore = create<TimetableState>()(
  persist(
    (set, get) => ({
      classes: seed,
      addClass: (c) => set((s) => ({ classes: [...s.classes, { ...c, id: crypto.randomUUID() }] })),
      updateClass: (id, c) => set((s) => ({ classes: s.classes.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
      removeClass: (id) => set((s) => ({ classes: s.classes.filter((x) => x.id !== id) })),
      hasConflict: (c) => {
        return get().classes.some((x) => {
          if (x.id === c.id) return false;
          if (x.day !== c.day) return false;
          return c.start < x.end && x.start < c.end;
        });
      },
    }),
    { name: 'studenthub-timetable' }
  )
);
