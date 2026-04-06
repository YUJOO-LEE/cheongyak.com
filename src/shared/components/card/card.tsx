'use client';

import { forwardRef } from 'react';

type CardVariant = 'subscription' | 'news' | 'stat' | 'compact';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  as?: 'div' | 'article';
  href?: string;
  interactive?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  subscription: 'p-6 rounded-lg',
  news: 'p-4 rounded-md',
  stat: 'p-4 rounded-md',
  compact: 'p-3 rounded-md',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'subscription',
      as: Component = 'div',
      interactive = true,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    return (
      <Component
        ref={ref}
        data-card
        className={[
          'bg-bg-card',
          variantStyles[variant],
          interactive && [
            'transition-all duration-fast ease-default',
            'hover:-translate-y-0.5 hover:shadow-md',
            'active:translate-y-0 active:shadow-sm',
          ].join(' '),
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Card.displayName = 'Card';

export { Card };
export type { CardProps, CardVariant };
