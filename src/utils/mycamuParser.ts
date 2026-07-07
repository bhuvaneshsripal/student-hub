export interface ParsedMyCamuClass {
  subject: string;
  faculty: string;
  start: string; // "HH:MM" 24-hour
  end: string;   // "HH:MM" 24-hour
}

const TIME_LINE_RE =
  /^(\d{1,2}:\d{2}\s*[AP]M)\s*[-–]\s*(\d{1,2}:\d{2}\s*[AP]M)\s*\(\s*\d+\s*min\s*\)\s*(.+)$/i;

function to24Hour(raw: string): string {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (!m) return '00:00';
  const [, hh, mm, ap] = m;
  let h = parseInt(hh, 10) % 12;
  if (ap.toUpperCase() === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${mm}`;
}

function tidySubject(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}

/**
 * Parses the timetable text as copy-pasted from the MyCamu portal, e.g.:
 *
 *   Object Oriented Programming using Java ( 19AI307 )
 *   8:00 AM - 9:00 AM ( 60 min ) Magitha Nirmala Tennyson
 *
 * Each class is a subject line followed by a "time - time (duration) faculty" line.
 * Returns one entry per class found, in the order they appeared.
 */
export function parseMyCamuTimetable(raw: string): ParsedMyCamuClass[] {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const result: ParsedMyCamuClass[] = [];
  let pendingSubject = '';

  for (const line of lines) {
    const m = line.match(TIME_LINE_RE);
    if (m) {
      const [, startRaw, endRaw, faculty] = m;
      if (pendingSubject) {
        result.push({
          subject: tidySubject(pendingSubject),
          faculty: faculty.trim(),
          start: to24Hour(startRaw),
          end: to24Hour(endRaw),
        });
        pendingSubject = '';
      }
    } else {
      pendingSubject = pendingSubject ? `${pendingSubject} ${line}` : line;
    }
  }

  return result;
}
