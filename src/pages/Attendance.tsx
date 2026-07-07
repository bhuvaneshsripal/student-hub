import { useMemo, useState } from 'react';
import { Plus, Trash2, Check, X as XIcon, FileDown, Calculator } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
  useAttendanceStore, attendancePercent, classesNeededForSafe, classesCanMissSafe, attendanceStatus,
  classesNeededForThreshold, classesCanMissForThreshold, SAFE_THRESHOLD, semesterDayCounts,
} from '../store/attendanceStore';
import { CalendarRange } from 'lucide-react';
import { useToastStore } from '../store/toastStore';
import { useSettingsStore } from '../store/settingsStore';
import { useConfirm } from '../hooks/useConfirm';
import { exportAttendancePdf } from '../utils/pdf';

const STATUS_COLOR = { safe: 'var(--success)', warning: 'var(--warning)', danger: 'var(--danger)' };
const STATUS_LABEL = { safe: 'Safe', warning: 'Warning', danger: 'Danger' };

export default function Attendance() {
  const { subjects, addSubject, removeSubject, restoreSubject, markToday, semesterStart, semesterEnd, setSemesterDates } = useAttendanceStore();
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

  const barData = subjects.map((s) => ({ name: s.name.length > 10 ? s.name.slice(0, 10) + '…' : s.name, pct: Number(attendancePercent(s).toFixed(1)) }));

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

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Attendance Calculator</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Stay above {SAFE_THRESHOLD}% and know exactly where you stand.</p>
        </div>
        <div className="flex gap-2">
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
            <input
              type="date" value={semesterStart}
              onChange={(e) => setSemesterDates(e.target.value, semesterEnd)}
              className="calc-input"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-soft)' }}>Semester end date</span>
            <input
              type="date" value={semesterEnd}
              onChange={(e) => setSemesterDates(semesterStart, e.target.value)}
              className="calc-input"
            />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader title="Overall Attendance" />
          <p className="font-display text-4xl font-bold mb-2" style={{ color: overall >= SAFE_THRESHOLD ? 'var(--success)' : 'var(--danger)' }}>
            {overall.toFixed(1)}%
          </p>
          <ProgressBar value={overall} />
          {pieData.length > 0 && (
            <div className="mt-4">
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

        <Card className="lg:col-span-2">
          <CardHeader title="Subject-wise Attendance" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--ink-soft)' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--ink-soft)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="pct" radius={[8, 8, 0, 0]} fill="var(--blue)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((s) => {
          const pct = attendancePercent(s);
          const status = attendanceStatus(pct);
          return (
            <Card key={s.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--ink)' }}>{s.name}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>{s.attended} / {s.total} classes attended</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: `${STATUS_COLOR[status]}1A`, color: STATUS_COLOR[status] }}>
                    {STATUS_LABEL[status]}
                  </span>
                  <button
                    onClick={() => {
                      confirm({ title: 'Delete subject?', message: `"${s.name}" and its attendance record will be permanently deleted.` }, () => {
                        const deleted = s;
                        removeSubject(s.id);
                        push('Subject removed', 'info', { onUndo: () => restoreSubject(deleted) });
                      });
                    }}
                  >
                    <Trash2 size={14} style={{ color: 'var(--ink-soft)' }} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-display text-2xl font-bold" style={{ color: STATUS_COLOR[status] }}>{pct.toFixed(1)}%</span>
                <div className="flex-1"><ProgressBar value={pct} color={STATUS_COLOR[status]} /></div>
              </div>
              <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>
                {pct >= SAFE_THRESHOLD
                  ? `You can bunk ${classesCanMissSafe(s)} more class(es) and stay above ${SAFE_THRESHOLD}%.`
                  : `Attend ${classesNeededForSafe(s)} more class(es) in a row to reach ${SAFE_THRESHOLD}%.`}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" icon={<Check size={13} />} onClick={() => markToday(s.id, true)}>Mark Present</Button>
                <Button variant="outline" size="sm" icon={<XIcon size={13} />} onClick={() => markToday(s.id, false)}>Mark Absent</Button>
              </div>
            </Card>
          );
        })}
      </div>

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
