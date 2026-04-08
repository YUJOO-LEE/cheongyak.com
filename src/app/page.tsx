import Link from 'next/link';
import { HomeHero, WeeklySchedule } from '@/features/listings/components';
import { LatestNewsPreview } from '@/features/news/components';
import { WebsiteJsonLd } from '@/shared/components/json-ld';
import { subscriptions } from '@/mocks/fixtures/subscriptions';
import { newsArticles } from '@/mocks/fixtures/news';
import { marketInsights } from '@/mocks/fixtures/insights';

export default function HomePage() {
  const activeSubs = subscriptions.filter((s) => s.status !== 'closed');
  const latestNews = newsArticles.slice(0, 4);

  return (
    <div className="mx-auto max-w-300 px-4 lg:px-8 py-6 lg:py-12">
      <WebsiteJsonLd />

      {/* Hero: Stats + Active listings */}
      <section className="mb-12 lg:mb-16">
        <HomeHero activeSubs={activeSubs} insights={marketInsights} />
      </section>

      {/* Weekly Calendar */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-lg font-bold text-text-primary">이번 주 청약 일정</h2>
          <Link href="/listings" className="text-body-md text-brand-primary-500 hover:text-brand-primary-600 transition-colors">
            전체 보기
          </Link>
        </div>
        <WeeklySchedule subscriptions={activeSubs} />
      </section>

      {/* Latest News */}
      <section className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-lg font-bold text-text-primary">최신 뉴스</h2>
          <Link href="/news" className="text-body-md text-brand-primary-500 hover:text-brand-primary-600 transition-colors">
            전체 보기
          </Link>
        </div>
        <LatestNewsPreview articles={latestNews} />
      </section>
    </div>
  );
}
