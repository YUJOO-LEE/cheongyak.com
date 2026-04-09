import type { SubscriptionType } from '@/shared/types/api';

interface TypeChipProps {
  type: SubscriptionType;
  className?: string;
}

const typeConfigs: Record<SubscriptionType, { label: string; bg: string; text: string }> = {
  public: {
    label: '공공',
    bg: 'bg-neutral-200',
    text: 'text-neutral-700',
  },
  private: {
    label: '민간',
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
