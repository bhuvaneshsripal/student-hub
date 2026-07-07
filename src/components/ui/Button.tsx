import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md';
  icon?: ReactNode;
}

export function Button({ children, variant = 'primary', size = 'md', icon, className, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
        size === 'md' ? 'px-4 py-2.5 text-sm' : 'px-3 py-1.5 text-xs',
        variant === 'primary' && 'text-[#171200] bg-gradient-to-r from-[var(--blue)] to-[var(--purple)] shadow-lg shadow-[var(--blue)]/25 hover:brightness-110 font-semibold',
        variant === 'outline' && 'border border-[var(--line)] hover:bg-black/[0.03] dark:hover:bg-white/[0.06]',
        variant === 'ghost' && 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
        variant === 'danger' && 'text-white bg-[var(--danger)] hover:brightness-110',
        className
      )}
      style={{ color: variant === 'outline' || variant === 'ghost' ? 'var(--ink)' : undefined }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
