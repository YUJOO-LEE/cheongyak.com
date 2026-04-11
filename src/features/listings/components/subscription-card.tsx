import Link from 'next/link';
import { MapPin, Building2, Calendar, Home } from 'lucide-react';
import { Card, StatusChip, TypeChip } from '@/shared/components';
import { formatDateRange } from '@/shared/lib/format';
import type { Subscription } from '@/shared/types/api';

interface SubscriptionCardProps {
  subscription: Subscription;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  return (
    <Link href={`/listings/${subscription.id}`} className="block">
      <Card variant="subscription" as="article">
        <div className="flex items-center gap-2 mb-3">
          <StatusChip status={subscription.status} />
          <TypeChip type={subscription.type} />
        </div>

        <h3 className="text-headline-sm text-text-primary mb-2 line-clamp-1">
          {subscription.name}
        </h3>

        <div className="flex flex-col gap-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-body-md text-text-secondary">
            <MapPin size={16} aria-hidden="true" className="shrink-0" />
            <span className="line-clamp-1">
              {subscription.location.sido} {subscription.location.gugun}
              {subscription.location.dong && ` ${subscription.location.dong}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-body-md text-text-secondary">
            <Building2 size={16} aria-hidden="true" className="shrink-0" />
            <span>{subscription.builder}</span>
          </div>
          <div className="flex items-center gap-1.5 text-body-md text-text-secondary">
            <Calendar size={16} aria-hidden="true" className="shrink-0" />
            <span>{formatDateRange(subscription.applicationStart, subscription.applicationEnd)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-body-sm text-text-tertiary">
          <div className="flex items-center gap-1">
            <Home size={14} aria-hidden="true" />
            <span>{subscription.totalUnits.toLocaleString()}세대</span>
          </div>
          <span>{subscription.sizeRange}</span>
        </div>
      </Card>
    </Link>
  );
}
