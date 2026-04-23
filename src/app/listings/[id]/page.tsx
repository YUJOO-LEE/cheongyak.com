import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SubscriptionHeader } from '@/features/listings/components/subscription-header';
import { ScheduleTimeline } from '@/features/listings/components/schedule-timeline';
import { SupplyBreakdown } from '@/features/listings/components/supply-breakdown';
import { OfficialLinks } from '@/features/listings/components/official-links';
import { BreadcrumbListJsonLd, SubscriptionJsonLd } from '@/shared/components/json-ld';
import { subscriptionDetail, subscriptions } from '@/mocks/fixtures/subscriptions';
import type { SubscriptionDetail } from '@/shared/types/api';
import { SITE_URL, buildPageMetadata } from '@/shared/lib/seo';

interface PageProps {
  params: Promise<{ id: string }>;
}

function getSubscription(id: string): SubscriptionDetail | null {
  if (id === subscriptionDetail.id) return subscriptionDetail;
  const sub = subscriptions.find((s) => s.id === id);
  if (!sub) return null;
  return { ...subscriptionDetail, ...sub };
}

export async function generateStaticParams() {
  return subscriptions.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const sub = getSubscription(id);
  if (!sub) {
    return buildPageMetadata({
      title: '청약 정보를 찾을 수 없습니다',
      path: `/listings/${id}`,
    });
  }

  const title = `${sub.name} 청약 일정 및 정보`;
  const description = `${sub.name} — ${sub.location.sido} ${sub.location.gugun} ${sub.builder} 아파트 청약 일정, 공급 내역, 분양 안내를 한눈에 정리했습니다. 최종 청약 조건은 공식 입주자모집공고를 기준으로 확인하세요.`;

  return buildPageMetadata({
    title,
    description,
    path: `/listings/${sub.id}`,
    ogType: 'article',
    ogImage: `${SITE_URL}/og?title=${encodeURIComponent(sub.name)}&subtitle=${encodeURIComponent(`${sub.location.sido} ${sub.location.gugun}`)}`,
    keywords: [
      sub.name,
      `${sub.name} 입주자모집공고`,
      `${sub.name} 당첨가점`,
      `${sub.location.sido} 청약`,
      `${sub.location.sido} ${sub.location.gugun} 분양`,
      `${sub.builder} 분양`,
      '1순위 청약',
    ],
  });
}

export default async function SubscriptionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const subscription = getSubscription(id);

  if (!subscription) notFound();

  return (
    <div className="mx-auto max-w-300 px-4 lg:px-8 py-6 lg:py-10">
      <SubscriptionJsonLd
        name={subscription.name}
        location={`${subscription.location.sido} ${subscription.location.gugun}`}
        builder={subscription.builder}
        url={`${SITE_URL}/listings/${id}`}
      />
      <BreadcrumbListJsonLd
        items={[
          { name: '홈', url: '/' },
          { name: '청약 목록', url: '/listings' },
          { name: subscription.name, url: `/listings/${id}` },
        ]}
      />
      <div className="lg:grid lg:grid-cols-3 lg:gap-10">
        {/* Main content */}
        <div className="lg:col-span-2">
          <section className="mb-8">
            <SubscriptionHeader subscription={subscription} />
          </section>

          <section className="mb-8">
            <h2 className="text-headline-lg text-text-primary mb-4">
              청약 일정
            </h2>
            <div className="bg-bg-card rounded-lg p-6">
              <ScheduleTimeline phases={subscription.schedule} />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-headline-lg text-text-primary mb-4">
              공급 내역
            </h2>
            <div className="bg-bg-card rounded-lg p-6">
              <SupplyBreakdown supply={subscription.supply} />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 flex flex-col gap-8">
            <section>
              <h2 className="text-headline-sm text-text-primary mb-4">
                공식 링크
              </h2>
              <OfficialLinks
                applyHomeUrl={subscription.applyHomeUrl}
                builderUrl={subscription.builderUrl}
                announcementUrl={subscription.announcementUrl}
              />
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
