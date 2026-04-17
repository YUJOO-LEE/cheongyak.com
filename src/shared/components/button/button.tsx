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
    'bg-brand-primary-500 text-text-inverse',
    'hover:bg-brand-primary-600',
    'active:bg-brand-primary-700',
    'disabled:bg-bg-disabled disabled:text-text-tertiary',
  ].join(' '),
  secondary: [
    'bg-neutral-200 text-text-primary',
    'hover:bg-neutral-300',
    'active:bg-bg-active',
    'disabled:bg-bg-disabled disabled:text-text-tertiary',
  ].join(' '),
  tertiary: [
    'bg-transparent text-brand-primary-500',
    'hover:bg-bg-hover',
    'active:bg-bg-active',
    'disabled:text-text-tertiary disabled:bg-transparent',
  ].join(' '),
  danger: [
    'bg-danger-500 text-text-inverse',
    'hover:bg-danger-600',
    'active:bg-danger-700',
    'disabled:bg-bg-disabled disabled:text-text-tertiary',
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
          'transition-all duration-fast ease-default',
          'active:scale-[0.97]',
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
