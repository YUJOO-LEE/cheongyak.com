import { FeaturedSubscription, WeeklySchedule, MarketInsightCards } from '@/features/subscriptions/components';
import { LatestNewsPreview } from '@/features/news/components';
import { subscriptions } from '@/mocks/fixtures/subscriptions';
import { newsArticles } from '@/mocks/fixtures/news';
import { marketInsights } from '@/mocks/fixtures/insights';

export default function HomePage() {
  const featured = subscriptions[0];
  const weekly = subscriptions.filter((s) => s.status !== 'closed');
  const latestNews = newsArticles.slice(0, 3);

  return (
    <div className="mx-auto max-w-[1200px] px-4 lg:px-8 py-6 lg:py-10">
      {/* Hero: Featured Subscription */}
      <section className="mb-10">
        <FeaturedSubscription subscription={featured} />
      </section>

      {/* Weekly Schedule */}
      <section className="mb-10">
        <h2 className="section-decorator text-headline-lg text-text-primary mb-4">
          이번 주 청약 일정
        </h2>
        <WeeklySchedule subscriptions={weekly} />
      </section>

      {/* Market Insights */}
      <section className="mb-10">
        <h2 className="section-decorator text-headline-lg text-text-primary mb-4">
          시장 동향
        </h2>
        <MarketInsightCards insights={marketInsights} />
      </section>

      {/* Latest News */}
      <section className="mb-10">
        <h2 className="section-decorator text-headline-lg text-text-primary mb-4">
          최신 뉴스
        </h2>
        <LatestNewsPreview articles={latestNews} />
      </section>
    </div>
  );
}
