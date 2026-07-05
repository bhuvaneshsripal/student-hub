import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useProductivityStore } from '../store/productivityStore';
import { useToastStore } from '../store/toastStore';
import type { CalendarEvent } from '../types';

const TYPE_COLOR: Record<CalendarEvent['type'], string> = {
  exam: 'var(--danger)', assignment: 'var(--warning)', event: 'var(--blue)', holiday: 'var(--success)',
};

export default function CalendarPage() {
  const { events, addEvent, removeEvent } = useProductivityStore();
  const push = useToastStore((s) => s.push);
  const [cursor, setCursor] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', type: 'event' as CalendarEvent['type'] });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => { (map[e.date] ||= []).push(e); });
    return map;
  }, [events]);

  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, (): number | null => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function dateKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function submit() {
    if (!form.title.trim() || !form.date) { push('Title and date are required', 'error'); return; }
    addEvent(form.title, form.date, form.type);
    push('Event added', 'success');
    setForm({ title: '', date: '', type: 'event' });
    setModalOpen(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Calendar</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Exams, assignments, events, and holidays in one place.</p>
        </div>
        <Button size="sm" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>Add Event</Button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft size={18} style={{ color: 'var(--ink)' }} /></button>
          <h2 className="font-display font-semibold" style={{ color: 'var(--ink)' }}>{cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight size={18} style={{ color: 'var(--ink)' }} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const key = dateKey(day);
            const dayEvents = eventsByDate[key] || [];
            const isToday = key === new Date().toISOString().slice(0, 10);
            return (
              <div key={i} className="aspect-square rounded-lg p-1 flex flex-col" style={{ background: isToday ? 'rgba(79,109,245,0.12)' : 'var(--bg)', border: isToday ? '1px solid var(--blue)' : 'none' }}>
                <span className="text-[11px] font-medium" style={{ color: 'var(--ink)' }}>{day}</span>
                <div className="flex-1 flex flex-col gap-0.5 mt-0.5 overflow-hidden">
                  {dayEvents.slice(0, 2).map((e) => (
                    <span key={e.id} className="text-[9px] px-1 rounded truncate text-white" style={{ background: TYPE_COLOR[e.type] }}>{e.title}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader title="Upcoming" />
        <div className="space-y-2">
          {events.slice().sort((a, b) => a.date.localeCompare(b.date)).map((e) => (
            <div key={e.id} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--bg)' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: TYPE_COLOR[e.type] }} />
                <span className="text-sm" style={{ color: 'var(--ink)' }}>{e.title}</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded-full" style={{ background: `${TYPE_COLOR[e.type]}1A`, color: TYPE_COLOR[e.type] }}>{e.type}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono" style={{ color: 'var(--ink-soft)' }}>{e.date}</span>
                <button onClick={() => removeEvent(e.id)}><Trash2 size={14} style={{ color: 'var(--danger)' }} /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Event">
        <div className="space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" className="input" />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CalendarEvent['type'] })} className="input">
              <option value="exam">Exam</option>
              <option value="assignment">Assignment</option>
              <option value="event">Event</option>
              <option value="holiday">Holiday</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Add Event</Button>
          </div>
        </div>
        <style>{`.input { width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.75rem; border: 1px solid var(--line); background: var(--bg); color: var(--ink); font-size: 0.875rem; outline: none; }`}</style>
      </Modal>
    </div>
  );
}
