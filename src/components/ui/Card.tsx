import type { ReactNode, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export function Card({ children, className, hover = true, delay = 0, ...rest }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -3 } : undefined}
      className={clsx(
        'glass rounded-2xl p-5 transition-shadow',
        hover && 'hover:shadow-xl',
        className
      )}
      {...(rest as any)}
    >
      {children}
    </motion.div>
  );
}

/** Distinct, fixed per-feature accent colors for badge icons — these are
 * intentionally independent of the light/dark + blue/yellow theme scheme,
 * so each feature keeps its own identity no matter what theme is active. */
const BADGE_COLORS = {
  blue: { bg: 'linear-gradient(135deg, #2563EB, #38BDF8)', glow: 'rgba(37, 99, 235, 0.35)' },
  purple: { bg: 'linear-gradient(135deg, #7C3AED, #C084FC)', glow: 'rgba(124, 58, 237, 0.35)' },
  green: { bg: 'linear-gradient(135deg, #059669, #34D399)', glow: 'rgba(5, 150, 105, 0.35)' },
  orange: { bg: 'linear-gradient(135deg, #EA580C, #FBBF24)', glow: 'rgba(234, 88, 12, 0.35)' },
  pink: { bg: 'linear-gradient(135deg, #DB2777, #F472B6)', glow: 'rgba(219, 39, 119, 0.35)' },
  teal: { bg: 'linear-gradient(135deg, #0891B2, #67E8F9)', glow: 'rgba(8, 145, 178, 0.35)' },
} as const;
export type BadgeColor = keyof typeof BADGE_COLORS;

export function CardHeader({ title, subtitle, icon, action, color = 'blue' }: { title: string; subtitle?: string; icon?: ReactNode; action?: ReactNode; color?: BadgeColor }) {
  const c = BADGE_COLORS[color] ?? BADGE_COLORS.blue;
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 ring-1 ring-inset ring-white/25"
            style={{ background: c.bg, boxShadow: `0 4px 14px -3px ${c.glow}` }}
          >
            {icon}
            {/* small status-light dot for a robotic/tech feel */}
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white/80 ring-1 ring-black/10 animate-pulse" />
          </div>
        )}
        <div>
          <h3 className="font-display font-semibold text-[15px] leading-tight" style={{ color: 'var(--ink)' }}>{title}</h3>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
