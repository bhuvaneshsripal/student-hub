import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CalendarClock, GraduationCap, ClipboardCheck, Rocket,
  StickyNote, ListTodo, Timer, Calendar, Settings, User,
} from 'lucide-react';
import clsx from 'clsx';

function LinkedinIcon({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/timetable', label: 'Timetable', icon: CalendarClock },
  { to: '/cgpa', label: 'CGPA Calculator', icon: GraduationCap },
  { to: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { to: '/placement', label: 'Placement Prep', icon: Rocket },
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/todo', label: 'To-Do', icon: ListTodo },
  { to: '/pomodoro', label: 'Pomodoro', icon: Timer },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col h-full py-6 px-4">
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <img src="/studo-logo.png" alt="Studo" className="w-9 h-9 rounded-xl shrink-0 object-cover" />
        <span className="font-display font-bold text-lg brand-text">Studo</span>
      </div>
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              isActive
                ? 'bg-gradient-to-r from-[var(--blue)] to-[var(--purple)] text-[#171200] shadow-md shadow-[var(--blue)]/20'
                : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
            )}
            style={({ isActive }: any) => ({ color: isActive ? '#171200' : 'var(--ink)' })}
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pt-4 space-y-2 text-[11px]" style={{ color: 'var(--ink-soft)' }}>
        <div>Studo v1.0</div>
        <a
          href="https://www.linkedin.com/in/bhuvaneshs07"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity w-fit"
          style={{ color: 'var(--ink-soft)' }}
        >
          <LinkedinIcon size={13} color="#0A66C2" />
          <span>Contact us</span>
        </a>
      </div>
    </div>
  );
}
