import { Skeleton, SkeletonText } from '@/shared/components';

export default function SubscriptionDetailLoading() {
  return (
    <div className="mx-auto max-w-300 px-4 lg:px-8 py-6 lg:py-10" aria-hidden="true">
      <div className="lg:grid lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2">
          <div className="mb-8">
            <Skeleton width={80} height={24} className="rounded-full mb-3" />
            <Skeleton width="70%" height={36} className="mb-3" />
            <SkeletonText lines={3} />
          </div>
          <Skeleton className="h-64 rounded-lg mb-8" />
          <Skeleton className="h-48 rounded-lg mb-8" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-32 rounded-lg mb-6" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
