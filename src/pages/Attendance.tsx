import { useMemo, useState } from 'react';
import { Plus, FileDown, Calculator, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
  useAttendanceStore, attendancePercent, attendanceStatus,
  classesNeededForThreshold, classesCanMissForThreshold, SAFE_THRESHOLD, semesterDayCounts,
} from '../store/attendanceStore';
import { useTimetableStore } from '../store/timetableStore';
import { CalendarRange } from 'lucide-react';
import { useToastStore } from '../store/toastStore';
import { useSettingsStore } from '../store/settingsStore';
import { useConfirm } from '../hooks/useConfirm';
import { exportAttendancePdf } from '../utils/pdf';

export default function Attendance() {
  const { subjects, addSubject, semesterStart, semesterEnd, setSemesterDates, resetAll } = useAttendanceStore();
  const clearAttendanceLogs = useTimetableStore((s) => s.clearAttendanceLogs);
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const push = useToastStore((s) => s.push);
  const { confirm, dialog } = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', total: 0, attended: 0 });
  const [calc, setCalc] = useState({ total: 40, attended: 32, target: SAFE_THRESHOLD });
  const semDays = semesterDayCounts(semesterStart, semesterEnd);

  const overall = subjects.length ? subjects.reduce((a, s) => a + attendancePercent(s), 0) / subjects.length : 0;

  const calcPct = calc.total === 0 ? 0 : (calc.attended / calc.total) * 100;
  const calcSubject = { id: 'calc', name: 'calc', total: calc.total, attended: calc.attended };
  const calcCanBunk = classesCanMissForThreshold(calcSubject, calc.target);
  const calcNeeded = classesNeededForThreshold(calcSubject, calc.target);
  const calcSafe = calcPct >= calc.target;

  const pieData = useMemo(() => {
    const counts = { safe: 0, warning: 0, danger: 0 };
    subjects.forEach((s) => counts[attendanceStatus(attendancePercent(s))]++);
    return [
      { name: 'Safe', value: counts.safe, color: 'var(--success)' },
      { name: 'Warning', value: counts.warning, color: 'var(--warning)' },
      { name: 'Danger', value: counts.danger, color: 'var(--danger)' },
    ].filter((d) => d.value > 0);
  }, [subjects]);

  /** Shifts the semester start/end date by `deltaDays` — the previous/next
   * arrows next to each date field. */
  function shiftDate(which: 'start' | 'end', deltaDays: number) {
    const base = which === 'start' ? semesterStart : semesterEnd;
    if (!base) return;
    const d = new Date(base + 'T00:00:00');
    d.setDate(d.getDate() + deltaDays);
    const next = d.toISOString().slice(0, 10);
    if (which === 'start') setSemesterDates(next, semesterEnd);
    else setSemesterDates(semesterStart, next);
  }

  function submit() {
    if (!form.name.trim()) { push('Subject name is required', 'error'); return; }
    if (form.attended > form.total) { push('Attended cannot exceed total classes', 'error'); return; }
    addSubject(form.name, form.total, form.attended);
    push('Subject added', 'success');
    setForm({ name: '', total: 0, attended: 0 });
    setModalOpen(false);
  }

  function handleExportPdf() {
    if (!subjects.length) { push('Add at least one subject before exporting', 'error'); return; }
    exportAttendancePdf(subjects, colorScheme);
    push('Attendance PDF downloaded', 'success');
  }

  function handleResetAll() {
    confirm(
      {
        title: 'Reset all attendance data?',
        message: 'This clears every subject\'s present/attended counts and removes today\'s marks from the Dashboard and Timetable. This cannot be undone.',
      },
      async () => {
        await resetAll();
        await clearAttendanceLogs();
        push('Attendance reset to 0%', 'success');
      }
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Attendance Calculator</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Stay above {SAFE_THRESHOLD}% and know exactly where you stand.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<RotateCcw size={14} />} onClick={handleResetAll}>Reset</Button>
          <Button variant="outline" size="sm" icon={<FileDown size={14} />} onClick={handleExportPdf}>Export PDF</Button>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>Add Subject</Button>
        </div>
      </div>

      <Card>
        <CardHeader title="Semester Duration" icon={<CalendarRange size={16} />} color="blue" />
        <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>
          Set your semester's start and end date to track how many days are left.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <label className="block">
            <span className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-soft)' }}>Semester start date</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => shiftDate('start', -1)}
                aria-label="Previous day"
                title="Previous day"
                className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                style={{ border: '1px solid var(--line)' }}
              >
                <ChevronLeft size={14} style={{ color: 'var(--ink-soft)' }} />
              </button>
              <input
                type="date" value={semesterStart}
                onChange={(e) => setSemesterDates(e.target.value, semesterEnd)}
                className="calc-input"
              />
              <button
                onClick={() => shiftDate('start', 1)}
                aria-label="Next day"
                title="Next day"
                className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                style={{ border: '1px solid var(--line)' }}
              >
                <ChevronRight size={14} style={{ color: 'var(--ink-soft)' }} />
              </button>
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-soft)' }}>Semester end date</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => shiftDate('end', -1)}
                aria-label="Previous day"
                title="Previous day"
                className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                style={{ border: '1px solid var(--line)' }}
              >
                <ChevronLeft size={14} style={{ color: 'var(--ink-soft)' }} />
              </button>
              <input
                type="date" value={semesterEnd}
                onChange={(e) => setSemesterDates(semesterStart, e.target.value)}
                className="calc-input"
              />
              <button
                onClick={() => shiftDate('end', 1)}
                aria-label="Next day"
                title="Next day"
                className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                style={{ border: '1px solid var(--line)' }}
              >
                <ChevronRight size={14} style={{ color: 'var(--ink-soft)' }} />
              </button>
            </div>
          </label>
        </div>
        {semDays && (
          <div className="rounded-2xl p-4 flex flex-wrap gap-x-6 gap-y-2" style={{ background: 'var(--bg)', border: '1px solid var(--line)' }}>
            <p className="text-sm" style={{ color: 'var(--ink)' }}><b>{semDays.totalDays}</b> total days</p>
            <p className="text-sm" style={{ color: 'var(--ink)' }}><b>{semDays.workingDays}</b> working days (excl. Sundays)</p>
          </div>
        )}
        {semesterStart && semesterEnd && !semDays && (
          <p className="text-xs" style={{ color: 'var(--danger)' }}>End date must be on or after the start date.</p>
        )}
      </Card>

      <Card>
        <CardHeader title="Bunk Class Calculator" icon={<Calculator size={16} />} color="orange" />
        <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>
          Try any total / attended / target combination — no need to add a subject first.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <label className="block">
            <span className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-soft)' }}>Total classes held</span>
            <input
              type="number" min={0} value={calc.total}
              onChange={(e) => setCalc({ ...calc, total: Math.max(0, Number(e.target.value)) })}
              className="calc-input"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-soft)' }}>Classes attended</span>
            <input
              type="number" min={0} value={calc.attended}
              onChange={(e) => setCalc({ ...calc, attended: Math.max(0, Number(e.target.value)) })}
              className="calc-input"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-soft)' }}>Target attendance %</span>
            <input
              type="number" min={1} max={100} value={calc.target}
              onChange={(e) => setCalc({ ...calc, target: Math.min(100, Math.max(1, Number(e.target.value))) })}
              className="calc-input"
            />
          </label>
        </div>
        <div className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between" style={{ background: 'var(--bg)', border: '1px solid var(--line)' }}>
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl font-bold" style={{ color: calcSafe ? 'var(--success)' : 'var(--danger)' }}>
              {calc.total > 0 ? calcPct.toFixed(1) : '0.0'}%
            </span>
            <div className="w-32"><ProgressBar value={calcPct} color={calcSafe ? 'var(--success)' : 'var(--danger)'} /></div>
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
            {calc.total === 0
              ? 'Enter your class numbers above.'
              : calcSafe
                ? `You can bunk ${calcCanBunk} more class(es) and stay at or above ${calc.target}%.`
                : `Attend ${calcNeeded} more class(es) in a row to reach ${calc.target}%.`}
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader title="Overall Attendance" />
        <p className="font-display text-4xl font-bold mb-2" style={{ color: overall >= SAFE_THRESHOLD ? 'var(--success)' : 'var(--danger)' }}>
          {overall.toFixed(1)}%
        </p>
        <ProgressBar value={overall} />
        {pieData.length > 0 && (
          <div className="mt-4 max-w-xs">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={65} paddingAngle={3}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-3 mt-1 text-xs">
              {pieData.map((d) => (
                <span key={d.name} className="flex items-center gap-1" style={{ color: 'var(--ink-soft)' }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} /> {d.name} ({d.value})
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Subject">
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-soft)' }}>Subject Name</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-soft)' }}>Total Classes</span>
              <input type="number" min={0} value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} className="input" />
            </label>
            <label className="block">
              <span className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-soft)' }}>Classes Attended</span>
              <input type="number" min={0} value={form.attended} onChange={(e) => setForm({ ...form, attended: Number(e.target.value) })} className="input" />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Add Subject</Button>
          </div>
        </div>
        <style>{`.input { width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.75rem; border: 1px solid var(--line); background: var(--bg); color: var(--ink); font-size: 0.875rem; outline: none; }`}</style>
      </Modal>
      <style>{`.calc-input { width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.75rem; border: 1px solid var(--line); background: var(--bg-elev); color: var(--ink); font-size: 0.875rem; outline: none; } .calc-input:focus { border-color: var(--blue); }`}</style>

      {dialog}
    </div>
  );
}
