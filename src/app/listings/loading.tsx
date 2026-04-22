import { Skeleton } from '@/shared/components';
import { FilterBarSkeleton } from '@/features/listings/components/filter-bar/filter-bar.skeleton';
import { SubscriptionCardSkeleton } from '@/features/listings/components/subscription-card.skeleton';

export default function SubscriptionsLoading() {
  return (
    <div className="mx-auto max-w-300 pt-3 pb-6 lg:py-10" aria-hidden="true">
      <div className="lg:px-8">
        <FilterBarSkeleton />
        <div className="px-4 lg:px-0">
          <Skeleton className="mb-4" width={80} height={16} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <SubscriptionCardSkeleton key={i} />
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton
                key={i}
                className="rounded-md"
                width={36}
                height={36}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
