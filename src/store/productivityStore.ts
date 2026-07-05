import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note, Task, PomodoroSession, CalendarEvent, Priority } from '../types';

interface ProductivityState {
  notes: Note[];
  addNote: (title: string, content: string, tags: string[]) => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  removeNote: (id: string) => void;

  tasks: Task[];
  addTask: (title: string, dueDate: string | null, priority: Priority) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;

  pomodoroSessions: PomodoroSession[];
  addPomodoroSession: (minutes: number, type: 'focus' | 'break') => void;
  studyStreak: () => number;
  weeklyStudyHours: () => number;

  events: CalendarEvent[];
  addEvent: (title: string, date: string, type: CalendarEvent['type']) => void;
  removeEvent: (id: string) => void;
}

export const useProductivityStore = create<ProductivityState>()(
  persist(
    (set, get) => ({
      notes: [
        { id: crypto.randomUUID(), title: 'OS Unit 3 — Deadlocks', content: 'Necessary conditions: mutual exclusion, hold and wait, no preemption, circular wait. Banker\'s algorithm for avoidance.', updatedAt: new Date().toISOString(), tags: ['os', 'exam'] },
      ],
      addNote: (title, content, tags) => set((s) => ({
        notes: [{ id: crypto.randomUUID(), title, content, tags, updatedAt: new Date().toISOString() }, ...s.notes],
      })),
      updateNote: (id, patch) => set((s) => ({
        notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)),
      })),
      removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      tasks: [
        { id: crypto.randomUUID(), title: 'Finish DBMS assignment 3', dueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10), priority: 'high', done: false, createdAt: new Date().toISOString() },
        { id: crypto.randomUUID(), title: 'Revise Networks unit 2', dueDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10), priority: 'medium', done: false, createdAt: new Date().toISOString() },
      ],
      addTask: (title, dueDate, priority) => set((s) => ({
        tasks: [{ id: crypto.randomUUID(), title, dueDate, priority, done: false, createdAt: new Date().toISOString() }, ...s.tasks],
      })),
      toggleTask: (id) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      pomodoroSessions: [],
      addPomodoroSession: (minutes, type) => set((s) => ({
        pomodoroSessions: [...s.pomodoroSessions, { id: crypto.randomUUID(), minutes, type, completedAt: new Date().toISOString() }],
      })),
      studyStreak: () => {
        const sessions = get().pomodoroSessions.filter((p) => p.type === 'focus');
        if (sessions.length === 0) return 0;
        const days = new Set(sessions.map((s) => s.completedAt.slice(0, 10)));
        let streak = 0;
        const d = new Date();
        for (;;) {
          const key = d.toISOString().slice(0, 10);
          if (days.has(key)) { streak++; d.setDate(d.getDate() - 1); } else break;
        }
        return streak;
      },
      weeklyStudyHours: () => {
        const weekAgo = Date.now() - 7 * 86400000;
        const mins = get().pomodoroSessions
          .filter((p) => p.type === 'focus' && new Date(p.completedAt).getTime() >= weekAgo)
          .reduce((a, p) => a + p.minutes, 0);
        return Math.round((mins / 60) * 10) / 10;
      },

      events: [
        { id: crypto.randomUUID(), title: 'Database Systems Mid-term', date: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10), type: 'exam' },
        { id: crypto.randomUUID(), title: 'OS Assignment Due', date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10), type: 'assignment' },
      ],
      addEvent: (title, date, type) => set((s) => ({
        events: [...s.events, { id: crypto.randomUUID(), title, date, type }],
      })),
      removeEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    }),
    { name: 'studenthub-productivity' }
  )
);
