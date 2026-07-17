// Looks up exam dates from a Google Sheet the developer publishes to the web
// as CSV (File > Share > Publish to web > CSV). We only ever read this sheet;
// nothing in the app writes back to it.
//
// Expected columns (header names are matched case-insensitively, and a few
// common synonyms are accepted so the developer doesn't have to rename
// existing columns):
//   Register Number | Subject / Exam | Exam Date | Session (optional)
export interface ExamRecord {
  registerNumber: string;
  subject: string;
  date: string; // ISO yyyy-mm-dd when parseable, otherwise the raw cell
  session?: string;
}

export interface ExamWithGap extends ExamRecord {
  /** Full calendar days between this exam and the previous one for the same student (null for the first exam). */
  leaveDays: number | null;
}

function normalizeHeader(h: string) {
  return h.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

const REGISTER_ALIASES = ['registernumber', 'regno', 'registerno', 'rollnumber', 'rollno'];
const SUBJECT_ALIASES = ['subject', 'exam', 'examname', 'coursename', 'paper'];
const DATE_ALIASES = ['examdate', 'date', 'datum'];
const SESSION_ALIASES = ['session', 'time', 'slot'];

/** Minimal CSV line parser that handles quoted commas, good enough for
 * Google Sheets' "Publish to web" CSV export. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n') {
      row.push(field); field = '';
      rows.push(row); row = [];
    } else if (c === '\r') {
      // ignore, \n handles the line break
    } else {
      field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function toIsoDate(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  // Already ISO-ish
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);

  // DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY — the format Google Sheets/MyCamu
  // usually exports and which the plain `new Date(...)` constructor below
  // gets wrong (it either misreads day/month or returns Invalid Date),
  // which is what was producing "NaN days gap".
  const dmy = trimmed.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const day = Number(d);
    const month = Number(m);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${y}-${pad2(month)}-${pad2(day)}`;
    }
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return trimmed;
}

export async function fetchExamSheet(sheetUrl: string): Promise<ExamRecord[]> {
  const res = await fetch(sheetUrl);
  if (!res.ok) throw new Error('Could not reach the exam sheet. Check the link in Settings.');
  const text = await res.text();
  const rows = parseCsv(text);
  if (rows.length < 2) return [];

  const header = rows[0].map(normalizeHeader);
  const regIdx = header.findIndex((h) => REGISTER_ALIASES.includes(h));
  const subjIdx = header.findIndex((h) => SUBJECT_ALIASES.includes(h));
  const dateIdx = header.findIndex((h) => DATE_ALIASES.includes(h));
  const sessionIdx = header.findIndex((h) => SESSION_ALIASES.includes(h));

  if (regIdx === -1 || dateIdx === -1) {
    throw new Error('The sheet needs "Register Number" and "Exam Date" columns.');
  }

  return rows.slice(1).map((r) => ({
    registerNumber: (r[regIdx] || '').trim(),
    subject: subjIdx !== -1 ? (r[subjIdx] || '').trim() : '',
    date: toIsoDate(r[dateIdx] || ''),
    session: sessionIdx !== -1 ? (r[sessionIdx] || '').trim() : undefined,
  })).filter((r) => r.registerNumber && r.date);
}

/** Filters exams for one register number, sorted by date, with the number of
 * free/leave days between each exam and the one before it. */
export function examsForRegisterNumber(all: ExamRecord[], registerNumber: string): ExamWithGap[] {
  const key = registerNumber.trim().toLowerCase();
  const mine = all
    .filter((r) => r.registerNumber.trim().toLowerCase() === key)
    .sort((a, b) => a.date.localeCompare(b.date));

  return mine.map((exam, i) => {
    if (i === 0) return { ...exam, leaveDays: null };
    const prev = new Date(mine[i - 1].date);
    const curr = new Date(exam.date);
    if (isNaN(prev.getTime()) || isNaN(curr.getTime())) return { ...exam, leaveDays: null };
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    return { ...exam, leaveDays: Math.max(0, diffDays - 1) };
  });
}
