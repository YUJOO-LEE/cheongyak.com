import type { Metadata } from 'next';
import { SubscriptionListClient } from '@/features/listings/components/subscription-list-client';
import { subscriptions } from '@/mocks/fixtures/subscriptions';

export const metadata: Metadata = {
  title: '청약 목록',
  description: '전국 아파트 청약 일정과 분양 정보를 한눈에 확인하세요. 지역, 상태, 유형별 필터 검색이 가능합니다.',
};

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
