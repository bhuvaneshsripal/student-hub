export const SUBJECT_COLORS = ['#3B5BFF', '#8B3AFF', '#06B6D4', '#EC4899', '#10B981', '#FF9F1C', '#F04438'];

/** Deterministically maps a subject name to one of the palette colors, so
 * the same subject always shows the same color everywhere (Dashboard,
 * Timetable, PDF export, MyCamu import, etc.) — and different subjects get
 * spread across the palette — regardless of what color was picked when
 * each individual class slot was created. */
export function colorForSubjectName(subject: string): string {
  const key = subject.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return SUBJECT_COLORS[hash % SUBJECT_COLORS.length];
}
