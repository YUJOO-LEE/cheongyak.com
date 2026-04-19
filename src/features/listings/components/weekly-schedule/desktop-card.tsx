import Link from 'next/link';
import { StatusChip } from '@/shared/components';
import type { Subscription } from '@/shared/types/api';
import { SubscriptionInfo } from './subscription-info';

interface DesktopCardProps {
  subscription: Subscription;
  isPast: boolean;
  isToday: boolean;
}

export function DesktopCard({ subscription: sub, isPast, isToday }: DesktopCardProps) {
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
      <StatusChip status={sub.status} className="mb-2" />
      <p className="text-body-md font-medium text-text-primary line-clamp-2 mb-2">
        {sub.name}
      </p>
      <div className="flex flex-col gap-1 mb-2">
        <SubscriptionInfo sub={sub} compact />
      </div>
      <p className="text-caption text-text-tertiary">
        {sub.totalUnits.toLocaleString()}세대 · {sub.sizeRange}
      </p>
    </Link>
  );
}
