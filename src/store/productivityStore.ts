import { create } from "zustand";

import type {
  Note,
  Task,
  PomodoroSession,
  CalendarEvent,
  Priority,
} from "../types";

import {
  loadTasks,
  saveTasks,
  subscribeTasks,
} from "../services/productivityService";

import {
  loadNotes,
  saveNotes,
  subscribeNotes,
} from "../services/notesService";

import {
  loadPomodoro,
  savePomodoro,
  subscribePomodoro,
} from "../services/pomodoroService";

import {
  loadCalendar,
  saveCalendar,
  subscribeCalendar,
} from "../services/calendarService";

interface ProductivityState {
  // ===================== NOTES =====================

  notes: Note[];

  setNotes: (notes: Note[]) => void;

  syncNotes: () => Promise<void>;

  addNote: (
    title: string,
    content: string,
    tags: string[]
  ) => Promise<void>;

  updateNote: (
    id: string,
    patch: Partial<Note>
  ) => Promise<void>;

  removeNote: (
    id: string
  ) => Promise<void>;

  // ===================== TASKS =====================

  tasks: Task[];

  setTasks: (tasks: Task[]) => void;

  syncTasks: () => Promise<void>;

  addTask: (
    title: string,
    dueDate: string | null,
    priority: Priority
  ) => Promise<void>;

  toggleTask: (
    id: string
  ) => Promise<void>;

  removeTask: (
    id: string
  ) => Promise<void>;

  // ===================== POMODORO =====================

  pomodoroSessions: PomodoroSession[];

  setPomodoroSessions: (
    sessions: PomodoroSession[]
  ) => void;

  syncPomodoro: () => Promise<void>;

  addPomodoroSession: (
    minutes: number,
    type: "focus" | "break"
  ) => Promise<void>;

  studyStreak: () => number;

  weeklyStudyHours: () => number;

  // ===================== CALENDAR =====================

  events: CalendarEvent[];

  setEvents: (
    events: CalendarEvent[]
  ) => void;

  syncCalendar: () => Promise<void>;

  addEvent: (
    title: string,
    date: string,
    type: CalendarEvent["type"]
  ) => Promise<void>;

  removeEvent: (
    id: string
  ) => Promise<void>;
}

export const useProductivityStore =
  create<ProductivityState>()((set, get) => ({
      // ====================================================
  // NOTES
  // ====================================================

  notes: [],

  setNotes: (notes) => {
    set({ notes });
  },

  syncNotes: async () => {
    const notes = await loadNotes();

    set({ notes });

    subscribeNotes((notes) => {
      set({ notes });
    });
  },

  addNote: async (title, content, tags) => {
    const notes = [
      {
        id: crypto.randomUUID(),
        title,
        content,
        tags,
        updatedAt: new Date().toISOString(),
      },
      ...get().notes,
    ];

    set({ notes });

    await saveNotes(notes);
  },

  updateNote: async (id, patch) => {
    const notes = get().notes.map((note) =>
      note.id === id
        ? {
            ...note,
            ...patch,
            updatedAt: new Date().toISOString(),
          }
        : note
    );

    set({ notes });

    await saveNotes(notes);
  },

  removeNote: async (id) => {
    const notes = get().notes.filter((note) => note.id !== id);

    set({ notes });

    await saveNotes(notes);
  },
    // ====================================================
  // TASKS
  // ====================================================

  tasks: [],

  setTasks: (tasks) => {
    set({ tasks });
  },

  syncTasks: async () => {
    const tasks = await loadTasks();

    set({ tasks });

    subscribeTasks((tasks) => {
      set({ tasks });
    });
  },

  addTask: async (title, dueDate, priority) => {
    const tasks = [
      {
        id: crypto.randomUUID(),
        title,
        dueDate,
        priority,
        done: false,
        createdAt: new Date().toISOString(),
      },
      ...get().tasks,
    ];

    set({ tasks });

    await saveTasks(tasks);
  },

  toggleTask: async (id) => {
    const tasks = get().tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            done: !task.done,
          }
        : task
    );

    set({ tasks });

    await saveTasks(tasks);
  },

  removeTask: async (id) => {
    const tasks = get().tasks.filter(
      (task) => task.id !== id
    );

    set({ tasks });

    await saveTasks(tasks);
  },
    // ====================================================
  // POMODORO
  // ====================================================

  pomodoroSessions: [],

  setPomodoroSessions: (sessions) => {
    set({ pomodoroSessions: sessions });
  },

  syncPomodoro: async () => {
    const sessions = await loadPomodoro();

    set({ pomodoroSessions: sessions });

    subscribePomodoro((sessions) => {
      set({ pomodoroSessions: sessions });
    });
  },

  addPomodoroSession: async (minutes, type) => {
    const sessions = [
      ...get().pomodoroSessions,
      {
        id: crypto.randomUUID(),
        minutes,
        type,
        completedAt: new Date().toISOString(),
      },
    ];

    set({ pomodoroSessions: sessions });

    await savePomodoro(sessions);
  },

  studyStreak: () => {
    const sessions = get().pomodoroSessions.filter(
      (session) => session.type === "focus"
    );

    if (sessions.length === 0) return 0;

    const days = new Set(
      sessions.map((session) =>
        session.completedAt.slice(0, 10)
      )
    );

    let streak = 0;
    const date = new Date();

    while (true) {
      const key = date.toISOString().slice(0, 10);

      if (!days.has(key)) break;

      streak++;
      date.setDate(date.getDate() - 1);
    }

    return streak;
  },

  weeklyStudyHours: () => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const minutes = get()
      .pomodoroSessions
      .filter(
        (session) =>
          session.type === "focus" &&
          new Date(session.completedAt).getTime() >= weekAgo
      )
      .reduce(
        (total, session) => total + session.minutes,
        0
      );

    return Math.round((minutes / 60) * 10) / 10;
  },
    // ====================================================
  // CALENDAR
  // ====================================================

  events: [],

  setEvents: (events) => {
    set({ events });
  },

  syncCalendar: async () => {
    const events = await loadCalendar();

    set({ events });

    subscribeCalendar((events) => {
      set({ events });
    });
  },

  addEvent: async (title, date, type) => {
    const events = [
      ...get().events,
      {
        id: crypto.randomUUID(),
        title,
        date,
        type,
      },
    ];

    set({ events });

    await saveCalendar(events);
  },

  removeEvent: async (id) => {
    const events = get().events.filter(
      (event) => event.id !== id
    );

    set({ events });

    await saveCalendar(events);
  },
}));