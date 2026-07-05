import { Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export function ThemeToggle() {
  const { theme, toggleTheme } = useSettingsStore();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="relative w-14 h-8 rounded-full flex items-center px-1 transition-colors border"
      style={{
        background: isDark ? 'linear-gradient(90deg, var(--blue), var(--purple))' : 'var(--accent-solid)',
        borderColor: isDark ? 'transparent' : 'var(--accent-solid-border)',
      }}
    >
      <div
        className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300"
        style={{ transform: isDark ? 'translateX(24px)' : 'translateX(0px)' }}
      >
        {isDark ? <Moon size={13} className="text-[var(--purple)]" /> : <Sun size={13} className="text-[var(--warning)]" />}
      </div>
    </button>
  );
}
