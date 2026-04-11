import type { SubscriptionType } from '@/shared/types/api';
import { TYPE_LABELS } from '@/shared/lib/constants';

interface TypeChipProps {
  type: SubscriptionType;
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

export function TypeChip({ type, className = '' }: TypeChipProps) {
  const config = typeConfigs[type];

  return (
    <span
      className={[
        'inline-flex items-center',
        'px-2 py-1 rounded-full',
        'text-label-md',
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
