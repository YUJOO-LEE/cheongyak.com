import { CompetitionTableSkeleton } from '@/features/listings/components/competition-table.skeleton';
import { ModelSupplyCardsSkeleton } from '@/features/listings/components/model-supply-cards.skeleton';
import { RegulationChipsSkeleton } from '@/features/listings/components/regulation-chips.skeleton';
import { RelatedNewsSkeleton } from '@/features/listings/components/related-news.skeleton';
import { SpecialSupplyStatusTableSkeleton } from '@/features/listings/components/special-supply-status-table.skeleton';
import { WinnerScoreTableSkeleton } from '@/features/listings/components/winner-score-table.skeleton';
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
          <div className="mb-6" data-testid="listing-detail-header-skeleton">
            <Skeleton width={80} height={24} className="rounded-full mb-3" />
            <Skeleton width="70%" height={36} className="mb-3" />
            <SkeletonText lines={3} />
          </div>
          <div className="mb-8">
            <RegulationChipsSkeleton />
          </div>
          <Skeleton
            className="h-96 rounded-lg mb-8"
            data-testid="listing-detail-schedule-skeleton"
          />
          <div className="mb-8">
            <ModelSupplyCardsSkeleton />
          </div>
          <div className="mb-8">
            <CompetitionTableSkeleton />
          </div>
          <div className="mb-8">
            <WinnerScoreTableSkeleton />
          </div>
          <div className="mb-8">
            <SpecialSupplyStatusTableSkeleton />
          </div>
          <div className="mb-8">
            <RelatedNewsSkeleton />
          </div>
        </div>
        <div
          className="lg:col-span-1"
          data-testid="listing-detail-sidebar-col"
        >
          <div className="flex flex-col gap-8">
            <Skeleton
              className="h-40 rounded-lg"
              data-testid="listing-detail-links-skeleton"
            />
            <Skeleton
              className="h-28 rounded-lg"
              data-testid="listing-detail-share-skeleton"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
