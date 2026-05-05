import {
  CheckCircle,
  Calendar,
  Clock,
  Archive,
  FileCheck,
  type LucideIcon,
} from 'lucide-react';
import { STATUS_LABELS } from '@/shared/lib/constants';
import type { SubscriptionStatus } from '@/shared/types/api';

type ChipStatus = SubscriptionStatus;

type ChipSize = 'sm' | 'md';

interface StatusChipProps {
  status: ChipStatus;
  size?: ChipSize;
  className?: string;
}

interface ChipConfig {
  label: string;
  icon: LucideIcon;
  bg: string;
  text: string;
}

const chipConfigs: Record<ChipStatus, ChipConfig> = {
  accepting: {
    label: STATUS_LABELS.accepting,
    icon: CheckCircle,
    bg: 'bg-brand-secondary-100',
    text: 'text-brand-secondary-900',
  },
  upcoming: {
    label: STATUS_LABELS.upcoming,
    icon: Calendar,
    bg: 'bg-info-100',
    text: 'text-info-700',
  },
  pending: {
    label: STATUS_LABELS.pending,
    icon: Clock,
    bg: 'bg-warning-100',
    text: 'text-warning-700',
  },
  result_today: {
    label: STATUS_LABELS.result_today,
    icon: FileCheck,
    bg: 'bg-warning-50',
    text: 'text-warning-700',
  },
  closed: {
    label: STATUS_LABELS.closed,
    icon: Archive,
    bg: 'bg-neutral-200',
    text: 'text-neutral-600',
  },
};

// text-caption 의 기본 weight 가 400 이라 sm 칩이 너무 얇아 보이는 문제를
// font-semibold 로 끌어올린다. md(text-label-md, weight 600) 와 시각 무게감을
// 맞추기 위함이며, 후속으로 'text-label-sm' (size 11/600) 토큰이 추가되면
// 그쪽으로 이전 가능. TODO: [DESIGN_TOKEN_NEEDED] text-label-sm.
const sizeStyles: Record<ChipSize, { class: string; icon: number }> = {
  sm: { class: 'px-1.5 py-0.5 text-caption font-semibold gap-1', icon: 12 },
  md: { class: 'px-2 py-1 text-label-md gap-1', icon: 14 },
};

export function StatusChip({
  status,
  size = 'md',
  className = '',
}: StatusChipProps) {
  const config = chipConfigs[status];
  const Icon = config.icon;
  const s = sizeStyles[size];

  return (
    <span
      className={[
        'inline-flex items-center rounded-full',
        'transition-transform duration-fast ease-default',
        s.class,
        config.bg,
        config.text,
        className,
      ].join(' ')}
    >
      <Icon size={s.icon} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export type { StatusChipProps, ChipStatus, ChipSize };
