import Tesseract from 'tesseract.js';
import type { Grade } from '../types';

export interface ParsedSubject {
  name: string;
  credits: number;
  grade: Grade;
}

const VALID_GRADES: Grade[] = ['S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'U', 'SA', 'WC'];

// Matches typical grade-card rows such as:
// "CS3302-Engineering Design and Modelling   10   S   3   Pass"
// (Course name)  (grade point)  (letter grade)  (credit)  (result)
const ROW_REGEX =
  /([A-Za-z0-9À-ÿ.,()/&'\-\s]{4,90}?)\s+(\d{1,2})\s+(S|A\+|A|B\+|B|C\+|C|U|RA|SA|WC)\s+(\d{1,2})\s+(Pass|Fail|Absent|Withheld)/gis;

const LEADING_LABELS = /^(ODD|EVEN)[\s-]*(JUNIOR|SENIOR)?[\s:.\-]*|^SEMESTER\s*[:.\-]?\s*/i;

function cleanName(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(LEADING_LABELS, '')
    .trim()
    .replace(/^[-:.\s]+/, '');
}

function normalizeGrade(g: string): Grade {
  const upper = g.toUpperCase().replace(/\s+/g, '');
  if (upper === 'RA') return 'U';
  return (VALID_GRADES.includes(upper as Grade) ? upper : 'A') as Grade;
}

/** Runs OCR on an uploaded grade-card / result-sheet image and extracts
 * course rows (name, credits, grade) it can find. Best-effort — always
 * meant to be reviewed/edited by the user before saving. */
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
  const results: ParsedSubject[] = [];
  let match: RegExpExecArray | null;
  ROW_REGEX.lastIndex = 0;
  while ((match = ROW_REGEX.exec(text)) !== null) {
    const name = cleanName(match[1]);
    const credits = Number(match[4]);
    const grade = normalizeGrade(match[3]);
    if (name.length < 2 || Number.isNaN(credits) || credits <= 0 || credits > 30) continue;
    results.push({ name, credits, grade });
  }
  return results;
}
