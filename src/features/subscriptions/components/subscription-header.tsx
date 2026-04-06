import { MapPin, Building2, Home, Ruler } from 'lucide-react';
import { StatusChip } from '@/shared/components';
import { statusToChipStatus } from '@/shared/lib/format';
import type { SubscriptionDetail } from '@/shared/types/api';

interface SubscriptionHeaderProps {
  subscription: SubscriptionDetail;
}

export function SubscriptionHeader({ subscription }: SubscriptionHeaderProps) {
  return (
    <div>
      <StatusChip status={statusToChipStatus(subscription.status)} className="mb-3" />

      <h1 className="text-display-sm text-text-primary mb-3">
        {subscription.name}
      </h1>

      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-body-lg text-text-secondary">
          <MapPin size={18} aria-hidden="true" />
          <span>
            {subscription.location.sido} {subscription.location.gugun}
            {subscription.location.dong && ` ${subscription.location.dong}`}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-body-md text-text-secondary">
          <Building2 size={16} aria-hidden="true" />
          <span>{subscription.builder}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-body-md">
        <div className="flex items-center gap-1.5 text-text-secondary">
          <Home size={16} aria-hidden="true" />
          <span>총 {subscription.totalUnits.toLocaleString()}세대</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-secondary">
          <Ruler size={16} aria-hidden="true" />
          <span>{subscription.sizeRange}</span>
        </div>
        {subscription.priceRange && (
          <span className="text-text-secondary">{subscription.priceRange}</span>
        )}
      </div>
    </div>
  );
}
