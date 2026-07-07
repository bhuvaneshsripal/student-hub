import { useMemo, useState } from 'react';
import { Plus, Printer, FileDown, Pencil, Trash2, AlertTriangle, ClipboardPaste, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { SearchBox } from '../components/ui/SearchBox';
import { useTimetableStore } from '../store/timetableStore';
import { useSettingsStore } from '../store/settingsStore';
import { useToastStore } from '../store/toastStore';
import { useConfirm } from '../hooks/useConfirm';
import { DAYS, type ClassBlock, type Day } from '../types';
import { exportTimetablePdf } from '../utils/pdf';
import { parseMyCamuTimetable } from '../utils/mycamuParser';

const COLORS = ['#3B5BFF', '#8B3AFF', '#06B6D4', '#EC4899', '#10B981', '#FF9F1C', '#F04438'];

// Manual "Add Class" entries default to an 8–9 AM slot.
const emptyForm = { day: 'Monday' as Day, subject: '', faculty: '', room: '', start: '08:00', end: '09:00', color: COLORS[0] };

/** Deterministically map a subject name to one of the palette colors, so the
 * same subject always gets the same color whether it's pasted from MyCamu
 * multiple times or already exists elsewhere in the timetable. */
function colorForSubjectName(subject: string): string {
  const key = subject.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return COLORS[hash % COLORS.length];
}

export default function Timetable() {
  const { classes, addClass, updateClass, removeClass, restoreClass, hasConflict } = useTimetableStore();
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const push = useToastStore((s) => s.push);
  const { confirm, dialog } = useConfirm();

  const [dayFilter, setDayFilter] = useState<Day | 'All'>('All');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClassBlock | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [dragId, setDragId] = useState<string | null>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [importDay, setImportDay] = useState<Day>('Monday');
  const [importText, setImportText] = useState('');
  const [importPreview, setImportPreview] = useState<ReturnType<typeof parseMyCamuTimetable>>([]);

  const filtered = useMemo(() => {
    return classes.filter((c) => {
      const matchesDay = dayFilter === 'All' || c.day === dayFilter;
      const matchesQuery = !query || c.subject.toLowerCase().includes(query.toLowerCase()) || c.faculty.toLowerCase().includes(query.toLowerCase());
      return matchesDay && matchesQuery;
    });
  }, [classes, dayFilter, query]);

  function openAdd(day?: Day) {
    setEditing(null);
    setForm({ ...emptyForm, day: day ?? 'Monday' });
    setModalOpen(true);
  }

  function openEdit(c: ClassBlock) {
    setEditing(c);
    setForm({ day: c.day, subject: c.subject, faculty: c.faculty, room: c.room, start: c.start, end: c.end, color: c.color });
    setModalOpen(true);
  }

  function submit() {
    if (!form.subject.trim()) { push('Subject name is required', 'error'); return; }
    if (form.start >= form.end) { push('End time must be after start time', 'error'); return; }
    const conflict = hasConflict({ ...form, id: editing?.id });
    if (conflict) { push('This clashes with another class on the same day', 'error'); return; }
    if (editing) {
      updateClass(editing.id, form);
      push('Class updated', 'success');
    } else {
      addClass(form);
      push('Class added to timetable', 'success');
    }
    setModalOpen(false);
  }

  function openImport() {
    setImportText('');
    setImportPreview([]);
    setImportDay('Monday');
    setImportOpen(true);
  }

  function handleImportTextChange(text: string) {
    setImportText(text);
    setImportPreview(parseMyCamuTimetable(text));
  }

  async function confirmImport() {
    if (importPreview.length === 0) return;
    let added = 0;
    let skipped = 0;
    for (let i = 0; i < importPreview.length; i++) {
      const row = importPreview[i];
      const candidate = { day: importDay, subject: row.subject, faculty: row.faculty, room: '', start: row.start, end: row.end, color: colorForSubjectName(row.subject) };
      if (hasConflict(candidate)) {
        skipped++;
        continue;
      }
      await addClass(candidate);
      added++;
    }
    if (added > 0) push(`Imported ${added} class${added === 1 ? '' : 'es'} for ${importDay}${skipped ? ` (${skipped} skipped — clashing times)` : ''}`, 'success');
    else push('Nothing imported — all rows clashed with existing classes', 'error');
    setImportOpen(false);
  }

  function onDrop(day: Day) {
    if (!dragId) return;
    const c = classes.find((x) => x.id === dragId);
    if (!c) return;
    if (hasConflict({ ...c, day, id: c.id })) {
      push('Cannot move — conflicts with another class', 'error');
    } else {
      updateClass(dragId, { day });
      push(`Moved to ${day}`, 'success');
    }
    setDragId(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Timetable Planner</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Drag a class card to another day to reschedule it.</p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button variant="outline" size="sm" icon={<ClipboardPaste size={14} />} onClick={openImport}>Paste from MyCamu</Button>
          <Button variant="outline" size="sm" icon={<Printer size={14} />} onClick={() => window.print()}>Print</Button>
          <Button variant="outline" size="sm" icon={<FileDown size={14} />} onClick={() => exportTimetablePdf(classes, colorScheme)}>Export PDF</Button>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => openAdd()}>Add Class</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 no-print">
        <SearchBox value={query} onChange={setQuery} placeholder="Search subject or faculty..." />
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {(['All', ...DAYS] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDayFilter(d as any)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
              style={{
                background: dayFilter === d ? 'linear-gradient(90deg, var(--blue), var(--purple))' : 'var(--line)',
                color: dayFilter === d ? '#fff' : 'var(--ink)',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {DAYS.filter((d) => dayFilter === 'All' || dayFilter === d).map((day) => {
          const dayClasses = filtered.filter((c) => c.day === day).sort((a, b) => a.start.localeCompare(b.start));
          return (
            <div
              key={day}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(day)}
              className="rounded-2xl p-3 glass min-h-[140px]"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-semibold text-base" style={{ color: 'var(--ink)' }}>{day}</h3>
                <button onClick={() => openAdd(day)} className="no-print w-6 h-6 rounded-md flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/[0.08]">
                  <Plus size={13} style={{ color: 'var(--ink-soft)' }} />
                </button>
              </div>
              <div className="space-y-2">
                {dayClasses.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setDragId(c.id)}
                    className="rounded-xl p-2.5 cursor-grab active:cursor-grabbing group"
                    style={{ background: 'var(--bg)', borderLeft: `3px solid ${c.color}` }}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{c.subject}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--ink-soft)' }}>{c.faculty}</p>
                        <p className="text-xs font-mono" style={{ color: 'var(--ink-soft)' }}>{c.start}–{c.end} • {c.room}</p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0 no-print">
                        <button
                          onClick={() => openEdit(c)}
                          aria-label="Edit class"
                          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-black/[0.06] dark:hover:bg-white/[0.1]"
                        >
                          <Pencil size={12} style={{ color: 'var(--ink-soft)' }} />
                        </button>
                        <button
                          onClick={() => {
                            confirm({ title: 'Delete class?', message: `"${c.subject}" on ${c.day} will be permanently removed.` }, () => {
                              const deleted = c;
                              removeClass(c.id);
                              push('Class removed', 'info', { onUndo: () => restoreClass(deleted) });
                            });
                          }}
                          aria-label="Remove class"
                          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-black/[0.06] dark:hover:bg-white/[0.1]"
                        >
                          <Trash2 size={12} style={{ color: 'var(--danger)' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {dayClasses.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--ink-soft)' }}>No classes</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Class' : 'Add Class'}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Subject">
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input" />
            </Field>
            <Field label="Faculty">
              <input value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} className="input" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Classroom">
              <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="input" />
            </Field>
            <Field label="Day">
              <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value as Day })} className="input">
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Time">
              <input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="input" />
            </Field>
            <Field label="End Time">
              <input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className="input" />
            </Field>
          </div>
          <Field label="Color">
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c} onClick={() => setForm({ ...form, color: c })}
                  className="w-7 h-7 rounded-full border-2"
                  style={{ background: c, borderColor: form.color === c ? 'var(--ink)' : 'transparent' }}
                />
              ))}
            </div>
          </Field>
          {hasConflict({ ...form, id: editing?.id }) && (
            <div className="flex items-center gap-2 text-xs p-2 rounded-lg" style={{ background: 'rgba(240,68,56,0.1)', color: 'var(--danger)' }}>
              <AlertTriangle size={13} /> This timing clashes with another class on {form.day}.
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={submit}>{editing ? 'Save Changes' : 'Add Class'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Paste from MyCamu" width="max-w-2xl">
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
            Open your timetable on MyCamu, select and copy a day's schedule, then paste it below.
            Each class should look like two lines — subject, then time and faculty.
          </p>
          <Field label="Day this schedule belongs to">
            <select value={importDay} onChange={(e) => setImportDay(e.target.value as Day)} className="input">
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Pasted timetable text">
            <textarea
              value={importText}
              onChange={(e) => handleImportTextChange(e.target.value)}
              placeholder={'Object Oriented Programming using Java ( 19AI307 )\n8:00 AM - 9:00 AM ( 60 min ) Magitha Nirmala Tennyson'}
              rows={8}
              className="input font-mono text-xs"
            />
          </Field>

          {importText && (
            importPreview.length > 0 ? (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--line)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left" style={{ color: 'var(--ink-soft)', background: 'var(--bg)' }}>
                      <th className="px-3 py-2 font-medium">Subject</th>
                      <th className="px-3 py-2 font-medium">Time</th>
                      <th className="px-3 py-2 font-medium">Faculty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.map((row, i) => (
                      <tr key={i} className="border-t" style={{ borderColor: 'var(--line)' }}>
                        <td className="px-3 py-2" style={{ color: 'var(--ink)' }}>{row.subject}</td>
                        <td className="px-3 py-2 font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>{row.start}–{row.end}</td>
                        <td className="px-3 py-2" style={{ color: 'var(--ink-soft)' }}>{row.faculty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs p-2 rounded-lg" style={{ background: 'rgba(240,68,56,0.1)', color: 'var(--danger)' }}>
                <AlertTriangle size={13} /> Couldn't detect any classes in that text — check the format matches the example.
              </div>
            )
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button icon={<Check size={14} />} onClick={confirmImport} disabled={importPreview.length === 0}>
              Import {importPreview.length > 0 ? `${importPreview.length} class${importPreview.length === 1 ? '' : 'es'}` : ''}
            </Button>
          </div>
        </div>
      </Modal>

      <style>{`.input { width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.75rem; border: 1px solid var(--line); background: var(--bg); color: var(--ink); font-size: 0.875rem; outline: none; } .input:focus { border-color: var(--purple); }`}</style>

      {dialog}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-soft)' }}>{label}</span>
      {children}
    </label>
  );
}
