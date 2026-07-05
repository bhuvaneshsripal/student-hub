interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
}

export function ProgressBar({ value, color, height = 8 }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: 'var(--line)' }}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${pct}%`,
          background: color || 'linear-gradient(90deg, var(--blue), var(--purple))',
        }}
      />
    </div>
  );
}
