import clsx from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx('rounded-lg animate-pulse', className)}
      style={{ background: 'var(--line)' }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5">
      <Skeleton className="h-4 w-1/3 mb-3" />
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
