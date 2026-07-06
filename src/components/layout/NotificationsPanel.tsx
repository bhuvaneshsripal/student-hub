import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CalendarClock, ListChecks, Rocket, Volume2, VolumeX, X } from 'lucide-react';
import { useAttendanceStore, attendancePercent, SAFE_THRESHOLD } from '../../store/attendanceStore';
import { useProductivityStore } from '../../store/productivityStore';
import { usePlacementStore } from '../../store/placementStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useNotificationUiStore } from '../../store/notificationStore';

export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const subjects = useAttendanceStore((s) => s.subjects);
  const events = useProductivityStore((s) => s.events);
  const tasks = useProductivityStore((s) => s.tasks);
  const readiness = usePlacementStore((s) => s.readinessScore());
  const notificationSound = useSettingsStore((s) => s.notificationSound);
  const toggleNotificationSound = useSettingsStore((s) => s.toggleNotificationSound);
  const { dismissedIds, clearAll } = useNotificationUiStore();

  const lowAttendance = subjects.filter((s) => attendancePercent(s) < SAFE_THRESHOLD && !dismissedIds.includes(`att-${s.id}`));
  const upcomingExams = events.filter((e) => e.type === 'exam' && !dismissedIds.includes(`exam-${e.id}`));
  const dueSoonTasks = tasks.filter((t) => !t.done && t.dueDate && !dismissedIds.includes(`task-${t.id}`)).slice(0, 3);
  const showReadiness = !dismissedIds.includes('readiness');

  const allIds = [
    ...subjects.filter((s) => attendancePercent(s) < SAFE_THRESHOLD).map((s) => `att-${s.id}`),
    ...events.filter((e) => e.type === 'exam').map((e) => `exam-${e.id}`),
    ...tasks.filter((t) => !t.done && t.dueDate).map((t) => `task-${t.id}`),
    'readiness',
  ];

  const isEmpty = lowAttendance.length === 0 && upcomingExams.length === 0 && dueSoonTasks.length === 0 && !showReadiness;

  function go(path: string) {
    navigate(path);
    onClose();
  }

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
        <div className="flex items-center gap-1">
          <button
            onClick={toggleNotificationSound}
            aria-label={notificationSound ? 'Mute notification sound' : 'Unmute notification sound'}
            title={notificationSound ? 'Sound on' : 'Sound off'}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
          >
            {notificationSound ? <Volume2 size={14} style={{ color: 'var(--ink-soft)' }} /> : <VolumeX size={14} style={{ color: 'var(--ink-soft)' }} />}
          </button>
          <button
            onClick={onClose}
            aria-label="Close notifications"
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
          >
            <X size={14} style={{ color: 'var(--ink-soft)' }} />
          </button>
        </div>
      </div>

      {!isEmpty && (
        <div className="flex justify-end px-3 pb-1">
          <button
            onClick={() => clearAll(allIds)}
            className="text-xs font-medium"
            style={{ color: 'var(--blue)' }}
          >
            Clear all
          </button>
        </div>
      )}

      {lowAttendance.map((s) => (
        <button
          key={s.id}
          onClick={() => go('/attendance')}
          className="w-full flex gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--danger)' }} />
          <p className="text-sm" style={{ color: 'var(--ink)' }}>Attendance in <b>{s.name}</b> is at {attendancePercent(s).toFixed(0)}% — below {SAFE_THRESHOLD}%.</p>
        </button>
      ))}
      {upcomingExams.map((e) => (
        <button
          key={e.id}
          onClick={() => go('/calendar')}
          className="w-full flex gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        >
          <CalendarClock size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--warning)' }} />
          <p className="text-sm" style={{ color: 'var(--ink)' }}><b>{e.title}</b> on {e.date}</p>
        </button>
      ))}
      {dueSoonTasks.map((t) => (
        <button
          key={t.id}
          onClick={() => go('/todo')}
          className="w-full flex gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        >
          <ListChecks size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--blue)' }} />
          <p className="text-sm" style={{ color: 'var(--ink)' }}>Task due: <b>{t.title}</b> ({t.dueDate})</p>
        </button>
      ))}
      {showReadiness && (
        <button
          onClick={() => go('/placement')}
          className="w-full flex gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        >
          <Rocket size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--purple)' }} />
          <p className="text-sm" style={{ color: 'var(--ink)' }}>Placement readiness score: <b>{readiness}%</b></p>
        </button>
      )}
      {isEmpty && (
        <p className="px-3 py-4 text-sm text-center" style={{ color: 'var(--ink-soft)' }}>You're all caught up 🎉</p>
      )}
    </motion.div>
  );
}
