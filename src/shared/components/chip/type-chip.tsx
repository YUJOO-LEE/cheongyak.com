import type { SubscriptionType } from '@/shared/types/api';
import { TYPE_LABELS } from '@/shared/lib/constants';

type ChipSize = 'sm' | 'md';

interface TypeChipProps {
  type: SubscriptionType;
  size?: ChipSize;
  className?: string;
}

const typeConfigs: Record<SubscriptionType, { label: string; bg: string; text: string }> = {
  public: {
    label: TYPE_LABELS.public,
    bg: 'bg-neutral-200',
    text: 'text-neutral-700',
  },
  private: {
    label: TYPE_LABELS.private,
    bg: 'bg-neutral-200',
    text: 'text-neutral-700',
  },
};

// text-caption(weight 400) 만으로는 sm 칩이 너무 얇게 보여 font-semibold 로 보강.
// StatusChip 과 동일한 보정. TODO: [DESIGN_TOKEN_NEEDED] text-label-sm.
const sizeStyles: Record<ChipSize, string> = {
  sm: 'px-1.5 py-0.5 text-caption font-semibold',
  md: 'px-2 py-1 text-label-md',
};

export function TypeChip({ type, size = 'md', className = '' }: TypeChipProps) {
  const config = typeConfigs[type];

  return (
    <span
      className={[
        'inline-flex items-center rounded-full',
        sizeStyles[size],
        config.bg,
        config.text,
        className,
      ].join(' ')}
    >
      {config.label}
    </span>
  );
}

export type { TypeChipProps };
