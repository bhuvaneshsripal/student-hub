export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface ClassBlock {
  id: string;
  day: Day;
  subject: string;
  faculty: string;
  room: string;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  color: string; // hex
}

export type Grade = 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'U' | 'SA' | 'WC';

export const GRADE_POINTS: Record<Grade, number> = {
  'S': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6.5, 'C+': 6, 'C': 5, 'U': 0, 'SA': 0, 'WC': 0,
};

export const GRADE_DESCRIPTIONS: Record<Grade, string> = {
  'S': 'Outstanding', 'A+': 'Excellent', 'A': 'Very Good', 'B+': 'Good', 'B': 'Above Average',
  'C+': 'Average', 'C': 'Satisfactory', 'U': 'Re-appearance', 'SA': 'Shortage of Attendance', 'WC': 'Withdrawal of Course',
};

export interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: Grade;
}

export interface Semester {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface AttendanceSubject {
  id: string;
  name: string;
  total: number;
  attended: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  tags: string[];
}

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  priority: Priority;
  done: boolean;
  createdAt: string;
}

export interface PomodoroSession {
  id: string;
  minutes: number;
  completedAt: string;
  type: 'focus' | 'break';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'assignment' | 'event' | 'holiday';
}

export interface TopicProgress {
  id: string;
  name: string;
  done: boolean;
  difficulty?: "easy" | "medium" | "hard";
}

export interface PlatformStat {
  id: string;
  name: string;
  solved: number;
  weeklyGoal: number;
  monthlyGoal: number;
  streak: number;
}

export interface ResumeChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface Profile {
  name: string;
  registerNumber: string;
  department: string;
  year: string;
  semester: string;
  avatar: string; // data URL or emoji fallback
}
