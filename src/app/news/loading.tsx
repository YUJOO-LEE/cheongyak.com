import { Skeleton } from '@/shared/components';

export default function NewsLoading() {
  return (
    <div className="mx-auto max-w-[1200px] py-6 lg:py-10" aria-hidden="true">
      <div className="px-4 lg:px-8 mb-6">
        <Skeleton width={120} height={36} />
      </div>
      <div className="px-4 lg:px-0 mb-6">
        <div className="flex gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} width={80} height={36} className="rounded-full" />
          ))}
        </div>
      </div>
      <div className="max-w-[720px] mx-auto px-4 lg:px-0 flex flex-col gap-8">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i}>
            <Skeleton className="w-full aspect-video rounded-md mb-3" />
            <Skeleton width={60} height={16} className="mb-2" />
            <Skeleton width="80%" height={24} className="mb-1" />
            <Skeleton width="100%" height={16} />
          </div>
        ))}
      </div>
    </div>
  );
}
