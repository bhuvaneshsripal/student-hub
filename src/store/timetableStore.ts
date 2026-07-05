import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ClassBlock } from '../types';

const seed: ClassBlock[] = [];

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
