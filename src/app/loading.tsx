import { Skeleton, SkeletonText } from '@/shared/components';

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-300 px-4 lg:px-8 py-6 lg:py-10" aria-hidden="true">
      {/* Hero skeleton */}
      <div className="mb-10">
        <Skeleton className="w-full h-48 lg:h-56" />
      </div>

      {/* Weekly schedule skeleton */}
      <div className="mb-10">
        <Skeleton width={200} height={28} className="mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="shrink-0 w-70 h-32 lg:w-full" />
          ))}
        </div>
      </div>

      {/* Market insights skeleton */}
      <div className="mb-10">
        <Skeleton width={160} height={28} className="mb-4" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>

      {/* News skeleton */}
      <div className="mb-10">
        <Skeleton width={140} height={28} className="mb-4" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="shrink-0 w-20 h-20" />
              <SkeletonText lines={2} className="flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
