import { useState } from 'react';
import { Search, CalendarClock, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSettingsStore } from '../store/settingsStore';
import { fetchExamSheet, examsForRegisterNumber, type ExamWithGap } from '../services/examService';
import { EXAM_SHEET_CSV_URL } from '../config/examSheet';

export default function ExamFinder() {
  const profileRegNo = useSettingsStore((s) => s.profile.registerNumber);

  const [regNo, setRegNo] = useState(profileRegNo || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ExamWithGap[] | null>(null);

  async function search() {
    if (!regNo.trim()) { setError('Enter your register number first.'); return; }
    if (!EXAM_SHEET_CSV_URL) { setError('Exam sheet isn\'t set up yet. Ask the developer to add the link in src/config/examSheet.ts.'); return; }

    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const all = await fetchExamSheet(EXAM_SHEET_CSV_URL);
      const mine = examsForRegisterNumber(all, regNo);
      if (mine.length === 0) setError('No exams found for that register number.');
      setResults(mine);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong while reading the sheet.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Exam Finder</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
          Enter your register number to see your exam dates and the gap between each exam.
        </p>
      </div>

      <Card className="max-w-lg">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={regNo}
            onChange={(e) => setRegNo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="Register number (e.g. 21CS045)"
            className="input flex-1"
          />
          <Button icon={<Search size={14} />} onClick={search} disabled={loading}>
            {loading ? 'Searching...' : 'Find'}
          </Button>
        </div>
        <style>{`.input { width: 100%; padding: 0.6rem 0.85rem; border-radius: 0.75rem; border: 1px solid var(--line); background: var(--bg); color: var(--ink); font-size: 0.875rem; outline: none; }`}</style>
      </Card>

      {error && (
        <Card className="max-w-lg flex items-start gap-2.5">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--warning)' }} />
          <p className="text-sm" style={{ color: 'var(--ink)' }}>{error}</p>
        </Card>
      )}

      {results && results.length > 0 && (
        <div className="space-y-3 max-w-lg">
          {results.map((r, i) => (
            <Card key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarClock size={18} style={{ color: 'var(--blue)' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{r.subject || 'Exam'}</p>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{r.date}{r.session ? ` · ${r.session}` : ''}</p>
                </div>
              </div>
              <div className="text-right">
                {r.leaveDays === null ? (
                  <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>First exam</span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'var(--bg)', color: r.leaveDays === 0 ? 'var(--danger)' : 'var(--success)' }}>
                    {r.leaveDays} day{r.leaveDays === 1 ? '' : 's'} gap
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
