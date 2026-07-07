import { Check } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import type { ColorScheme } from '../../store/settingsStore';

const SCHEMES: { id: ColorScheme; label: string; swatch: string; onSwatch: string }[] = [
  { id: 'blue', label: 'Blue', swatch: 'linear-gradient(135deg, #2563EB, #3B82F6)', onSwatch: '#FFFFFF' },
  { id: 'yellow', label: 'Yellow', swatch: 'linear-gradient(135deg, #F5A800, #FFCB3D)', onSwatch: '#171200' },
];

export function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useSettingsStore();

  return (
    <div className="flex gap-2">
      {SCHEMES.map((s) => {
        const active = colorScheme === s.id;
        return (
          <button
            key={s.id}
            onClick={() => setColorScheme(s.id)}
            aria-pressed={active}
            aria-label={`${s.label} theme`}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border text-xs font-medium transition-colors"
            style={{
              borderColor: active ? s.swatch.match(/#[0-9A-Fa-f]{6}/)?.[0] ?? 'var(--line)' : 'var(--line)',
              background: active ? 'var(--accent-solid)' : 'transparent',
              color: 'var(--ink)',
            }}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background: s.swatch }}
            >
              {active && <Check size={12} color={s.onSwatch} strokeWidth={3} />}
            </span>
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
