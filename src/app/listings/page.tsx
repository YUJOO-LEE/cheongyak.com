import { SubscriptionListClient } from '@/features/listings/components/subscription-list-client';
import { fetchAptSalesListSSR } from '@/features/listings/lib/apt-sales-query';
import {
  PAGE_SIZE,
  parseListingsSearchParams,
  toAptSalesRequest,
} from '@/features/listings/lib/listings-search-params';
import { mapItemToSubscription } from '@/features/listings/lib/map-apt-sales';
import { buildPageMetadata } from '@/shared/lib/seo';

export const revalidate = 60;

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

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * `/listings` is rendered on the server with ISR (`revalidate = 60`).
 * The cache key is the URL — popular entries (page=1 with no filters)
 * stay hot, while rare filter combinations pay one fresh backend hit.
 *
 * Filter / pagination interactions write to the URL via nuqs with
 * `shallow: false`, which re-runs this Server Component, drops
 * `loading.tsx` for the wait, and brings the user back to the top of
 * the new result list — the intended UX for "fresh result set".
 */
export default async function SubscriptionsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const filters = parseListingsSearchParams(raw);
  const request = toAptSalesRequest(filters);

  const envelope = await fetchAptSalesListSSR(request);
  const response = envelope.data.data;
  const subscriptions = (response?.items ?? []).map(mapItemToSubscription);
  const totalCount = response?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-300 pt-3 pb-6 lg:py-10">
      <h1 className="sr-only">청약 목록</h1>
      <div className="lg:px-8">
        <SubscriptionListClient
          subscriptions={subscriptions}
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={filters.page}
        />
      </div>
    </div>
  );
}
