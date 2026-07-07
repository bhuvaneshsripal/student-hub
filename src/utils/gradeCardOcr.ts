import Tesseract from 'tesseract.js';
import type { Grade } from '../types';
import { GRADE_POINTS } from '../types';

export interface ParsedSubject {
  name: string;
  credits: number;
  grade: Grade;
}

const VALID_GRADES: Grade[] = ['S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'U', 'SA', 'WC'];
const GRADE_TOKEN = 'S|A\\+|A|B\\+|B|C\\+|C|U|RA|SA|WC|F|P';

// Matches ONE leading "label" token that can precede the actual course
// name on a result-portal row: the semester tag ("ODD-JUNIOR", "EVEN
// SENIOR"), a literal "SEMESTER" label, a leading list number, or a course
// code ("SH7801", "CS3414", "EC2404" — 2-4 letters followed by 3-5
// digits). A real grade-card row often has *two* of these in front of the
// course name (semester tag, then course code), so this is applied in a
// loop by cleanName rather than once.
const LEADING_LABEL = /^(?:(?:ODD|EVEN)[\s-]*(?:JUNIOR|SENIOR)?[\s:.\-]*|SEMESTER\s*[:.\-]?\s*|\d+[.)]\s*|[A-Za-z]{2,4}\d{3,5}[\s:.\-]*)/i;
const RESULT_WORDS = /\b(Pass|Fail|Absent|Withheld)\b/gi;

function cleanName(raw: string): string {
  let name = raw
    .replace(RESULT_WORDS, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Strip leading label tokens repeatedly — a row can have a semester tag
  // *and* a course code before the real course name (e.g.
  // "ODD-JUNIOR SH7801 Communicative English").
  let prev;
  do {
    prev = name;
    name = name.replace(LEADING_LABEL, '').trim();
  } while (name !== prev && name.length > 0);

  return name
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

/** Grade-card rows with two numeric columns (credits and grade-point) can
 * list them in either order depending on the college — "credits, grade,
 * gradePoint" or "gradePoint, grade, credits" — and OCR gives us no
 * reliable way to tell which column is which just from position. Instead,
 * we compare both numbers against the grade-point value that the letter
 * grade is *supposed* to have (from GRADE_POINTS) and treat whichever one
 * is closer as the grade-point column, leaving the other as credits. This
 * was previously guessed purely by column position, which silently
 * swapped credits and grade-points whenever a college used the other
 * column order — producing wildly wrong credits and therefore wrong GPA. */
function resolveCredits(grade: Grade, a: number, b: number): number {
  const expected = GRADE_POINTS[grade];
  const diffA = Math.abs(a - expected);
  const diffB = Math.abs(b - expected);
  if (diffA === diffB) return Math.min(a, b);
  return diffA < diffB ? b : a;
}

/** A grade-card row can appear in several shapes depending on the college's
 * layout and how well Tesseract read it. Rather than relying on one rigid
 * pattern (which broke whenever the "grade point" or "result" column was
 * missing / OCR'd oddly), we try several patterns per line, from most to
 * least specific, and fall back gracefully. */
const LINE_PATTERNS: RegExp[] = [
  // Name  <num>  letterGrade  <num>  result?   e.g. "Data Structures 10 S 3 Pass"
  // or    "Data Structures 3 S 10" — column order for the two numbers varies
  // by college, so both numbers are captured and disambiguated afterward.
  new RegExp(`^(.{2,90}?)\\s+(\\d{1,2})\\s+(${GRADE_TOKEN})\\s+(\\d{1,2})(?:\\s+(?:Pass|Fail|Absent|Withheld))?$`, 'i'),
  // Name  <num>  <num>  letterGrade  result?   e.g. college result portals that
  // list "CREDIT  GRADE POINT  GRADE  RESULT" columns in that order, such as
  // "Communicative English 4 8 A Pass". Both numbers are captured and
  // disambiguated the same way as the pattern above.
  new RegExp(`^(.{2,90}?)\\s+(\\d{1,2}(?:\\.\\d)?)\\s+(\\d{1,2}(?:\\.\\d)?)\\s+(${GRADE_TOKEN})(?:\\s+(?:Pass|Fail|Absent|Withheld))?$`, 'i'),
  // Name  letterGrade  credits                      e.g. "Data Structures S 3"
  new RegExp(`^(.{2,90}?)\\s+(${GRADE_TOKEN})\\s+(\\d{1,2})$`, 'i'),
  // Name  credits  letterGrade                      e.g. "Data Structures 3 S"
  new RegExp(`^(.{2,90}?)\\s+(\\d{1,2})\\s+(${GRADE_TOKEN})$`, 'i'),
];

function parseLine(line: string): ParsedSubject | null {
  const trimmed = line.replace(/\s+/g, ' ').trim();
  if (trimmed.length < 4) return null;

  // Pattern 1: name + two numbers + letter grade — disambiguate which
  // number is credits vs grade-point using the letter grade's known value.
  let m = trimmed.match(LINE_PATTERNS[0]);
  if (m) {
    const name = cleanName(m[1]);
    const grade = normalizeGrade(m[3]);
    const credits = resolveCredits(grade, Number(m[2]), Number(m[4]));
    if (isPlausible(name, credits)) return { name, credits, grade };
  }

  // Pattern 2: name, numA, numB, letterGrade — the result-portal column
  // order (e.g. CREDIT, GRADE POINT, GRADE). Same disambiguation as above.
  m = trimmed.match(LINE_PATTERNS[1]);
  if (m) {
    const name = cleanName(m[1]);
    const grade = normalizeGrade(m[4]);
    const credits = resolveCredits(grade, Number(m[2]), Number(m[3]));
    if (isPlausible(name, credits)) return { name, credits, grade };
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

/** Runs the shared line-parsing pass (plus the "long line, multiple
 * subjects" fallback and de-duplication) over already-OCR'd text. Used by
 * both the image and PDF extraction paths so they stay in sync. */
function parseSubjectsFromText(text: string): ParsedSubject[] {
  const cleaned = text.replace(/\r/g, '');
  const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);

  const results: ParsedSubject[] = [];
  for (const line of lines) {
    const row = parseLine(line);
    if (row) results.push(row);
  }

  // Fallback: some scans put the whole table on fewer, longer lines with
  // multiple subjects separated by 2+ spaces or table pipes. Try splitting
  // those and parsing each chunk if the line-by-line pass found little.
  if (results.length === 0) {
    const chunks = cleaned.split(/\n|(?:\s{3,})|\|/).map((c) => c.trim()).filter(Boolean);
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

/** Runs OCR on an uploaded grade-card / result-sheet image and extracts
 * course rows (name, credits, grade) it can find. Best-effort — always
 * meant to be reviewed/edited by the user before saving.
 *
 * Parsing is line-by-line with several fallback patterns, since grade
 * cards from different colleges lay out their columns differently and a
 * single rigid regex over the whole OCR'd text was missing most rows. */
export async function extractSubjectsFromImage(
  file: File | Blob | HTMLCanvasElement,
  onProgress?: (pct: number) => void
): Promise<ParsedSubject[]> {
  const { data } = await Tesseract.recognize(file, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        onProgress?.(Math.round(m.progress * 100));
      }
    },
  });

  return parseSubjectsFromText(data.text);
}

/** Renders every page of an uploaded PDF grade-card to a canvas and runs
 * OCR on each page, merging the detected rows together. Progress is
 * reported across the whole document (not just one page). */
export async function extractSubjectsFromPdf(
  file: File,
  onProgress?: (pct: number) => void
): Promise<ParsedSubject[]> {
  const pdfjsLib = await import('pdfjs-dist');
  // Vite's client types declare "*?url" modules, so this resolves to a
  // worker script URL without a separate static-asset copy step.
  const workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const allResults: ParsedSubject[] = [];
  const seen = new Set<string>();

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const { data } = await Tesseract.recognize(canvas, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && typeof m.progress === 'number') {
          const pageShare = 100 / pdf.numPages;
          const pct = (pageNum - 1) * pageShare + m.progress * pageShare;
          onProgress?.(Math.round(pct));
        }
      },
    });

    for (const row of parseSubjectsFromText(data.text)) {
      const key = `${row.name.toLowerCase()}|${row.credits}|${row.grade}`;
      if (seen.has(key)) continue;
      seen.add(key);
      allResults.push(row);
    }
  }

  return allResults;
}

/** Single entry point for the "Add Image/PDF (Auto GPA)" feature — picks
 * the right extraction path based on the uploaded file's type. */
export async function extractSubjectsFromFile(
  file: File,
  onProgress?: (pct: number) => void
): Promise<ParsedSubject[]> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  return isPdf ? extractSubjectsFromPdf(file, onProgress) : extractSubjectsFromImage(file, onProgress);
}
