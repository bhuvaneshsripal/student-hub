import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useProductivityStore } from '../store/productivityStore';
import { useToastStore } from '../store/toastStore';

const PRESETS = [
  { label: 'Focus 25', minutes: 25, type: 'focus' as const },
  { label: 'Break 5', minutes: 5, type: 'break' as const },
  { label: 'Long Break 15', minutes: 15, type: 'break' as const },
];

export default function Pomodoro() {
  const [minutes, setMinutes] = useState(25);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addPomodoroSession = useProductivityStore((s) => s.addPomodoroSession);
  const sessions = useProductivityStore((s) => s.pomodoroSessions);
  const push = useToastStore((s) => s.push);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            addPomodoroSession(minutes, mode);
            push(`${mode === 'focus' ? 'Focus session' : 'Break'} complete! 🎉`, 'success');
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  function selectPreset(p: typeof PRESETS[number]) {
    setRunning(false);
    setMode(p.type);
    setMinutes(p.minutes);
    setSecondsLeft(p.minutes * 60);
  }

  function applyCustom() {
    setRunning(false);
    setMinutes(customMinutes);
    setSecondsLeft(customMinutes * 60);
  }

  function reset() {
    setRunning(false);
    setSecondsLeft(minutes * 60);
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const progress = 1 - secondsLeft / (minutes * 60);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Pomodoro Timer</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Stay focused with timed study sprints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 flex flex-col items-center py-10">
          <div className="relative w-64 h-64 flex items-center justify-center mb-6">
            <svg width={256} height={256} className="-rotate-90 absolute">
              <circle cx={128} cy={128} r={116} fill="none" stroke="var(--line)" strokeWidth={12} />
              <circle
                cx={128} cy={128} r={116} fill="none" stroke="url(#pomGrad)" strokeWidth={12}
                strokeLinecap="round" strokeDasharray={2 * Math.PI * 116}
                strokeDashoffset={2 * Math.PI * 116 * (1 - progress)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
              <defs>
                <linearGradient id="pomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--blue)" /><stop offset="100%" stopColor="var(--purple)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col items-center">
              {mode === 'focus' ? <Brain size={20} style={{ color: 'var(--blue)' }} /> : <Coffee size={20} style={{ color: 'var(--purple)' }} />}
              <span className="font-display font-bold text-5xl mt-2 font-mono" style={{ color: 'var(--ink)' }}>{mm}:{ss}</span>
              <span className="text-xs uppercase tracking-wide mt-1" style={{ color: 'var(--ink-soft)' }}>{mode}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button icon={running ? <Pause size={15} /> : <Play size={15} />} onClick={() => setRunning((r) => !r)}>
              {running ? 'Pause' : 'Start'}
            </Button>
            <Button variant="outline" icon={<RotateCcw size={15} />} onClick={reset}>Reset</Button>
          </div>
          <div className="flex gap-2 mt-6 flex-wrap justify-center">
            {PRESETS.map((p) => (
              <button
                key={p.label} onClick={() => selectPreset(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'var(--bg)', color: 'var(--ink)' }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input
              type="number" min={1} value={customMinutes}
              onChange={(e) => setCustomMinutes(Number(e.target.value))}
              className="w-20 px-2 py-1.5 rounded-lg text-sm text-center outline-none"
              style={{ background: 'var(--bg)', color: 'var(--ink)', border: '1px solid var(--line)' }}
            />
            <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>minutes</span>
            <Button variant="outline" size="sm" onClick={applyCustom}>Set Custom Timer</Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Session History" />
          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {sessions.slice().reverse().map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm p-2.5 rounded-lg" style={{ background: 'var(--bg)' }}>
                <span className="flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                  {s.type === 'focus' ? <Brain size={13} style={{ color: 'var(--blue)' }} /> : <Coffee size={13} style={{ color: 'var(--purple)' }} />}
                  {s.minutes} min {s.type}
                </span>
                <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{new Date(s.completedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
            {sessions.length === 0 && <p className="text-sm text-center py-6" style={{ color: 'var(--ink-soft)' }}>No sessions yet. Start your first one!</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
