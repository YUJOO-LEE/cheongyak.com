import { SubscriptionListClient } from '@/features/listings/components/subscription-list-client';
import { subscriptions } from '@/mocks/fixtures/subscriptions';
import { buildPageMetadata } from '@/shared/lib/seo';

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

export default function SubscriptionsPage() {
  return (
    <div className="mx-auto max-w-300 pt-3 pb-6 lg:py-10">
      <h1 className="sr-only">청약 목록</h1>
      <div className="lg:px-8">
        <SubscriptionListClient subscriptions={subscriptions} />
      </div>
    </div>
  );
}
