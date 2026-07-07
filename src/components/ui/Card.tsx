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

export function CardHeader({ title, subtitle, icon, action }: { title: string; subtitle?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--blue)] to-[var(--purple)] text-[#171200] shrink-0">
            {icon}
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
