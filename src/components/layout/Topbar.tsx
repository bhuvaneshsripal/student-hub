import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlobalSearch } from './GlobalSearch';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useSettingsStore } from '../../store/settingsStore';
import { NotificationsPanel } from './NotificationsPanel';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const profile = useSettingsStore((s) => s.profile);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close the notifications panel on outside click/tap so it never gets
  // stuck open and overlapping the rest of the UI on mobile.
  useEffect(() => {
    if (!notifOpen) return;
    function onOutside(e: MouseEvent | TouchEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('touchstart', onOutside);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('touchstart', onOutside);
    };
  }, [notifOpen]);

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 px-4 md:px-6 py-3 bg-mesh border-b no-print" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}>
      <button onClick={onMenuClick} className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg shrink-0" aria-label="Open menu">
        <Menu size={20} style={{ color: 'var(--ink)' }} />
      </button>
      <div className="flex-1 flex justify-center md:justify-start min-w-0">
        <GlobalSearch />
      </div>
      <div ref={wrapRef} className="flex items-center gap-2 sm:gap-3 relative shrink-0">
        <ThemeToggle />
        <button
          onClick={() => setNotifOpen((o) => !o)}
          aria-label="Notifications"
          className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06] shrink-0"
        >
          <Bell size={18} style={{ color: 'var(--ink)' }} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--danger)]" />
        </button>
        {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
        <Link
          to="/profile"
          aria-label="Go to profile"
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--blue)] to-[var(--purple)] flex items-center justify-center text-white font-display font-semibold text-sm shrink-0 overflow-hidden"
        >
          {profile.avatar ? (
            <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            profile.name.trim() ? profile.name.trim().split(' ').map((n) => n[0]).slice(0, 2).join('') : <User size={16} />
          )}
        </Link>
      </div>
    </header>
  );
}
