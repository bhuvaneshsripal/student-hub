import { useMemo, useState } from 'react';
import { Plus, Search, Trash2, Tag } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useProductivityStore } from '../store/productivityStore';
import { useToastStore } from '../store/toastStore';

export default function Notes() {
  const { notes, addNote, updateNote, removeNote } = useProductivityStore();
  const push = useToastStore((s) => s.push);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', tags: '' });

  const filtered = useMemo(() => {
    if (!query.trim()) return notes;
    const q = query.toLowerCase();
    return notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some((t) => t.includes(q)));
  }, [notes, query]);

  function openNew() {
    setEditingId(null);
    setForm({ title: '', content: '', tags: '' });
    setModalOpen(true);
  }

  function openEdit(id: string) {
    const n = notes.find((x) => x.id === id);
    if (!n) return;
    setEditingId(id);
    setForm({ title: n.title, content: n.content, tags: n.tags.join(', ') });
    setModalOpen(true);
  }

  function submit() {
    if (!form.title.trim()) { push('Title is required', 'error'); return; }
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (editingId) {
      updateNote(editingId, { title: form.title, content: form.content, tags });
      push('Note updated', 'success');
    } else {
      addNote(form.title, form.content, tags);
      push('Note created', 'success');
    }
    setModalOpen(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Notes</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Capture lecture notes and revision points.</p>
        </div>
        <Button size="sm" icon={<Plus size={14} />} onClick={openNew}>New Note</Button>
      </div>

      <div className="flex items-center gap-2 rounded-xl px-3 py-2 glass max-w-sm">
        <Search size={15} style={{ color: 'var(--ink-soft)' }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes..." className="bg-transparent outline-none text-sm w-full" style={{ color: 'var(--ink)' }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((n) => (
          <Card key={n.id} className="cursor-pointer" >
            <div onClick={() => openEdit(n.id)}>
              <h3 className="font-display font-semibold text-sm mb-1.5" style={{ color: 'var(--ink)' }}>{n.title}</h3>
              <p className="text-xs line-clamp-4" style={{ color: 'var(--ink-soft)' }}>{n.content}</p>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex flex-wrap gap-1.5">
                {n.tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg)', color: 'var(--ink-soft)' }}>
                    <Tag size={9} />{t}
                  </span>
                ))}
              </div>
              <button onClick={(e) => { e.stopPropagation(); removeNote(n.id); push('Note deleted', 'info'); }}>
                <Trash2 size={14} style={{ color: 'var(--danger)' }} />
              </button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-sm py-10" style={{ color: 'var(--ink-soft)' }}>No notes found. Create one!</p>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Note' : 'New Note'} width="max-w-xl">
        <div className="space-y-3">
          <input
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title" className="input font-medium"
          />
          <textarea
            value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Write your note..." rows={8} className="input resize-none"
          />
          <input
            value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="Tags (comma separated)" className="input"
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={submit}>{editingId ? 'Save Changes' : 'Create Note'}</Button>
          </div>
        </div>
        <style>{`.input { width: 100%; padding: 0.6rem 0.85rem; border-radius: 0.75rem; border: 1px solid var(--line); background: var(--bg); color: var(--ink); font-size: 0.875rem; outline: none; }`}</style>
      </Modal>
    </div>
  );
}
