interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ProgressRing({ value, size = 120, strokeWidth = 10, label }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--line)" strokeWidth={strokeWidth} />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--blue)" />
            <stop offset="100%" stopColor="var(--purple)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="url(#ringGrad)"
          strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-2xl" style={{ color: 'var(--ink)' }}>{Math.round(value)}%</span>
        {label && <span className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: 'var(--ink-soft)' }}>{label}</span>}
      </div>
    </div>
  );
}
