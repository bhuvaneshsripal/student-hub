interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
}

/**
 * Animates via `transform: scaleX()` instead of `width`. Width transitions
 * force layout + paint on every frame; transform is compositor-only, so this
 * stays smooth at 120fps+ (ProMotion / high-refresh displays) with no jank
 * and no extra JS driving the animation.
 */
export function ProgressBar({ value, color, height = 8 }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: 'var(--line)' }}>
      <div
        className="h-full w-full rounded-full origin-left"
        style={{
          transform: `scaleX(${pct / 100})`,
          background: color || 'linear-gradient(90deg, var(--blue), var(--purple))',
          transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
