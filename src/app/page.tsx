import Link from 'next/link';
import { Suspense } from 'react';
import { HomeHero, TopTrades, WeeklySchedule } from '@/features/listings/components';
import { HomeHeroSkeleton } from '@/features/listings/components/featured-subscription.skeleton';
import { WeeklyScheduleSkeleton } from '@/features/listings/components/weekly-schedule/weekly-schedule.skeleton';
import { TopTradesSkeleton } from '@/features/listings/components/top-trades.skeleton';
import { WebsiteJsonLd } from '@/shared/components/json-ld';
import { AnimateOnScroll, Skeleton } from '@/shared/components';
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

/**
 * Home renders as a synchronous shell with three sibling
 * `<Suspense>` boundaries. Each section owns its own fetch + skeleton
 * fallback, so only the home route pays for home skeletons. An earlier
 * iteration relied on `app/loading.tsx` for the home skeleton, but
 * Next.js treats it as the outer Suspense boundary for ALL child
 * routes — `/listings` refresh briefly flashed the home skeleton
 * before the listings fallback took over. Co-locating the skeletons
 * with the home page removes that bleed-through.
 */
export default function HomePage() {
  return (
    <div className="mx-auto max-w-300 px-4 lg:px-8 py-6 lg:py-12">
      <WebsiteJsonLd />

      <Suspense fallback={<HeroFallback />}>
        <HeroSection />
      </Suspense>

      <Suspense fallback={<WeeklyScheduleFallback />}>
        <WeeklyScheduleSection />
      </Suspense>

      <Suspense fallback={<TopTradesFallback />}>
        <TopTradesSection />
      </Suspense>
    </div>
  );
}

function HeroFallback() {
  return (
    <section className="mb-12 lg:mb-16">
      <HomeHeroSkeleton />
    </section>
  );
}

function WeeklyScheduleFallback() {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <Skeleton width={200} height={28} />
        <Skeleton width={64} height={16} />
      </div>
      <WeeklyScheduleSkeleton />
    </section>
  );
}

function TopTradesFallback() {
  return (
    <section className="mb-12">
      <TopTradesSkeleton />
    </section>
  );
}

async function HeroSection() {
  const [featuredR, statsR] = await Promise.allSettled([
    apiClient.get<unknown>('/main/featured', { revalidate: REVALIDATE.MAIN_FEATURED }),
    apiClient.get<unknown>('/main/stats', { revalidate: REVALIDATE.MAIN_STATS }),
  ]);

  if (featuredR.status === 'rejected') {
    console.warn(`[home] /main/featured rejected: ${reasonMessage(featuredR.reason)}`);
  }
  if (statsR.status === 'rejected') {
    console.warn(`[home] /main/stats rejected: ${reasonMessage(statsR.reason)}`);
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

  if (!featured && insights.length === 0) return null;

  return (
    <section className="mb-12 lg:mb-16">
      <HomeHero featured={featured} insights={insights} />
    </section>
  );
}

async function WeeklyScheduleSection() {
  let weeklyRaw: unknown = null;
  try {
    weeklyRaw = await apiClient.get<unknown>('/main/weekly-schedule', {
      revalidate: REVALIDATE.MAIN_WEEKLY,
    });
  } catch (e) {
    console.warn(`[home] /main/weekly-schedule rejected: ${reasonMessage(e)}`);
  }

  const subscriptions: Subscription[] = weeklyRaw
    ? tryRun(
        () => mapWeeklyScheduleToSubscriptions(parseWeeklyScheduleEnvelope(weeklyRaw)),
        'home/weekly-schedule mapping',
      ) ?? []
    : [];

  const isWeekend = [0, 6].includes(new Date().getDay());

  return (
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
      <WeeklySchedule subscriptions={subscriptions} />
    </section>
  );
}

async function TopTradesSection() {
  let topTradesRaw: unknown = null;
  try {
    topTradesRaw = await apiClient.get<unknown>('/main/top-trades', {
      revalidate: REVALIDATE.MAIN_TOP_TRADES,
    });
  } catch (e) {
    console.warn(`[home] /main/top-trades rejected: ${reasonMessage(e)}`);
  }

  const topTrades: TopTrade[] = topTradesRaw
    ? tryRun(
        () => parseTopTradesEnvelope(topTradesRaw).map(mapTopTradeResponseToTopTrade),
        'home/top-trades mapping',
      ) ?? []
    : [];

  if (topTrades.length === 0) return null;

  return (
    <section className="mb-12">
      <AnimateOnScroll animation="fade-in-up">
        <TopTrades trades={topTrades} />
      </AnimateOnScroll>
    </section>
  );
}
