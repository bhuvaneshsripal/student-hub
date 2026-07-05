import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Semester, Subject, Grade } from '../types';
import { GRADE_POINTS } from '../types';

const seed: Semester[] = [
  {
    id: 's1', name: 'Semester 1',
    subjects: [
      { id: 'a', name: 'Mathematics I', credits: 4, grade: 'A' },
      { id: 'b', name: 'Physics', credits: 3, grade: 'A+' },
      { id: 'c', name: 'Programming Basics', credits: 4, grade: 'S' },
    ],
  },
  {
    id: 's2', name: 'Semester 2',
    subjects: [
      { id: 'd', name: 'Mathematics II', credits: 4, grade: 'B+' },
      { id: 'e', name: 'Data Structures', credits: 4, grade: 'A' },
      { id: 'f', name: 'Digital Logic', credits: 3, grade: 'A' },
    ],
  },
];

export function semesterGPA(subjects: Subject[]) {
  const totalCredits = subjects.reduce((s, x) => s + x.credits, 0);
  const points = subjects.reduce((s, x) => s + x.credits * GRADE_POINTS[x.grade], 0);
  return totalCredits === 0 ? 0 : points / totalCredits;
}

export function overallCGPA(semesters: Semester[]) {
  const allSubjects = semesters.flatMap((s) => s.subjects);
  return semesterGPA(allSubjects);
}

interface CgpaState {
  semesters: Semester[];
  addSemester: (name: string) => void;
  removeSemester: (id: string) => void;
  addSubject: (semId: string, name: string, credits: number, grade: Grade) => void;
  updateSubject: (semId: string, subId: string, patch: Partial<Subject>) => void;
  removeSubject: (semId: string, subId: string) => void;
  importSubjects: (
    target: { semId?: string; newSemesterName?: string },
    subjects: { name: string; credits: number; grade: Grade }[]
  ) => void;
}

export const useCgpaStore = create<CgpaState>()(
  persist(
    (set) => ({
      semesters: seed,
      addSemester: (name) => set((s) => ({ semesters: [...s.semesters, { id: crypto.randomUUID(), name, subjects: [] }] })),
      removeSemester: (id) => set((s) => ({ semesters: s.semesters.filter((x) => x.id !== id) })),
      addSubject: (semId, name, credits, grade) => set((s) => ({
        semesters: s.semesters.map((sem) => sem.id === semId
          ? { ...sem, subjects: [...sem.subjects, { id: crypto.randomUUID(), name, credits, grade }] }
          : sem),
      })),
      updateSubject: (semId, subId, patch) => set((s) => ({
        semesters: s.semesters.map((sem) => sem.id === semId
          ? { ...sem, subjects: sem.subjects.map((sub) => sub.id === subId ? { ...sub, ...patch } : sub) }
          : sem),
      })),
      removeSubject: (semId, subId) => set((s) => ({
        semesters: s.semesters.map((sem) => sem.id === semId
          ? { ...sem, subjects: sem.subjects.filter((sub) => sub.id !== subId) }
          : sem),
      })),
      importSubjects: (target, subjects) => set((s) => {
        const newSubjects: Subject[] = subjects.map((sub) => ({ ...sub, id: crypto.randomUUID() }));
        if (target.semId) {
          return {
            semesters: s.semesters.map((sem) => sem.id === target.semId
              ? { ...sem, subjects: [...sem.subjects, ...newSubjects] }
              : sem),
          };
        }
        const newSemester: Semester = {
          id: crypto.randomUUID(),
          name: target.newSemesterName?.trim() || `Semester ${s.semesters.length + 1}`,
          subjects: newSubjects,
        };
        return { semesters: [...s.semesters, newSemester] };
      }),
    }),
    { name: 'studenthub-cgpa' }
  )
);
