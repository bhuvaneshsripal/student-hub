import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CalendarClock, GraduationCap, ClipboardCheck, Rocket,
  StickyNote, ListTodo, Timer, Calendar, Settings, User, Search,
  ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import clsx from 'clsx';
import { LinkedinIcon, DEVELOPER_LINKEDIN_URL } from '../ui/LinkedinIcon';
import { useSettingsStore } from '../../store/settingsStore';

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
  { to: '/exam-finder', label: 'Exam Finder', icon: Search },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
  /** Icon-only mode with a toggle to expand — desktop only. Mobile's
   * drawer always renders the full labelled sidebar regardless of this
   * setting, since there's no width to save there. */
  collapsible?: boolean;
}

export function Sidebar({ onNavigate, collapsible = false }: SidebarProps) {
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useSettingsStore((s) => s.toggleSidebarCollapsed);
  const isCollapsed = collapsible && collapsed;

  return (
    <div className="relative flex flex-col h-full py-6 px-3">
      <button
        type="button"
        onClick={isCollapsed ? toggleCollapsed : undefined}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Studo'}
        title={isCollapsed ? 'Expand sidebar' : undefined}
        className={clsx(
          'flex items-center gap-2.5 mb-8 rounded-lg -mx-1 py-1',
          isCollapsed ? 'justify-center px-0 cursor-pointer' : 'px-3 cursor-default'
        )}
        style={{ background: 'transparent' }}
        onMouseEnter={(e) => { if (isCollapsed) e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <img src="/studo-logo.png" alt="Studo" className="w-10 h-10 rounded-xl shrink-0 object-cover" />
        {!isCollapsed && (
          <span className="font-brand text-2xl">
            Studo<span>.</span>
          </span>
        )}
      </button>
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            title={isCollapsed ? item.label : undefined}
            // Active page changes only the label/icon color to the accent
            // green — the row itself never gets a background fill, pill,
            // or shadow, in either theme.
            className={() => clsx(
              'sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors',
              isCollapsed && 'justify-center px-0'
            )}
            style={({ isActive }: any) => ({ color: isActive ? 'var(--blue)' : 'var(--sidebar-ink)' })}
          >
            <item.icon size={20} className="shrink-0" />
            {!isCollapsed && item.label}
          </NavLink>
        ))}
      </nav>

      <div className={clsx('pt-4 space-y-2 text-[11px]', isCollapsed ? 'px-0 flex flex-col items-center' : 'px-3')} style={{ color: 'var(--sidebar-ink-soft)' }}>
        {!isCollapsed && <div>Studo v1.0</div>}
        <a
          href={DEVELOPER_LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          title={isCollapsed ? 'Contact us' : undefined}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity w-fit"
          style={{ color: 'var(--sidebar-ink-soft)' }}
        >
          <LinkedinIcon size={13} color="#0A66C2" />
          {!isCollapsed && <span>Contact us</span>}
        </a>
      </div>

      {/* Small arrow toggle, anchored bottom-center — sized and colored
          for solid contrast against the sidebar surface at any screen
          size, so it's never missed. */}
      {collapsible && (
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="mt-3 mx-auto flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors shrink-0"
          style={{ borderColor: 'var(--blue)', color: 'var(--blue)', background: 'var(--sidebar-bg-elev)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--on-accent)'; e.currentTarget.style.background = 'var(--blue)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--blue)'; e.currentTarget.style.background = 'var(--sidebar-bg-elev)'; }}
        >
          {collapsed ? <ChevronsRight size={20} strokeWidth={2.5} /> : <ChevronsLeft size={20} strokeWidth={2.5} />}
        </button>
      )}
    </div>
  );
}
