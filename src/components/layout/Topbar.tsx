import { useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useSettingsStore } from '../../store/settingsStore';
import { NotificationsPanel } from './NotificationsPanel';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const profile = useSettingsStore((s) => s.profile);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 py-3 glass no-print">
      <button onClick={onMenuClick} className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg">
        <Menu size={20} style={{ color: 'var(--ink)' }} />
      </button>
      <div className="flex-1 flex justify-center md:justify-start">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-3 relative">
        <ThemeToggle />
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        >
          <Bell size={18} style={{ color: 'var(--ink)' }} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--danger)]" />
        </button>
        {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--blue)] to-[var(--purple)] flex items-center justify-center text-white font-display font-semibold text-sm shrink-0">
          {profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </div>
      </div>
    </header>
  );
}
