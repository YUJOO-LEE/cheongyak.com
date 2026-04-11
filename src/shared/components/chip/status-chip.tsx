import {
  CheckCircle,
  Calendar,
  Clock,
  Archive,
  FileCheck,
  Star,
  Flame,
  type LucideIcon,
} from 'lucide-react';
import { STATUS_LABELS } from '@/shared/lib/constants';
import type { SubscriptionStatus } from '@/shared/types/api';

type ChipStatus = SubscriptionStatus | 'special' | 'trending';

interface StatusChipProps {
  status: ChipStatus;
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
    bg: 'bg-brand-secondary-200',
    text: 'text-brand-secondary-800',
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
  contracting: {
    label: STATUS_LABELS.contracting,
    icon: FileCheck,
    bg: 'bg-brand-tertiary-100',
    text: 'text-brand-tertiary-700',
  },
  closed: {
    label: STATUS_LABELS.closed,
    icon: Archive,
    bg: 'bg-neutral-200',
    text: 'text-neutral-600',
  },
  special: {
    label: '특별공급',
    icon: Star,
    bg: 'bg-brand-primary-100',
    text: 'text-brand-primary-700',
  },
  trending: {
    label: '인기',
    icon: Flame,
    bg: 'bg-brand-tertiary-100',
    text: 'text-brand-tertiary-700',
  },
};

export function StatusChip({ status, className = '' }: StatusChipProps) {
  const config = chipConfigs[status];
  const Icon = config.icon;

  return (
    <span
      className={[
        'inline-flex items-center gap-1',
        'px-2 py-1 rounded-full',
        'text-label-md',
        'transition-transform duration-fast ease-default',
        config.bg,
        config.text,
        className,
      ].join(' ')}
    >
      <Icon size={14} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export type { StatusChipProps, ChipStatus };
