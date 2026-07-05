import { motion } from 'framer-motion';
import { AlertTriangle, CalendarClock, ListChecks, Rocket, X } from 'lucide-react';
import { useAttendanceStore, attendancePercent, SAFE_THRESHOLD } from '../../store/attendanceStore';
import { useProductivityStore } from '../../store/productivityStore';
import { usePlacementStore } from '../../store/placementStore';

export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const subjects = useAttendanceStore((s) => s.subjects);
  const events = useProductivityStore((s) => s.events);
  const tasks = useProductivityStore((s) => s.tasks);
  const readiness = usePlacementStore((s) => s.readinessScore());

  const lowAttendance = subjects.filter((s) => attendancePercent(s) < SAFE_THRESHOLD);
  const upcomingExams = events.filter((e) => e.type === 'exam');
  const dueSoonTasks = tasks.filter((t) => !t.done && t.dueDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-80 accent-solid rounded-2xl p-2 shadow-xl z-50 max-h-[70vh] overflow-y-auto"
      style={{ background: 'var(--accent-solid)' }}
    >
      <div className="flex items-center justify-between px-3 py-2 sticky top-0" style={{ background: 'var(--accent-solid)' }}>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-soft)' }}>Notifications</span>
        <button
          onClick={onClose}
          aria-label="Close notifications"
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
        >
          <X size={14} style={{ color: 'var(--ink-soft)' }} />
        </button>
      </div>
      {lowAttendance.map((s) => (
        <div key={s.id} className="flex gap-3 px-3 py-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--danger)' }} />
          <p className="text-sm" style={{ color: 'var(--ink)' }}>Attendance in <b>{s.name}</b> is at {attendancePercent(s).toFixed(0)}% — below {SAFE_THRESHOLD}%.</p>
        </div>
      ))}
      {upcomingExams.map((e) => (
        <div key={e.id} className="flex gap-3 px-3 py-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">
          <CalendarClock size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--warning)' }} />
          <p className="text-sm" style={{ color: 'var(--ink)' }}><b>{e.title}</b> on {e.date}</p>
        </div>
      ))}
      {dueSoonTasks.slice(0, 3).map((t) => (
        <div key={t.id} className="flex gap-3 px-3 py-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">
          <ListChecks size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--blue)' }} />
          <p className="text-sm" style={{ color: 'var(--ink)' }}>Task due: <b>{t.title}</b> ({t.dueDate})</p>
        </div>
      ))}
      <div className="flex gap-3 px-3 py-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">
        <Rocket size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--purple)' }} />
        <p className="text-sm" style={{ color: 'var(--ink)' }}>Placement readiness score: <b>{readiness}%</b></p>
      </div>
      {lowAttendance.length === 0 && upcomingExams.length === 0 && dueSoonTasks.length === 0 && (
        <p className="px-3 py-4 text-sm text-center" style={{ color: 'var(--ink-soft)' }}>You're all caught up 🎉</p>
      )}
    </motion.div>
  );
}
