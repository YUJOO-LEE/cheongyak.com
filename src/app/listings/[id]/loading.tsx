import { Skeleton, SkeletonText } from '@/shared/components';

export default function SubscriptionDetailLoading() {
  return (
    <div
      className="mx-auto max-w-300 px-4 lg:px-8 py-6 lg:py-10"
      aria-hidden="true"
      data-testid="listing-detail-skeleton"
    >
      <div className="lg:grid lg:grid-cols-3 lg:gap-10">
        <div
          className="lg:col-span-2"
          data-testid="listing-detail-main-col"
        >
          <div className="mb-8" data-testid="listing-detail-header-skeleton">
            <Skeleton width={80} height={24} className="rounded-full mb-3" />
            <Skeleton width="70%" height={36} className="mb-3" />
            <SkeletonText lines={3} />
          </div>
          <Skeleton
            className="h-96 rounded-lg mb-8"
            data-testid="listing-detail-schedule-skeleton"
          />
          <Skeleton
            className="h-80 rounded-lg mb-8"
            data-testid="listing-detail-supply-skeleton"
          />
        </div>
        <div
          className="lg:col-span-1"
          data-testid="listing-detail-sidebar-col"
        >
          <Skeleton
            className="h-40 rounded-lg"
            data-testid="listing-detail-links-skeleton"
          />
        </div>
      </div>
    </div>
  );
}
