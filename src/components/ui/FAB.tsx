import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CalendarPlus, ListTodo, StickyNote, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FAB() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { icon: CalendarPlus, label: 'Add class', to: '/timetable' },
    { icon: ListTodo, label: 'Add task', to: '/todo' },
    { icon: StickyNote, label: 'New note', to: '/notes' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 no-print flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && actions.map((a, i) => (
          <motion.button
            key={a.label}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => { navigate(a.to); setOpen(false); }}
            className="glass rounded-full pl-4 pr-2 py-2 flex items-center gap-2 text-sm font-medium shadow-lg"
            style={{ color: 'var(--ink)' }}
          >
            {a.label}
            <span className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--blue)] to-[var(--purple)] text-white">
              <a.icon size={15} />
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.92 }}
        animate={{ rotate: open ? 45 : 0 }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--blue)] to-[var(--purple)] text-white flex items-center justify-center shadow-xl shadow-[var(--purple)]/30"
      >
        {open ? <X size={22} /> : <Plus size={22} />}
      </motion.button>
    </div>
  );
}
