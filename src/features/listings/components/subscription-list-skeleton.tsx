import { Skeleton } from '@/shared/components';
import { SubscriptionCardSkeleton } from './subscription-card.skeleton';

/**
 * Client-side Suspense fallback for `SubscriptionListClient`.
 * Renders the same building blocks as the route-level
 * `/listings` loader so users never see two different skeletons
 * for the same page. The outer wrapper carries aria-busy /
 * aria-live so assistive tech knows this is a loading state
 * (the route-level loader already sits inside `<html>` so it
 * skips the aria wrapper).
 */
export function SubscriptionListSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="px-4 lg:px-0">
      <p className="sr-only">청약 목록을 불러오는 중입니다.</p>
      <Skeleton className="mb-4" width={80} height={16} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <SubscriptionCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
