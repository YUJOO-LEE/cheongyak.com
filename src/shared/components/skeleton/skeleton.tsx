interface SkeletonProps {
  className?: string;
  variant?: 'rectangle' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
  'data-testid'?: string;
}

export function Skeleton({
  className = '',
  variant = 'rectangle',
  width,
  height,
  'data-testid': dataTestId,
}: SkeletonProps) {
  const variantStyles = {
    rectangle: 'rounded-md',
    circle: 'rounded-full',
    text: 'rounded-sm h-4 w-full',
  };

  return (
    <div
      aria-hidden="true"
      className={['skeleton', variantStyles[variant], className].join(' ')}
      style={{ width, height }}
      data-testid={dataTestId}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
  return (
    <div className={['flex flex-col gap-2', className].join(' ')} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={[
            'skeleton rounded-sm h-4',
            i === lines - 1 ? 'w-3/5' : 'w-full',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

export type { SkeletonProps, SkeletonTextProps };
