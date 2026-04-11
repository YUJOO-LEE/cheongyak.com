import Link from 'next/link';
import { Card, StatusChip } from '@/shared/components';

import type { Subscription } from '@/shared/types/api';

interface RelatedSubscriptionsProps {
  subscriptions: Subscription[];
}

export function RelatedSubscriptions({ subscriptions }: RelatedSubscriptionsProps) {
  if (subscriptions.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-headline-sm text-text-primary">관련 청약</h2>
      {subscriptions.map((sub) => (
        <Link key={sub.id} href={`/listings/${sub.id}`}>
          <Card variant="compact">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-body-md font-semibold text-text-primary line-clamp-1">
                  {sub.name}
                </p>
                <p className="text-body-sm text-text-secondary">
                  {sub.location.sido} {sub.location.gugun}
                </p>
              </div>
              <StatusChip status={sub.status} />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
