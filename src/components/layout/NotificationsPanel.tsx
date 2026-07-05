import { motion } from 'framer-motion';
import { AlertTriangle, CalendarClock, ListChecks, Rocket } from 'lucide-react';
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
      className="absolute right-0 top-12 w-80 glass rounded-2xl p-2 shadow-xl z-50 max-h-96 overflow-y-auto"
      onMouseLeave={onClose}
    >
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-soft)' }}>Notifications</div>
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
