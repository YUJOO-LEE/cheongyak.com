import { Skeleton, SkeletonText } from '@/shared/components';

export default function NewsArticleLoading() {
  return (
    <div className="mx-auto max-w-[720px] px-4 lg:px-8 py-6 lg:py-10" aria-hidden="true">
      <Skeleton width={60} height={20} className="mb-2" />
      <Skeleton width="80%" height={36} className="mb-3" />
      <Skeleton width={120} height={16} className="mb-8" />
      <SkeletonText lines={8} className="mb-10" />
    </div>
  );
}
