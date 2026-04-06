import type { Metadata } from 'next';
import { SubscriptionListClient } from '@/features/subscriptions/components/subscription-list-client';
import { subscriptions } from '@/mocks/fixtures/subscriptions';

export const metadata: Metadata = {
  title: '청약 목록',
  description: '전국 아파트 청약 일정과 분양 정보를 한눈에 확인하세요. 지역, 상태, 유형별 필터 검색이 가능합니다.',
};

export default function SubscriptionsPage() {
  return (
    <div className="mx-auto max-w-[1200px] py-6 lg:py-10">
      <div className="px-4 lg:px-8 mb-6">
        <h1 className="text-display-sm text-text-primary">청약 목록</h1>
      </div>

      <div className="lg:px-8">
        <SubscriptionListClient subscriptions={subscriptions} />
      </div>
    </div>
  );
}
