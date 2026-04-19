import Link from 'next/link';
import { HomeHero, TopTrades, WeeklySchedule } from '@/features/listings/components';
import { WebsiteJsonLd } from '@/shared/components/json-ld';
import { AnimateOnScroll } from '@/shared/components';
import { apiClient } from '@/shared/lib/api-client';
import { REVALIDATE } from '@/shared/lib/revalidate';
import { reasonMessage, tryRun } from '@/shared/lib/try-run';
import {
  mapFeaturedToSubscription,
  mapStatsToInsights,
  mapTopTradeResponseToTopTrade,
  mapWeeklyScheduleToSubscriptions,
  parseFeaturedEnvelope,
  parseStatsEnvelope,
  parseTopTradesEnvelope,
  parseWeeklyScheduleEnvelope,
} from '@/features/listings/lib/map-main-api';
import type { MarketInsight, Subscription, TopTrade } from '@/shared/types/api';

export const revalidate = 60;

export default async function HomePage() {
  const [featuredR, statsR, weeklyR, topTradesR] = await Promise.allSettled([
    apiClient.get<unknown>('/main/featured', { revalidate: REVALIDATE.MAIN_FEATURED }),
    apiClient.get<unknown>('/main/stats', { revalidate: REVALIDATE.MAIN_STATS }),
    apiClient.get<unknown>('/main/weekly-schedule', { revalidate: REVALIDATE.MAIN_WEEKLY }),
    // 실거래 데이터는 국토부 공개 주기상 분 단위 갱신 불필요 → 120s.
    apiClient.get<unknown>('/main/top-trades', { revalidate: REVALIDATE.MAIN_TOP_TRADES }),
  ]);

  if (featuredR.status === 'rejected') {
    console.warn(`[home] /main/featured rejected: ${reasonMessage(featuredR.reason)}`);
  }
  if (statsR.status === 'rejected') {
    console.warn(`[home] /main/stats rejected: ${reasonMessage(statsR.reason)}`);
  }
  if (weeklyR.status === 'rejected') {
    console.warn(`[home] /main/weekly-schedule rejected: ${reasonMessage(weeklyR.reason)}`);
  }
  if (topTradesR.status === 'rejected') {
    console.warn(`[home] /main/top-trades rejected: ${reasonMessage(topTradesR.reason)}`);
  }

  const featured: Subscription | null =
    featuredR.status === 'fulfilled'
      ? tryRun(
          () => mapFeaturedToSubscription(parseFeaturedEnvelope(featuredR.value)),
          'home/featured mapping',
        )
      : null;

  const insights: MarketInsight[] =
    statsR.status === 'fulfilled'
      ? tryRun(
          () => mapStatsToInsights(parseStatsEnvelope(statsR.value)),
          'home/stats mapping',
        ) ?? []
      : [];

  const activeSubs: Subscription[] =
    weeklyR.status === 'fulfilled'
      ? tryRun(
          () => mapWeeklyScheduleToSubscriptions(parseWeeklyScheduleEnvelope(weeklyR.value)),
          'home/weekly-schedule mapping',
        ) ?? []
      : [];

  const topTrades: TopTrade[] =
    topTradesR.status === 'fulfilled'
      ? tryRun(
          () =>
            parseTopTradesEnvelope(topTradesR.value).map(mapTopTradeResponseToTopTrade),
          'home/top-trades mapping',
        ) ?? []
      : [];

  const isWeekend = [0, 6].includes(new Date().getDay());

  return (
    <div className="mx-auto max-w-300 px-4 lg:px-8 py-6 lg:py-12">
      <WebsiteJsonLd />

      {/* Hero: Featured subscription + market insights.
          featured 가 null(서버 장애 등) 이어도 insights 만으로 섹션 유지. */}
      {(featured || insights.length > 0) && (
        <section className="mb-12 lg:mb-16">
          <HomeHero featured={featured} insights={insights} />
        </section>
      )}

      {/* Weekly Calendar */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-lg text-text-primary">
            {isWeekend ? '다음 주 청약 일정' : '이번 주 청약 일정'}
          </h2>
          <Link
            href="/listings"
            className="text-body-md text-brand-primary-500 hover:text-brand-primary-600 transition-colors"
          >
            전체 보기
          </Link>
        </div>
        <WeeklySchedule subscriptions={activeSubs} />
      </section>

      {/* Top Trades: 실거래가 TOP 5.
          trades 가 비었을 때(서버 장애·신규 배포 전 등)는 섹션 자체를 숨긴다. */}
      {topTrades.length > 0 && (
        <section className="mb-12">
          <AnimateOnScroll animation="fade-in-up">
            <TopTrades trades={topTrades} />
          </AnimateOnScroll>
        </section>
      )}

    </div>
  );
}
