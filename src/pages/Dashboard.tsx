import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, Flame, BookOpen, TrendingUp, CalendarClock, ClipboardCheck,
  Rocket, ListChecks, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ProgressRing } from '../components/ui/ProgressRing';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useSettingsStore } from '../store/settingsStore';
import { useTimetableStore } from '../store/timetableStore';
import { useCgpaStore, overallCGPA } from '../store/cgpaStore';
import { useAttendanceStore, attendancePercent, SAFE_THRESHOLD } from '../store/attendanceStore';
import { useProductivityStore } from '../store/productivityStore';
import { usePlacementStore } from '../store/placementStore';
import { DAYS } from '../types';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const profile = useSettingsStore((s) => s.profile);
  const classes = useTimetableStore((s) => s.classes);
  const semesters = useCgpaStore((s) => s.semesters);
  const attendanceSubjects = useAttendanceStore((s) => s.subjects);
  const tasks = useProductivityStore((s) => s.tasks);
  const events = useProductivityStore((s) => s.events);
  const studyStreak = useProductivityStore((s) => s.studyStreak());
  const weeklyHours = useProductivityStore((s) => s.weeklyStudyHours());
  const readiness = usePlacementStore((s) => s.readinessScore());

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    const clock = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => { clearTimeout(t); clearInterval(clock); };
  }, []);

  const todayName = DAYS[(now.getDay() + 6) % 7] ?? null; // Sunday not in DAYS
  const todayClasses = classes.filter((c) => c.day === todayName).sort((a, b) => a.start.localeCompare(b.start));
  const cgpa = overallCGPA(semesters);
  const avgAttendance = attendanceSubjects.length
    ? attendanceSubjects.reduce((a, s) => a + attendancePercent(s), 0) / attendanceSubjects.length
    : 0;
  const pendingTasks = tasks.filter((t) => !t.done);
  const upcomingExams = events.filter((e) => e.type === 'exam').slice(0, 2);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold" style={{ color: 'var(--ink)' }}>
            {greeting()}, <span className="grad-text">{profile.name.split(' ')[0]}</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
            {now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl glass">
          <Flame size={16} style={{ color: 'var(--warning)' }} />
          <span style={{ color: 'var(--ink)' }}><b>{studyStreak}</b> day streak</span>
        </div>
      </motion.div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card delay={0.02}>
          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--ink-soft)' }}>
            <TrendingUp size={15} /><span className="text-xs font-medium">Current CGPA</span>
          </div>
          <p className="font-display text-3xl font-bold" style={{ color: 'var(--ink)' }}>{cgpa.toFixed(2)}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>out of 10.00</p>
        </Card>
        <Card delay={0.06}>
          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--ink-soft)' }}>
            <ClipboardCheck size={15} /><span className="text-xs font-medium">Attendance</span>
          </div>
          <p className="font-display text-3xl font-bold" style={{ color: avgAttendance >= SAFE_THRESHOLD ? 'var(--success)' : 'var(--danger)' }}>{avgAttendance.toFixed(0)}%</p>
          <ProgressBar value={avgAttendance} />
        </Card>
        <Card delay={0.1}>
          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--ink-soft)' }}>
            <BookOpen size={15} /><span className="text-xs font-medium">Weekly Study</span>
          </div>
          <p className="font-display text-3xl font-bold" style={{ color: 'var(--ink)' }}>{weeklyHours}h</p>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>this week</p>
        </Card>
        <Card delay={0.14}>
          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--ink-soft)' }}>
            <ListChecks size={15} /><span className="text-xs font-medium">Pending Tasks</span>
          </div>
          <p className="font-display text-3xl font-bold" style={{ color: 'var(--ink)' }}>{pendingTasks.length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{tasks.length - pendingTasks.length} completed</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timetable */}
        <Card className="lg:col-span-2" delay={0.05}>
          <CardHeader
            title="Today's Timetable"
            subtitle={todayName ? todayName : 'No classes on Sunday'}
            icon={<CalendarClock size={17} />}
            action={<Link to="/timetable" className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--blue)' }}>View all <ArrowRight size={12} /></Link>}
          />
          {todayClasses.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: 'var(--ink-soft)' }}>No classes scheduled today. Enjoy your day! 🎉</p>
          ) : (
            <div className="space-y-2">
              {todayClasses.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
                  <div className="w-1.5 h-10 rounded-full shrink-0" style={{ background: c.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{c.subject}</p>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{c.faculty} • {c.room}</p>
                  </div>
                  <div className="text-xs font-mono shrink-0" style={{ color: 'var(--ink-soft)' }}>{c.start}–{c.end}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Placement readiness */}
        <Card delay={0.08}>
          <CardHeader title="Placement Progress" icon={<Rocket size={17} />} />
          <div className="flex flex-col items-center gap-3">
            <ProgressRing value={readiness} label="Ready" />
            <Link to="/placement" className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--blue)' }}>
              View roadmap <ArrowRight size={12} />
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming exams / assignments */}
        <Card delay={0.1}>
          <CardHeader title="Upcoming Exams & Assignments" icon={<CalendarClock size={17} />} />
          {upcomingExams.length === 0 && pendingTasks.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--ink-soft)' }}>Nothing on the horizon.</p>
          ) : (
            <div className="space-y-2">
              {upcomingExams.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm p-2.5 rounded-lg" style={{ background: 'var(--bg)' }}>
                  <span style={{ color: 'var(--ink)' }}>{e.title}</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--warning)' }}>{e.date}</span>
                </div>
              ))}
              {pendingTasks.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm p-2.5 rounded-lg" style={{ background: 'var(--bg)' }}>
                  <span style={{ color: 'var(--ink)' }}>{t.title}</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--ink-soft)' }}>{t.dueDate ?? '—'}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick actions */}
        <Card delay={0.12}>
          <CardHeader title="Quick Actions" icon={<Clock size={17} />} />
          <div className="grid grid-cols-2 gap-2">
            {[
              { to: '/timetable', label: 'Add Class' },
              { to: '/todo', label: 'Add Task' },
              { to: '/notes', label: 'New Note' },
              { to: '/pomodoro', label: 'Start Focus' },
            ].map((a) => (
              <Link
                key={a.to} to={a.to}
                className="text-sm font-medium text-center py-3 rounded-xl border transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
              >
                {a.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
