import { create } from "zustand";
import type { ClassBlock } from "../types";
import {
  loadTimetable,
  saveTimetable,
  subscribeTimetable,
} from "../services/timetableService";

const seed: ClassBlock[] = [];

interface TimetableState {
  classes: ClassBlock[];
  addClass: (c: Omit<ClassBlock, "id">) => Promise<void>;
  updateClass: (id: string, c: Partial<ClassBlock>) => Promise<void>;
  removeClass: (id: string) => Promise<void>;
  restoreClass: (c: ClassBlock) => Promise<void>;
  hasConflict: (c: Omit<ClassBlock, "id"> & { id?: string }) => boolean;
  sync: () => Promise<void>;
}

export const useTimetableStore = create<TimetableState>((set, get) => ({
  classes: seed,

  sync: async () => {
    const classes = await loadTimetable();
    set({ classes });

    subscribeTimetable((classes) => {
      set({ classes });
    });
  },

  addClass: async (c) => {
    const classes = [
      ...get().classes,
      { ...c, id: crypto.randomUUID() },
    ];

    set({ classes });
    await saveTimetable(classes);
  },

  updateClass: async (id, c) => {
    const classes = get().classes.map((x) =>
      x.id === id ? { ...x, ...c } : x
    );

    set({ classes });
    await saveTimetable(classes);
  },

  removeClass: async (id) => {
    const classes = get().classes.filter((x) => x.id !== id);

    set({ classes });
    await saveTimetable(classes);
  },

  restoreClass: async (c) => {
    const classes = [...get().classes.filter((x) => x.id !== c.id), c];

    set({ classes });
    await saveTimetable(classes);
  },

  hasConflict: (c) => {
    return get().classes.some((x) => {
      if (x.id === c.id) return false;
      if (x.day !== c.day) return false;
      return c.start < x.end && x.start < c.end;
    });
  },
}));