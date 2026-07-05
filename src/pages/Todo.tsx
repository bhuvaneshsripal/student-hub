import { useMemo, useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useProductivityStore } from '../store/productivityStore';
import { useToastStore } from '../store/toastStore';
import type { Priority } from '../types';

const PRIORITY_COLOR: Record<Priority, string> = { high: 'var(--danger)', medium: 'var(--warning)', low: 'var(--success)' };

export default function Todo() {
  const { tasks, addTask, toggleTask, removeTask } = useProductivityStore();
  const push = useToastStore((s) => s.push);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  const [form, setForm] = useState({ title: '', dueDate: '', priority: 'medium' as Priority });

  const filtered = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'));
    if (filter === 'active') return sorted.filter((t) => !t.done);
    if (filter === 'done') return sorted.filter((t) => t.done);
    return sorted;
  }, [tasks, filter]);

  function submit() {
    if (!form.title.trim()) { push('Task title is required', 'error'); return; }
    addTask(form.title, form.dueDate || null, form.priority);
    push('Task added', 'success');
    setForm({ title: '', dueDate: '', priority: 'medium' });
    setModalOpen(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>To-Do List</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>{tasks.filter((t) => !t.done).length} tasks remaining</p>
        </div>
        <Button size="sm" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>Add Task</Button>
      </div>

      <div className="flex gap-1.5">
        {(['all', 'active', 'done'] as const).map((f) => (
          <button
            key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize"
            style={{ background: filter === f ? 'linear-gradient(90deg, var(--blue), var(--purple))' : 'var(--line)', color: filter === f ? '#fff' : 'var(--ink)' }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((t) => (
          <Card key={t.id} hover={false} className="flex items-center gap-3 py-3">
            <button
              onClick={() => toggleTask(t.id)}
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border"
              style={{ background: t.done ? 'linear-gradient(135deg, var(--blue), var(--purple))' : 'transparent', borderColor: t.done ? 'transparent' : 'var(--line)' }}
            >
              {t.done && <Check size={14} className="text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)', textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.55 : 1 }}>{t.title}</p>
              {t.dueDate && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Due {t.dueDate}</p>}
            </div>
            <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded-full shrink-0" style={{ background: `${PRIORITY_COLOR[t.priority]}1A`, color: PRIORITY_COLOR[t.priority] }}>
              {t.priority}
            </span>
            <button onClick={() => { removeTask(t.id); push('Task removed', 'info'); }}>
              <Trash2 size={15} style={{ color: 'var(--danger)' }} />
            </button>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-sm py-10" style={{ color: 'var(--ink-soft)' }}>Nothing here.</p>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Task">
        <div className="space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title" className="input" />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input" />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className="input">
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Add Task</Button>
          </div>
        </div>
        <style>{`.input { width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.75rem; border: 1px solid var(--line); background: var(--bg); color: var(--ink); font-size: 0.875rem; outline: none; }`}</style>
      </Modal>
    </div>
  );
}
