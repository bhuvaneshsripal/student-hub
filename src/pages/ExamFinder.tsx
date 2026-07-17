import { useMemo, useState } from 'react';
import { Search, CalendarClock, AlertTriangle, Sparkles, GraduationCap, PartyPopper } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LinkedinIcon, DEVELOPER_LINKEDIN_URL } from '../components/ui/LinkedinIcon';
import { useSettingsStore } from '../store/settingsStore';
import { fetchExamSheet, examsForRegisterNumber, type ExamWithGap } from '../services/examService';
import { EXAM_SHEET_CSV_URL } from '../config/examSheet';

/** Human-friendly "days to go" label for an exam date, computed against today
 * rather than against the previous exam — much more useful at a glance than
 * a gap-between-exams count, and it can't go NaN even on odd sheet data. */
function daysToGoLabel(dateIso: string): { label: string; tone: 'past' | 'today' | 'soon' | 'ok' } {
  const target = new Date(dateIso + 'T00:00:00');
  if (isNaN(target.getTime())) return { label: '—', tone: 'ok' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { label: 'Completed', tone: 'past' };
  if (diff === 0) return { label: 'Today!', tone: 'today' };
  if (diff === 1) return { label: 'Tomorrow', tone: 'soon' };
  if (diff <= 3) return { label: `${diff} days left`, tone: 'soon' };
  return { label: `${diff} days left`, tone: 'ok' };
}

const TONE_COLOR = { past: 'var(--ink-soft)', today: 'var(--danger)', soon: 'var(--warning)', ok: 'var(--success)' } as const;

export default function ExamFinder() {
  const profileRegNo = useSettingsStore((s) => s.profile.registerNumber);
  const profileName = useSettingsStore((s) => s.profile.name);

  const [regNo, setRegNo] = useState(profileRegNo || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [results, setResults] = useState<ExamWithGap[] | null>(null);

  async function search() {
    setNotConfigured(false);
    if (!regNo.trim()) { setError('Enter your register number first.'); return; }
    if (!EXAM_SHEET_CSV_URL) { setError("Exam sheet isn't set up yet."); setNotConfigured(true); return; }

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

  const nextExam = useMemo(() => {
    if (!results) return null;
    return results.find((r) => {
      const d = new Date(r.date + 'T00:00:00');
      const today = new Date(); today.setHours(0, 0, 0, 0);
      return !isNaN(d.getTime()) && d.getTime() >= today.getTime();
    }) || null;
  }, [results]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Exam Finder</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
          Enter your register number to see your exam schedule.
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
          <div>
            <p className="text-sm" style={{ color: 'var(--ink)' }}>{error}</p>
            {notConfigured && (
              <a
                href={DEVELOPER_LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs mt-1.5 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--blue)' }}
              >
                <LinkedinIcon size={13} color="#0A66C2" />
                Ask the developer to update this via LinkedIn
              </a>
            )}
          </div>
        </Card>
      )}

      {results && results.length > 0 && (
        <>
          <div
            className="max-w-lg rounded-2xl p-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(120deg, var(--blue), var(--purple))', boxShadow: '0 12px 30px -10px var(--accent-solid-border)' }}
          >
            <Sparkles size={80} className="absolute -right-3 -top-4 opacity-15" style={{ color: '#fff' }} />
            <div className="relative flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/20 ring-1 ring-inset ring-white/30">
                <GraduationCap size={22} color="#fff" />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-white flex items-center gap-1.5">
                  All the best{profileName ? `, ${profileName.split(' ')[0]}` : ''}! <PartyPopper size={17} />
                </p>
                <p className="text-xs text-white/85 mt-0.5">
                  {nextExam
                    ? `Your next exam is ${nextExam.subject || 'coming up'} on ${nextExam.date}. Go crush it! 🎯`
                    : "You've cleared all your listed exams — great work! 🎉"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-w-lg">
            {results.map((r, i) => {
              const { label, tone } = daysToGoLabel(r.date);
              const isNext = nextExam && r.date === nextExam.date && r.subject === nextExam.subject;
              return (
                <Card
                  key={i}
                  delay={i * 0.03}
                  className="flex items-center justify-between"
                  style={isNext ? { border: '1.5px solid var(--accent-solid-border)' } : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white"
                      style={{ background: `linear-gradient(135deg, var(--blue), var(--purple))` }}
                    >
                      <CalendarClock size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{r.subject || 'Exam'}</p>
                      <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{r.date}{r.session ? ` · ${r.session}` : ''}</p>
                    </div>
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ml-2"
                    style={{ background: `${TONE_COLOR[tone]}1A`, color: TONE_COLOR[tone] }}
                  >
                    {label}
                  </span>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
