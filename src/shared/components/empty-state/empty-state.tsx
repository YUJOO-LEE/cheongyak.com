import type { ReactNode } from 'react';

type EmptyStateSize = 'sm' | 'md' | 'lg';
type EmptyStateSurface = 'transparent' | 'sunken';

interface EmptyStateProps {
  children: ReactNode;
  size?: EmptyStateSize;
  surface?: EmptyStateSurface;
}

const sizeStyles: Record<EmptyStateSize, string> = {
  sm: 'py-10',
  md: 'py-12',
  lg: 'py-16',
};

const surfaceStyles: Record<EmptyStateSurface, string> = {
  transparent: '',
  sunken: 'rounded-lg bg-bg-sunken',
};

export function EmptyState({
  children,
  size = 'md',
  surface = 'transparent',
}: EmptyStateProps) {
  return (
    <div
      className={[
        'text-center',
        sizeStyles[size],
        surfaceStyles[surface],
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

export type { EmptyStateProps, EmptyStateSize, EmptyStateSurface };
