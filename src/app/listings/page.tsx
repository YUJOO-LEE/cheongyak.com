import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { SubscriptionListClient } from '@/features/listings/components/subscription-list-client';
import { SubscriptionListSkeleton } from '@/features/listings/components/subscription-list-skeleton';
import { aptSalesQueryOptions } from '@/features/listings/lib/apt-sales-query';
import {
  parseListingsSearchParams,
  toAptSalesRequest,
  type RawSearchParams,
} from '@/features/listings/lib/listings-search-params';
import { buildPageMetadata } from '@/shared/lib/seo';
import { getQueryClient } from '@/shared/lib/query-client';

export const metadata = buildPageMetadata({
  title: '청약 목록',
  description:
    '전국 아파트 청약 일정과 분양 정보를 한눈에 확인하세요. 지역, 상태, 유형별 필터 검색이 가능합니다.',
  path: '/listings',
  keywords: [
    '청약 목록',
    '아파트 분양 일정',
    '청약 검색',
    '공공분양 목록',
    '민간분양 목록',
    '특별공급 목록',
    '1순위 청약',
    '전국 청약',
  ],
});

/**
 * Next.js 16 hands `searchParams` to Server Components as a Promise.
 * We resolve it once, run the shared filter parser, and use the same
 * request shape for both (1) the prefetch call and (2) the hydration
 * seed — the client picks up the resolved data without a second fetch.
 */
export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const resolved = await searchParams;
  const filterState = parseListingsSearchParams(resolved);
  const request = toAptSalesRequest(filterState);

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(aptSalesQueryOptions(request));

  return (
    <div className="mx-auto max-w-300 pt-3 pb-6 lg:py-10">
      <h1 className="sr-only">청약 목록</h1>
      <div className="lg:px-8">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<SubscriptionListSkeleton />}>
            <SubscriptionListClient />
          </Suspense>
        </HydrationBoundary>
      </div>
    </div>
  );
}
