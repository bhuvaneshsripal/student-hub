import { useMemo, useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTimetableStore } from '../../store/timetableStore';
import { useProductivityStore } from '../../store/productivityStore';
import { usePlacementStore } from '../../store/placementStore';

interface Result {
  id: string;
  label: string;
  section: string;
  to: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const classes = useTimetableStore((s) => s.classes);
  const notes = useProductivityStore((s) => s.notes);
  const tasks = useProductivityStore((s) => s.tasks);
  const aptitude = usePlacementStore((s) => s.aptitude);
  const languages = usePlacementStore((s) => s.languages);
  const dsa = usePlacementStore((s) => s.dsa);
  const webdev = usePlacementStore((s) => s.webdev);
  const interview = usePlacementStore((s) => s.interview);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setExpanded((wasExpanded) => (query.trim() ? wasExpanded : false));
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [query]);

  function openSearch() {
    setExpanded(true);
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function closeSearch() {
    setQuery('');
    setOpen(false);
    setExpanded(false);
  }

  const results: Result[] = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const out: Result[] = [];
    classes.forEach((c) => {
      if (c.subject.toLowerCase().includes(q) || c.faculty.toLowerCase().includes(q)) {
        out.push({ id: c.id, label: `${c.subject} — ${c.day} ${c.start}`, section: 'Timetable', to: '/timetable' });
      }
    });
    notes.forEach((n) => {
      if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
        out.push({ id: n.id, label: n.title, section: 'Notes', to: '/notes' });
      }
    });
    tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q)) {
        out.push({ id: t.id, label: t.title, section: 'Tasks', to: '/todo' });
      }
    });
    const topicGroups = [aptitude, languages, dsa, webdev, interview];
    topicGroups.flat().forEach((t) => {
      if (t.name.toLowerCase().includes(q)) {
        out.push({ id: t.id, label: t.name, section: 'Placement', to: '/placement' });
      }
    });
    return out.slice(0, 8);
  }, [query, classes, notes, tasks, aptitude, languages, dsa, webdev, interview]);

  if (!expanded) {
    return (
      <div ref={ref}>
        <button
          onClick={openSearch}
          aria-label="Open search"
          className="w-9 h-9 rounded-xl flex items-center justify-center search-bar"
        >
          <Search size={16} style={{ color: 'var(--ink-soft)' }} />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative w-full max-w-sm">
      <div className="flex items-center gap-2 rounded-xl px-3 py-2 search-bar">
        <Search size={16} style={{ color: 'var(--ink-soft)' }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === 'Escape') closeSearch(); }}
          placeholder="Search timetable, notes, tasks..."
          className="bg-transparent outline-none text-sm w-full"
          style={{ color: 'var(--ink)' }}
        />
        <button onClick={closeSearch} aria-label="Close search">
          <X size={14} style={{ color: 'var(--ink-soft)' }} />
        </button>
      </div>
      {open && results.length > 0 && (
        <div className="absolute mt-2 w-full glass-solid rounded-xl overflow-hidden z-50 shadow-xl" style={{ background: 'var(--glass-solid)' }}>
          {results.map((r) => (
            <button
              key={r.section + r.id}
              onClick={() => { navigate(r.to); setOpen(false); setQuery(''); }}
              className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              style={{ color: 'var(--ink)' }}
            >
              <span className="truncate">{r.label}</span>
              <span className="text-[10px] uppercase tracking-wide ml-2 shrink-0" style={{ color: 'var(--ink-soft)' }}>{r.section}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
