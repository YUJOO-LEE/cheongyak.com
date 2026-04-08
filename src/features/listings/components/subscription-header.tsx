import { MapPin, Building2, Home, Ruler, Banknote } from 'lucide-react';
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

      <h1 className="text-display-sm font-extrabold text-text-primary mb-4">
        {subscription.name}
      </h1>

      <div className="flex flex-col gap-2">
        <InfoRow icon={MapPin}>
          {subscription.location.sido} {subscription.location.gugun}
          {subscription.location.dong && ` ${subscription.location.dong}`}
        </InfoRow>
        <InfoRow icon={Building2}>
          {subscription.builder}
        </InfoRow>
        <InfoRow icon={Home}>
          총 {subscription.totalUnits.toLocaleString()}세대
        </InfoRow>
        <InfoRow icon={Ruler}>
          {subscription.sizeRange}
        </InfoRow>
        {subscription.priceRange && (
          <InfoRow icon={Banknote}>
            {subscription.priceRange}
          </InfoRow>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  children,
}: {
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-body-md text-text-secondary">
      <Icon size={18} aria-hidden="true" className="shrink-0 text-text-tertiary" />
      <span>{children}</span>
    </div>
  );
}
