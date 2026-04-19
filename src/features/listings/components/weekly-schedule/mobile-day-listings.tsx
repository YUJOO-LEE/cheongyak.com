import Link from 'next/link';
import { CalendarOff } from 'lucide-react';
import { StatusChip } from '@/shared/components';
import { formatDateRange } from '@/shared/lib/format';
import type { Subscription } from '@/shared/types/api';
import { SubscriptionInfo } from './subscription-info';

interface MobileDayListingsProps {
  subscriptions: Subscription[];
}

export function MobileDayListings({ subscriptions }: MobileDayListingsProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="bg-bg-sunken rounded-xl p-8 text-center">
        <CalendarOff size={24} className="mx-auto text-text-tertiary mb-2" aria-hidden="true" />
        <p className="text-body-md text-text-tertiary">예정된 청약이 없어요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {subscriptions.map((sub, i) => (
        <Link
          key={sub.id}
          href={`/listings/${sub.id}`}
          className="block bg-bg-card rounded-xl p-4 active:bg-bg-active transition-all duration-normal ease-default animate-fade-in-up"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <StatusChip status={sub.status} />
            <span className="text-caption text-text-tertiary">
              {formatDateRange(sub.applicationStart, sub.applicationEnd)}
            </span>
          </div>

          <h3 className="text-headline-sm text-text-primary mb-2.5">
            {sub.name}
          </h3>

          <div className="flex flex-col gap-1 mb-3">
            <SubscriptionInfo sub={sub} />
          </div>

          <p className="text-caption text-text-tertiary">
            {sub.totalUnits.toLocaleString()}세대 · {sub.sizeRange}
          </p>
        </Link>
      ))}
    </div>
  );
}
