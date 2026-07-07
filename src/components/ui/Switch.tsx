import type { ReactNode } from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  onIcon?: ReactNode;
  offIcon?: ReactNode;
  label: string;
}

/** Same visual language as ThemeToggle (pill track, sliding circular knob
 * with an icon inside) so every on/off control in the app looks and behaves
 * consistently. */
export function Switch({ checked, onChange, onIcon, offIcon, label }: SwitchProps) {
  return (
    <button
      onClick={onChange}
      aria-label={label}
      aria-pressed={checked}
      className="relative w-14 h-8 rounded-full flex items-center px-1 transition-colors border shrink-0"
      style={{
        background: checked ? 'linear-gradient(90deg, var(--blue), var(--purple))' : 'var(--accent-solid)',
        borderColor: checked ? 'transparent' : 'var(--accent-solid-border)',
      }}
    >
      <div
        className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300"
        style={{ transform: checked ? 'translateX(24px)' : 'translateX(0px)' }}
      >
        {checked ? onIcon : offIcon}
      </div>
    </button>
  );
}
