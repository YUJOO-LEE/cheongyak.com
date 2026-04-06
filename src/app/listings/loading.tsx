import { Skeleton } from '@/shared/components';

export default function SubscriptionsLoading() {
  return (
    <div className="mx-auto max-w-[1200px] py-6 lg:py-10" aria-hidden="true">
      <div className="px-4 lg:px-8 mb-6">
        <Skeleton width={200} height={36} />
      </div>
      <div className="lg:px-8">
        <Skeleton className="h-14 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-0">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
