import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { StatusChip, TypeChip } from '@/shared/components';
import type { WeeklySubscription } from '@/shared/types/api';

interface DesktopCardProps {
  subscription: WeeklySubscription;
  isPast: boolean;
  isToday: boolean;
}

export function DesktopCard({ subscription: sub, isPast, isToday }: DesktopCardProps) {
  const region = [sub.location.gugun, sub.location.dong].filter(Boolean).join(' ');

  return (
    <Link
      href={`/listings/${sub.id}`}
      className={[
        'block rounded-lg p-3 bg-bg-card',
        isToday ? 'shadow-md' : '',
        'transition-all duration-fast ease-default',
        'hover:-translate-y-0.5 hover:shadow-md',
        'active:translate-y-0 active:shadow-sm',
        isPast ? 'opacity-80 hover:opacity-100' : '',
      ].join(' ')}
    >
      <div className="flex flex-wrap gap-1 mb-2">
        {sub.phases.map((phase) => (
          <StatusChip key={phase} status={sub.status} label={phase} size="sm" />
        ))}
        <TypeChip type={sub.type} size="sm" />
      </div>
      <p className="text-body-md font-medium text-text-primary line-clamp-2 mb-2">
        {sub.name}
      </p>
      {region && (
        <div className="flex items-center gap-1.5 text-caption text-text-secondary">
          <MapPin size={12} aria-hidden="true" className="text-text-tertiary shrink-0" />
          <span className="truncate">{region}</span>
        </div>
      )}
    </Link>
  );
}
