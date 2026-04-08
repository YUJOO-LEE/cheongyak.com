import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SubscriptionHeader } from '@/features/listings/components/subscription-header';
import { ScheduleTimeline } from '@/features/listings/components/schedule-timeline';
import { SupplyBreakdown } from '@/features/listings/components/supply-breakdown';
import { RelatedNews } from '@/features/listings/components/related-news';
import { OfficialLinks } from '@/features/listings/components/official-links';
import { SubscriptionJsonLd } from '@/shared/components/json-ld';
import { subscriptionDetail, subscriptions } from '@/mocks/fixtures/subscriptions';
import { newsArticles } from '@/mocks/fixtures/news';
import type { SubscriptionDetail } from '@/shared/types/api';

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
  if (!sub) return { title: '청약 정보를 찾을 수 없습니다' };

  return {
    title: `${sub.name} 청약 일정 및 정보`,
    description: `${sub.name} - ${sub.location.sido} ${sub.location.gugun} ${sub.builder} 아파트 청약 일정, 공급 정보, 분양 안내`,
  };
}

export default async function SubscriptionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const subscription = getSubscription(id);

  if (!subscription) notFound();

  const relatedNews = newsArticles
    .filter((n) => n.relatedSubscriptionIds?.includes(id))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-300 px-4 lg:px-8 py-6 lg:py-10">
      <SubscriptionJsonLd
        name={subscription.name}
        location={`${subscription.location.sido} ${subscription.location.gugun}`}
        builder={subscription.builder}
        url={`https://cheongyak.com/subscriptions/${id}`}
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

            {relatedNews.length > 0 && (
              <section>
                <h2 className="text-headline-sm text-text-primary mb-4">
                  관련 뉴스
                </h2>
                <RelatedNews articles={relatedNews} />
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
