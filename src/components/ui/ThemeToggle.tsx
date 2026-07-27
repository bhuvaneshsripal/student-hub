import { Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export function ThemeToggle() {
  const { theme, toggleTheme } = useSettingsStore();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
      style={{ color: 'var(--ink)' }}
    >
      {isDark ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}
