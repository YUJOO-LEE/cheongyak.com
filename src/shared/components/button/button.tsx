'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-brand-primary-500 text-neutral-0',
    'hover:bg-brand-primary-600',
    'active:bg-brand-primary-700',
    'disabled:bg-neutral-200 disabled:text-neutral-400',
  ].join(' '),
  secondary: [
    'bg-brand-secondary-700 text-neutral-0',
    'hover:bg-brand-secondary-800',
    'active:bg-brand-secondary-900',
    'disabled:bg-neutral-200 disabled:text-neutral-400',
  ].join(' '),
  tertiary: [
    'bg-transparent text-brand-primary-500',
    'hover:bg-neutral-50',
    'active:bg-neutral-100',
    'disabled:text-neutral-400 disabled:bg-transparent',
  ].join(' '),
  danger: [
    'bg-danger-500 text-neutral-0',
    'hover:bg-danger-600',
    'active:bg-danger-700',
    'disabled:bg-neutral-200 disabled:text-neutral-400',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 min-w-16 text-label-md rounded-md',
  md: 'h-10 px-4 min-w-20 text-label-lg rounded-md',
  lg: 'h-12 px-6 min-w-30 text-label-lg rounded-md',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center gap-2',
          'font-semibold cursor-pointer',
          'transition-colors duration-fast ease-default',
          'disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading && (
          <Loader2
            className="animate-spin"
            size={size === 'sm' ? 14 : 16}
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
