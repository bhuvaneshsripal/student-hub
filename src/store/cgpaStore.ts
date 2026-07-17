import { create } from "zustand";
import type { Semester, Subject, Grade } from "../types";
import { GRADE_POINTS } from "../types";
import {
  loadCgpa,
  saveCgpa,
  subscribeCgpa,
} from "../services/cgpaService";

const seed: Semester[] = [];

/** Grades that never contribute to the GPA denominator: SA (Shortage of
 * Attendance — the student was debarred and never sat the exam) and WC
 * (Withdrawal of Course). Including their credits in the total was making
 * the CGPA come out lower than it actually is. 'U' (arrear/fail) is still
 * counted, since the student did attempt that exam and scored 0 points —
 * that's standard for GPA calculation. */
const EXCLUDED_FROM_GPA: Grade[] = ['SA', 'WC'];

export function semesterGPA(subjects: Subject[]) {
  const graded = subjects.filter((x) => !EXCLUDED_FROM_GPA.includes(x.grade));
  const totalCredits = graded.reduce((s, x) => s + x.credits, 0);
  const points = graded.reduce(
    (s, x) => s + x.credits * GRADE_POINTS[x.grade],
    0
  );

  return totalCredits === 0 ? 0 : points / totalCredits;
}

export function overallCGPA(semesters: Semester[]) {
  const allSubjects = semesters.flatMap((s) => s.subjects);
  return semesterGPA(allSubjects);
}

interface CgpaState {
  semesters: Semester[];

  setSemesters: (semesters: Semester[]) => void;
  sync: () => Promise<void>;

  addSemester: (name: string) => Promise<void>;
  removeSemester: (id: string) => Promise<void>;
  restoreSemester: (semester: Semester) => Promise<void>;

  addSubject: (
    semId: string,
    name: string,
    credits: number,
    grade: Grade
  ) => Promise<void>;

  updateSubject: (
    semId: string,
    subId: string,
    patch: Partial<Subject>
  ) => Promise<void>;

  removeSubject: (
    semId: string,
    subId: string
  ) => Promise<void>;

  restoreSubject: (
    semId: string,
    subject: Subject
  ) => Promise<void>;

  importSubjects: (
    target: {
      semId?: string;
      newSemesterName?: string;
    },
    subjects: {
      name: string;
      credits: number;
      grade: Grade;
    }[]
  ) => Promise<void>;
}

export const useCgpaStore = create<CgpaState>()((set, get) => ({
  semesters: seed,

  setSemesters: (semesters) => {
    set({ semesters });
  },

  sync: async () => {
    const cloud = await loadCgpa();
    set({ semesters: cloud });

    subscribeCgpa((cloudData) => {
      set({ semesters: cloudData });
    });
  },

  addSemester: async (name) => {
    const semesters = [
      ...get().semesters,
      {
        id: crypto.randomUUID(),
        name,
        subjects: [],
      },
    ];

    set({ semesters });
    await saveCgpa(semesters);
  },

  removeSemester: async (id) => {
    const semesters = get().semesters.filter(
      (x) => x.id !== id
    );

    set({ semesters });
    await saveCgpa(semesters);
  },

  restoreSemester: async (semester) => {
    const semesters = [
      ...get().semesters.filter((x) => x.id !== semester.id),
      semester,
    ];

    set({ semesters });
    await saveCgpa(semesters);
  },
    addSubject: async (semId, name, credits, grade) => {
    const semesters = get().semesters.map((sem) =>
      sem.id === semId
        ? {
            ...sem,
            subjects: [
              ...sem.subjects,
              {
                id: crypto.randomUUID(),
                name,
                credits,
                grade,
              },
            ],
          }
        : sem
    );

    set({ semesters });
    await saveCgpa(semesters);
  },

  updateSubject: async (semId, subId, patch) => {
    const semesters = get().semesters.map((sem) =>
      sem.id === semId
        ? {
            ...sem,
            subjects: sem.subjects.map((sub) =>
              sub.id === subId ? { ...sub, ...patch } : sub
            ),
          }
        : sem
    );

    set({ semesters });
    await saveCgpa(semesters);
  },

  removeSubject: async (semId, subId) => {
    const semesters = get().semesters.map((sem) =>
      sem.id === semId
        ? {
            ...sem,
            subjects: sem.subjects.filter((sub) => sub.id !== subId),
          }
        : sem
    );

    set({ semesters });
    await saveCgpa(semesters);
  },

  restoreSubject: async (semId, subject) => {
    const semesters = get().semesters.map((sem) =>
      sem.id === semId
        ? {
            ...sem,
            subjects: [...sem.subjects.filter((sub) => sub.id !== subject.id), subject],
          }
        : sem
    );

    set({ semesters });
    await saveCgpa(semesters);
  },

  importSubjects: async (target, subjects) => {
    const newSubjects: Subject[] = subjects.map((sub) => ({
      ...sub,
      id: crypto.randomUUID(),
    }));

    let semesters = get().semesters;

    if (target.semId) {
      semesters = semesters.map((sem) =>
        sem.id === target.semId
          ? {
              ...sem,
              subjects: [...sem.subjects, ...newSubjects],
            }
          : sem
      );
    } else {
      semesters = [
        ...semesters,
        {
          id: crypto.randomUUID(),
          name:
            target.newSemesterName?.trim() ||
            `Semester ${semesters.length + 1}`,
          subjects: newSubjects,
        },
      ];
    }

    set({ semesters });
    await saveCgpa(semesters);
  },
}));