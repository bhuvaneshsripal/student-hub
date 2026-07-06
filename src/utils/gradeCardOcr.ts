import Tesseract from 'tesseract.js';
import type { Grade } from '../types';

export interface ParsedSubject {
  name: string;
  credits: number;
  grade: Grade;
}

const VALID_GRADES: Grade[] = ['S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'U', 'SA', 'WC'];
const GRADE_TOKEN = 'S|A\\+|A|B\\+|B|C\\+|C|U|RA|SA|WC|F|P';

const LEADING_LABELS = /^(ODD|EVEN)[\s-]*(JUNIOR|SENIOR)?[\s:.\-]*|^SEMESTER\s*[:.\-]?\s*|^\d+[.)]\s*/i;
const RESULT_WORDS = /\b(Pass|Fail|Absent|Withheld)\b/gi;

function cleanName(raw: string): string {
  return raw
    .replace(RESULT_WORDS, ' ')
    .replace(/\s+/g, ' ')
    .replace(LEADING_LABELS, '')
    .trim()
    .replace(/^[-:.\s]+/, '')
    .replace(/[-:.\s]+$/, '');
}

function normalizeGrade(g: string): Grade {
  const upper = g.toUpperCase().replace(/\s+/g, '');
  if (upper === 'RA' || upper === 'F') return 'U';
  if (upper === 'P') return 'C';
  return (VALID_GRADES.includes(upper as Grade) ? upper : 'A') as Grade;
}

function isPlausible(name: string, credits: number): boolean {
  return name.length >= 2 && !Number.isNaN(credits) && credits > 0 && credits <= 30;
}

/** A grade-card row can appear in several shapes depending on the college's
 * layout and how well Tesseract read it. Rather than relying on one rigid
 * pattern (which broke whenever the "grade point" or "result" column was
 * missing / OCR'd oddly), we try several patterns per line, from most to
 * least specific, and fall back gracefully. */
const LINE_PATTERNS: RegExp[] = [
  // Name  gradePoint  letterGrade  credits  result   e.g. "Data Structures 10 S 3 Pass"
  new RegExp(`^(.{2,90}?)\\s+(\\d{1,2})\\s+(${GRADE_TOKEN})\\s+(\\d{1,2})(?:\\s+(?:Pass|Fail|Absent|Withheld))?$`, 'i'),
  // Name  credits  letterGrade  gradePoint          e.g. "Data Structures 3 S 10"
  new RegExp(`^(.{2,90}?)\\s+(\\d{1,2})\\s+(${GRADE_TOKEN})\\s+(\\d{1,2})$`, 'i'),
  // Name  letterGrade  credits                      e.g. "Data Structures S 3"
  new RegExp(`^(.{2,90}?)\\s+(${GRADE_TOKEN})\\s+(\\d{1,2})$`, 'i'),
  // Name  credits  letterGrade                      e.g. "Data Structures 3 S"
  new RegExp(`^(.{2,90}?)\\s+(\\d{1,2})\\s+(${GRADE_TOKEN})$`, 'i'),
];

function parseLine(line: string): ParsedSubject | null {
  const trimmed = line.replace(/\s+/g, ' ').trim();
  if (trimmed.length < 4) return null;

  // Pattern 1: name, gradePoint, letterGrade, credits — grade letter is match[3]
  let m = trimmed.match(LINE_PATTERNS[0]);
  if (m) {
    const name = cleanName(m[1]);
    const credits = Number(m[4]);
    if (isPlausible(name, credits)) return { name, credits, grade: normalizeGrade(m[3]) };
  }

  // Pattern 2: name, credits, letterGrade, gradePoint — grade letter is match[3], credits is match[2]
  m = trimmed.match(LINE_PATTERNS[1]);
  if (m) {
    const name = cleanName(m[1]);
    const credits = Number(m[2]);
    if (isPlausible(name, credits)) return { name, credits, grade: normalizeGrade(m[3]) };
  }

  // Pattern 3: name, letterGrade, credits
  m = trimmed.match(LINE_PATTERNS[2]);
  if (m) {
    const name = cleanName(m[1]);
    const credits = Number(m[3]);
    if (isPlausible(name, credits)) return { name, credits, grade: normalizeGrade(m[2]) };
  }

  // Pattern 4: name, credits, letterGrade
  m = trimmed.match(LINE_PATTERNS[3]);
  if (m) {
    const name = cleanName(m[1]);
    const credits = Number(m[2]);
    if (isPlausible(name, credits)) return { name, credits, grade: normalizeGrade(m[3]) };
  }

  return null;
}

/** Runs OCR on an uploaded grade-card / result-sheet image and extracts
 * course rows (name, credits, grade) it can find. Best-effort — always
 * meant to be reviewed/edited by the user before saving.
 *
 * Parsing is line-by-line with several fallback patterns, since grade
 * cards from different colleges lay out their columns differently and a
 * single rigid regex over the whole OCR'd text was missing most rows. */
export async function extractSubjectsFromImage(
  file: File,
  onProgress?: (pct: number) => void
): Promise<ParsedSubject[]> {
  const { data } = await Tesseract.recognize(file, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        onProgress?.(Math.round(m.progress * 100));
      }
    },
  });

  const text = data.text.replace(/\r/g, '');
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const results: ParsedSubject[] = [];
  for (const line of lines) {
    const row = parseLine(line);
    if (row) results.push(row);
  }

  // Fallback: some scans put the whole table on fewer, longer lines with
  // multiple subjects separated by 2+ spaces or table pipes. Try splitting
  // those and parsing each chunk if the line-by-line pass found little.
  if (results.length === 0) {
    const chunks = text.split(/\n|(?:\s{3,})|\|/).map((c) => c.trim()).filter(Boolean);
    for (const chunk of chunks) {
      const row = parseLine(chunk);
      if (row) results.push(row);
    }
  }

  // De-duplicate identical rows that both patterns might have matched twice.
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = `${r.name.toLowerCase()}|${r.credits}|${r.grade}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
