import {
  CheckCircle,
  Calendar,
  Clock,
  XCircle,
  Star,
  Flame,
  type LucideIcon,
} from 'lucide-react';

type ChipStatus =
  | 'active'
  | 'upcoming'
  | 'closing-soon'
  | 'closed'
  | 'special'
  | 'trending';

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
  active: {
    label: '접수중',
    icon: CheckCircle,
    bg: 'bg-success-50',
    text: 'text-success-700',
  },
  upcoming: {
    label: '접수예정',
    icon: Calendar,
    bg: 'bg-info-50',
    text: 'text-info-700',
  },
  'closing-soon': {
    label: '마감임박',
    icon: Clock,
    bg: 'bg-warning-50',
    text: 'text-warning-700',
  },
  closed: {
    label: '마감',
    icon: XCircle,
    bg: 'bg-bg-sunken',
    text: 'text-text-secondary',
  },
  special: {
    label: '특별공급',
    icon: Star,
    bg: 'bg-brand-primary-50',
    text: 'text-brand-primary-700',
  },
  trending: {
    label: '인기',
    icon: Flame,
    bg: 'bg-brand-tertiary-50',
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
