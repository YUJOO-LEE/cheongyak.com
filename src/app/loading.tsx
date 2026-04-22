import { Skeleton } from '@/shared/components';
import { HomeHeroSkeleton } from '@/features/listings/components/featured-subscription.skeleton';
import { WeeklyScheduleSkeleton } from '@/features/listings/components/weekly-schedule/weekly-schedule.skeleton';
import { TopTradesSkeleton } from '@/features/listings/components/top-trades.skeleton';

export default function HomeLoading() {
  return (
    <div
      className="mx-auto max-w-300 px-4 lg:px-8 py-6 lg:py-12"
      aria-hidden="true"
    >
      <section className="mb-12 lg:mb-16">
        <HomeHeroSkeleton />
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <Skeleton width={200} height={28} />
          <Skeleton width={64} height={16} />
        </div>
        <WeeklyScheduleSkeleton />
      </section>

      <section className="mb-12">
        <TopTradesSkeleton />
      </section>
    </div>
  );
}
