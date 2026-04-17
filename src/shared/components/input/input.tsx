import { forwardRef } from 'react';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
  error?: string;
  helperText?: string;
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-9 px-3 text-body-sm',
  md: 'h-11 px-3 text-body-md',
  lg: 'h-13 px-4 text-body-lg',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      inputSize = 'md',
      error,
      helperText,
      className = '',
      id,
      ...props
    },
    ref,
  ) => {
    const helperId = helperText || error ? `${id}-helper` : undefined;

    return (
      <div className="flex flex-col gap-1">
        <div className="relative">
          <input
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={helperId}
            className={[
              'w-full bg-bg-sunken rounded-md',
              'border-b-2 border-transparent',
              'transition-colors duration-fast ease-default',
              'placeholder:text-text-tertiary',
              'focus:border-b-brand-primary-500 focus:outline-none',
              'focus-visible:outline-2 focus-visible:outline-brand-primary-500 focus-visible:outline-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-b-danger-500',
              sizeStyles[inputSize],
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />
        </div>
        {(error || helperText) && (
          <p
            id={helperId}
            className={[
              'text-body-sm',
              error ? 'text-danger-600' : 'text-text-secondary',
            ].join(' ')}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
export type { InputProps, InputSize };
