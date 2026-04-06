import Link from 'next/link';
import { MapPin, Building2, Calendar } from 'lucide-react';
import { StatusChip } from '@/shared/components';
import { formatDateRange, statusToChipStatus } from '@/shared/lib/format';
import type { Subscription } from '@/shared/types/api';

interface FeaturedSubscriptionProps {
  subscription: Subscription;
}

export function FeaturedSubscription({ subscription }: FeaturedSubscriptionProps) {
  return (
    <Link href={`/subscriptions/${subscription.id}`} className="block group">
      <div className="relative overflow-hidden rounded-xl bg-bg-card p-6 lg:p-8 transition-all duration-fast ease-default group-hover:-translate-y-0.5 group-hover:shadow-md">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 hero-gradient-mesh opacity-50" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <StatusChip status={statusToChipStatus(subscription.status)} />
            <span className="text-caption text-text-tertiary">추천 청약</span>
          </div>

          <h2 className="text-headline-lg text-text-primary mb-2">
            {subscription.name}
          </h2>

          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-body-md text-text-secondary">
              <MapPin size={16} aria-hidden="true" />
              <span>
                {subscription.location.sido} {subscription.location.gugun}
                {subscription.location.dong && ` ${subscription.location.dong}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-body-md text-text-secondary">
              <Building2 size={16} aria-hidden="true" />
              <span>{subscription.builder}</span>
            </div>
            <div className="flex items-center gap-1.5 text-body-md text-text-secondary">
              <Calendar size={16} aria-hidden="true" />
              <span>{formatDateRange(subscription.applicationStart, subscription.applicationEnd)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-body-sm text-text-tertiary">
            <span>총 {subscription.totalUnits.toLocaleString()}세대</span>
            <span>{subscription.sizeRange}</span>
            {subscription.priceRange && <span>{subscription.priceRange}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
