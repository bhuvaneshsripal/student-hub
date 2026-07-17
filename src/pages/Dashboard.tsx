import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Flame, BookOpen, TrendingUp, CalendarClock, ClipboardCheck,
  Rocket, ListChecks, ArrowRight, Pencil, Check, ChevronLeft, ChevronRight, X as XIcon,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ProgressRing } from '../components/ui/ProgressRing';
import { useSettingsStore } from '../store/settingsStore';
import { useTimetableStore } from '../store/timetableStore';
import { useCgpaStore, overallCGPA } from '../store/cgpaStore';
import { useAttendanceStore, attendancePercent, SAFE_THRESHOLD } from '../store/attendanceStore';
import { useProductivityStore } from '../store/productivityStore';
import { usePlacementStore } from '../store/placementStore';
import { useToastStore } from '../store/toastStore';
import { useScrollDirection } from '../hooks/useScrollDirection';
import { DAYS, type ClassBlock } from '../types';
import { colorForSubjectName } from '../utils/subjectColor';

/** Date as "YYYY-MM-DD", used as the key into each class's attendanceLog. */
function toIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function addMonths(d: Date, n: number) {
  const copy = new Date(d);
  copy.setMonth(copy.getMonth() + n);
  return copy;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const profile = useSettingsStore((s) => s.profile);
  const updateProfile = useSettingsStore((s) => s.updateProfile);
  const classes = useTimetableStore((s) => s.classes);
  const updateClass = useTimetableStore((s) => s.updateClass);
  const semesters = useCgpaStore((s) => s.semesters);
  const attendanceSubjects = useAttendanceStore((s) => s.subjects);
  const markClassOccurrence = useAttendanceStore((s) => s.markClassOccurrence);
  const tasks = useProductivityStore((s) => s.tasks);
  const events = useProductivityStore((s) => s.events);
  const pomodoroSessions = useProductivityStore((s) => s.pomodoroSessions);
  const studyStreak = useProductivityStore((s) => s.studyStreak());
  const weeklyHours = useProductivityStore((s) => s.weeklyStudyHours());
  const readiness = usePlacementStore((s) => s.readinessScore());
  const syncAttendance = useAttendanceStore((s) => s.sync);
  const syncPlacement = usePlacementStore((s) => s.sync);
  const push = useToastStore((s) => s.push);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const syncNotes = useProductivityStore((s) => s.syncNotes);
  const syncTasks = useProductivityStore((s) => s.syncTasks);
  const syncPomodoro = useProductivityStore((s) => s.syncPomodoro);
  const syncCalendar = useProductivityStore((s) => s.syncCalendar);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  function startEditName() {
    setNameDraft(profile.name.trim());
    setEditingName(true);
  }

  function saveName() {
    updateProfile({ name: nameDraft.trim() });
    setEditingName(false);
  }

  /** Merges consecutive classes for the same subject/faculty/room whose
   * times butt up against each other (e.g. 8–9 and 9–10) into a single row
   * like 8–10, mirroring the Timetable page's 2h view. */
  function buildBlocks(list: ClassBlock[]) {
    const blocks: { ids: string[]; classes: ClassBlock[]; subject: string; faculty: string; room: string; start: string; end: string }[] = [];
    for (const c of list) {
      const last = blocks[blocks.length - 1];
      if (last && last.end === c.start && last.subject === c.subject && last.faculty === c.faculty && last.room === c.room) {
        last.end = c.end;
        last.ids.push(c.id);
        last.classes.push(c);
      } else {
        blocks.push({ ids: [c.id], classes: [c], subject: c.subject, faculty: c.faculty, room: c.room, start: c.start, end: c.end });
      }
    }
    return blocks;
  }

  /** Marks (or un-marks, if the same state is tapped again) every underlying
   * period in a block present/absent for the currently viewed date and syncs
   * the change to the Attendance page's overall percentage automatically. */
  function markBlock(block: { classes: ClassBlock[]; subject: string }, present: boolean) {
    const dateIso = toIso(selectedDate);
    let totalDelta = 0;
    let attendedDelta = 0;
    let unmarked = false;

    block.classes.forEach((c) => {
      const prev = c.attendanceLog?.[dateIso];
      const nextLog = { ...(c.attendanceLog || {}) };

      if (prev === (present ? 'present' : 'absent')) {
        delete nextLog[dateIso];
        totalDelta -= 1;
        if (prev === 'present') attendedDelta -= 1;
        unmarked = true;
      } else if (prev) {
        nextLog[dateIso] = present ? 'present' : 'absent';
        attendedDelta += present ? 1 : -1;
      } else {
        nextLog[dateIso] = present ? 'present' : 'absent';
        totalDelta += 1;
        if (present) attendedDelta += 1;
      }

      updateClass(c.id, { attendanceLog: nextLog });
    });

    markClassOccurrence(block.subject, totalDelta, attendedDelta);
    push(unmarked ? `Unmarked ${block.subject}` : `Marked ${block.subject} ${present ? 'present' : 'absent'} — attendance updated`, 'success');
  }

  useEffect(() => {
    syncAttendance();
    syncPlacement();

    syncNotes();
    syncTasks();
    syncPomodoro();
    syncCalendar();

    const clock = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => {
      clearInterval(clock);
    };
  }, []);

  const todayName = DAYS[(now.getDay() + 6) % 7] ?? null; // Sunday not in DAYS
  const todayClasses = classes.filter((c) => c.day === todayName).sort((a, b) => a.start.localeCompare(b.start));

  const selectedDayName = DAYS[(selectedDate.getDay() + 6) % 7] ?? null; // Sunday not in DAYS
  const selectedClasses = classes.filter((c) => c.day === selectedDayName).sort((a, b) => a.start.localeCompare(b.start));
  const selectedBlocks = buildBlocks(selectedClasses);
  const dateStrip = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i - 3));

  const cgpa = overallCGPA(semesters);
  const avgAttendance = attendanceSubjects.length
    ? attendanceSubjects.reduce((a, s) => a + attendancePercent(s), 0) / attendanceSubjects.length
    : 0;
  const pendingTasks = tasks.filter((t) => !t.done);
  const upcomingExams = events.filter((e) => e.type === 'exam').slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2 flex-wrap" style={{ color: 'var(--ink)' }}>
            <span>{greeting()},</span>
            {editingName ? (
              <span className="inline-flex items-center gap-1.5">
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                  placeholder="Your name"
                  className="font-display text-2xl md:text-3xl font-bold bg-transparent outline-none border-none max-w-[10ch] sm:max-w-[16ch]"
                  style={{ color: 'var(--ink)' }}
                />
                <button
                  onClick={saveName}
                  aria-label="Save name"
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--accent-solid)', color: 'var(--purple)' }}
                >
                  <Check size={14} />
                </button>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span className="grad-text">{profile.name.trim() ? profile.name.trim().split(' ')[0] : 'Student'}</span>
                <button
                  onClick={startEditName}
                  aria-label="Edit name"
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  style={{ color: 'var(--ink-soft)' }}
                >
                  <Pencil size={13} />
                </button>
              </span>
            )}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
            {now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl glass">
          <Flame size={16} style={{ color: 'var(--warning)' }} />
          <span style={{ color: 'var(--ink)' }}><b>{studyStreak}</b> day streak</span>
        </div>
      </motion.div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card delay={0.02} onClick={() => navigate('/cgpa')} className="cursor-pointer">
          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--ink-soft)' }}>
            <TrendingUp size={15} /><span className="text-xs font-medium">Current CGPA</span>
          </div>
          <p className="font-display text-3xl font-bold" style={{ color: 'var(--ink)' }}>{semesters.length === 0 ? '-' : cgpa.toFixed(2)}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>out of 10.00</p>
        </Card>
        <Card delay={0.06} onClick={() => navigate('/attendance')} className="cursor-pointer">
          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--ink-soft)' }}>
            <ClipboardCheck size={15} /><span className="text-xs font-medium">Attendance</span>
          </div>
          <p className="font-display text-3xl font-bold" style={{ color: attendanceSubjects.length === 0 ? 'var(--ink)' : (avgAttendance >= SAFE_THRESHOLD ? 'var(--success)' : 'var(--danger)') }}>{attendanceSubjects.length === 0 ? '-' : `${avgAttendance.toFixed(0)}%`}</p>
          <ProgressBar value={avgAttendance} />
        </Card>
        <Card delay={0.1} onClick={() => navigate('/pomodoro')} className="cursor-pointer">
          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--ink-soft)' }}>
            <BookOpen size={15} /><span className="text-xs font-medium">Weekly Study</span>
          </div>
          <p className="font-display text-3xl font-bold" style={{ color: 'var(--ink)' }}>{pomodoroSessions.length === 0 ? '-' : `${weeklyHours}h`}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>this week</p>
        </Card>
        <Card delay={0.14} onClick={() => navigate('/todo')} className="cursor-pointer">
          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--ink-soft)' }}>
            <ListChecks size={15} /><span className="text-xs font-medium">Pending Tasks</span>
          </div>
          <p className="font-display text-3xl font-bold" style={{ color: 'var(--ink)' }}>{tasks.length === 0 ? '-' : pendingTasks.length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{tasks.length === 0 ? 'no tasks yet' : `${tasks.length - pendingTasks.length} completed`}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timetable */}
        <Card className="lg:col-span-2" delay={0.05}>
          <CardHeader
            title="Timetable"
            subtitle={selectedDayName ? selectedDayName : 'No classes on Sunday'}
            icon={<CalendarClock size={17} />}
            color="blue"
            action={<Link to="/timetable" className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--blue)' }}>View all <ArrowRight size={12} /></Link>}
          />

          {/* Month/year navigation — jumps by calendar month */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setSelectedDate((d) => addMonths(d, -1))}
              aria-label="Previous month"
              title="Previous month"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            >
              <ChevronLeft size={16} style={{ color: 'var(--ink-soft)' }} />
            </button>
            <p className="font-display text-sm font-bold tracking-wide" style={{ color: 'var(--ink)' }}>
              {selectedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }).toUpperCase()}
            </p>
            <button
              onClick={() => setSelectedDate((d) => addMonths(d, 1))}
              aria-label="Next month"
              title="Next month"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            >
              <ChevronRight size={16} style={{ color: 'var(--ink-soft)' }} />
            </button>
          </div>

          {/* Date strip — separate prev/next day arrows */}
          <div className="flex items-center gap-1 mb-4">
            <button
              onClick={() => setSelectedDate((d) => addDays(d, -1))}
              aria-label="Previous day"
              title="Previous day"
              className="w-6 h-6 shrink-0 rounded-lg flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            >
              <ChevronLeft size={14} style={{ color: 'var(--ink-soft)' }} />
            </button>
            <div className="grid grid-cols-7 gap-1 flex-1">
              {dateStrip.map((d) => {
                const selected = sameDay(d, selectedDate);
                const isToday = sameDay(d, now);
                return (
                  <button
                    key={toIso(d)}
                    onClick={() => setSelectedDate(d)}
                    className="flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors"
                  >
                    <span className="text-[10px] font-medium uppercase" style={{ color: selected ? 'var(--blue)' : 'var(--ink-soft)' }}>
                      {d.toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                    <span
                      className={selected ? 'text-sm font-bold grad-text' : 'text-sm font-bold'}
                      style={{ color: selected ? undefined : (isToday ? 'var(--blue)' : 'var(--ink)') }}
                    >
                      {d.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setSelectedDate((d) => addDays(d, 1))}
              aria-label="Next day"
              title="Next day"
              className="w-6 h-6 shrink-0 rounded-lg flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            >
              <ChevronRight size={14} style={{ color: 'var(--ink-soft)' }} />
            </button>
          </div>

          {selectedBlocks.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: 'var(--ink-soft)' }}>No classes scheduled. Enjoy the day! 🎉</p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
              {selectedBlocks.map((b) => {
                const dateIso = toIso(selectedDate);
                const markedPresent = b.classes.every((c) => c.attendanceLog?.[dateIso] === 'present');
                const markedAbsent = b.classes.every((c) => c.attendanceLog?.[dateIso] === 'absent');
                return (
                  <div key={b.ids.join('-')} className="flex items-center gap-3 py-3" style={{ borderColor: 'var(--line)' }}>
                    <div className="w-1.5 h-10 rounded-full shrink-0" style={{ background: colorForSubjectName(b.subject) }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{b.subject}</p>
                      <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{b.faculty} • {b.room}</p>
                      <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--ink-soft)' }}>{b.start}–{b.end}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => markBlock(b, true)}
                        aria-pressed={markedPresent}
                        title="Mark present"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                        style={{
                          background: markedPresent ? 'var(--success)' : 'rgba(23,178,106,0.12)',
                          color: markedPresent ? '#fff' : 'var(--success)',
                        }}
                      >
                        <Check size={11} /> Present
                      </button>
                      <button
                        onClick={() => markBlock(b, false)}
                        aria-pressed={markedAbsent}
                        title="Mark absent"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                        style={{
                          background: markedAbsent ? 'var(--danger)' : 'rgba(240,68,56,0.12)',
                          color: markedAbsent ? '#fff' : 'var(--danger)',
                        }}
                      >
                        <XIcon size={11} /> Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Placement readiness */}
        <Card delay={0.08} className="cursor-pointer" onClick={() => navigate('/placement')}>
          <CardHeader title="Placement Progress" icon={<Rocket size={17} />} color="purple" />
          <div className="flex flex-col items-center gap-3">
            <ProgressRing value={readiness} label="Ready" />
            <Link to="/placement" onClick={(e) => e.stopPropagation()} className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--blue)' }}>
              View roadmap <ArrowRight size={12} />
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming exams / assignments */}
        <Card delay={0.1} className="cursor-pointer" onClick={() => navigate('/calendar')}>
          <CardHeader title="Upcoming Exams & Assignments" icon={<CalendarClock size={17} />} color="orange" />
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
          <CardHeader title="Quick Actions" icon={<Clock size={17} />} color="teal" />
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

      <ScrollInfoPopup todayClasses={todayClasses} now={now} />
    </div>
  );
}

/** Small floating tip that appears while you scroll down the dashboard and
 * hides again as soon as you scroll back up (or reach the top) — a quick
 * glance at your next class without needing to keep the Timetable card in
 * view. */
function ScrollInfoPopup({ todayClasses, now }: { todayClasses: ClassBlock[]; now: Date }) {
  const direction = useScrollDirection();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const next = todayClasses.find((c) => {
    const [h, m] = c.start.split(':').map(Number);
    return h * 60 + m >= nowMinutes;
  });

  if (!next) return null;

  return (
    <AnimatePresence>
      {direction === 'down' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-40 glass-solid rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl max-w-[92vw]"
        >
          <CalendarClock size={16} style={{ color: 'var(--blue)' }} className="shrink-0" />
          <p className="text-sm truncate" style={{ color: 'var(--ink)' }}>
            Up next: <b>{next.subject}</b> at {next.start}{next.room ? ` · ${next.room}` : ''}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
