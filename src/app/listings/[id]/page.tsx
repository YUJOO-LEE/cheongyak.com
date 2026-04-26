import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import {
  CompetitionTable,
  ModelSupplyCards,
  OfficialLinks,
  RegulationChips,
  ScheduleTimeline,
  ShareActions,
  SpecialSupplyStatusTable,
  SubscriptionHeader,
  WinnerScoreTable,
} from '@/features/listings/components';
import { fetchAptSalesDetailSSR } from '@/features/listings/lib/apt-sales-detail-query';
import { mapAptSalesDetailToSubscription } from '@/features/listings/lib/map-apt-sales-detail';
import { ApiClientError } from '@/shared/lib/api-client';
import {
  BreadcrumbListJsonLd,
  SubscriptionJsonLd,
} from '@/shared/components/json-ld';
import { SITE_URL, buildPageMetadata } from '@/shared/lib/seo';
import type { SubscriptionDetail } from '@/shared/types/api';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ id: string }>;
}

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isFinite(n) && Number.isInteger(n) && n > 0 ? n : null;
}

function formatApplicationPeriod(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  const y1 = start.getFullYear();
  const m1 = pad(start.getMonth() + 1);
  const d1 = pad(start.getDate());
  const y2 = end.getFullYear();
  const m2 = pad(end.getMonth() + 1);
  const d2 = pad(end.getDate());

  if (y1 === y2 && m1 === m2) return `${y1}.${m1}.${d1}–${d2}`;
  if (y1 === y2) return `${y1}.${m1}.${d1}–${m2}.${d2}`;
  return `${y1}.${m1}.${d1}–${y2}.${m2}.${d2}`;
}

// React `cache()` dedupes within a single request: when the same `id`
// is loaded by `generateMetadata` and the page body, only one backend
// call fires. Without this, every detail render hits `/apt-sales/{id}`
// twice. See `CLAUDE.md` §14 Rule C.
const loadDetail = cache(
  async (id: number): Promise<SubscriptionDetail | null> => {
    try {
      const envelope = await fetchAptSalesDetailSSR(id);
      return mapAptSalesDetailToSubscription(envelope.data.data);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) return null;
      throw err;
    }
  },
);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) {
    return buildPageMetadata({
      title: '청약 정보를 찾을 수 없습니다',
      path: `/listings/${id}`,
    });
  }

  const sub = await loadDetail(numericId);
  if (!sub) {
    return buildPageMetadata({
      title: '청약 정보를 찾을 수 없습니다',
      path: `/listings/${id}`,
    });
  }

  const title = `${sub.name} 청약 일정 및 정보`;
  const description = `${sub.name} — ${sub.location.sido} ${sub.location.gugun} ${sub.builder} 아파트 청약 일정, 공급 내역, 분양 안내를 한눈에 정리했습니다. 최종 청약 조건은 공식 입주자모집공고를 기준으로 확인하세요.`;
  const period = formatApplicationPeriod(sub.applicationStart, sub.applicationEnd);

  const ogParams = new URLSearchParams({
    title: sub.name,
    subtitle: `${sub.location.sido} ${sub.location.gugun}`,
    status: sub.status,
    period,
  });

  return buildPageMetadata({
    title,
    description,
    path: `/listings/${sub.id}`,
    ogType: 'article',
    ogImage: `${SITE_URL}/og?${ogParams.toString()}`,
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
  const numericId = parseId(id);
  if (numericId === null) notFound();

  const subscription = await loadDetail(numericId);
  if (!subscription) notFound();

  const hasCompetitions = subscription.competitions.length > 0;
  const hasWinnerScores = subscription.winnerScores.length > 0;
  const hasSpecialStatus = subscription.specialSupplyStatus.length > 0;

  const detailUrl = `${SITE_URL}/listings/${subscription.id}`;
  const sharePeriod = formatApplicationPeriod(
    subscription.applicationStart,
    subscription.applicationEnd,
  );
  const shareLocation = `${subscription.location.sido} ${subscription.location.gugun}`;
  const shareDescription = sharePeriod
    ? `${shareLocation} · ${sharePeriod}`
    : shareLocation;
  // Kakao share feed card crops to 2:1 — request the slimmer 1200×600 variant
  // so the logo (top) and "cheongyak.com" footer (bottom) don't get clipped.
  const shareImageUrl = `${SITE_URL}/og?${new URLSearchParams({
    title: subscription.name,
    subtitle: shareLocation,
    status: subscription.status,
    period: sharePeriod,
    ratio: 'kakao',
  }).toString()}`;

  return (
    <div className="mx-auto max-w-300 px-4 lg:px-8 py-6 lg:py-10">
      <SubscriptionJsonLd
        name={subscription.name}
        location={`${subscription.location.sido} ${subscription.location.gugun}`}
        builder={subscription.builder}
        url={`${SITE_URL}/listings/${subscription.id}`}
      />
      <BreadcrumbListJsonLd
        items={[
          { name: '홈', url: '/' },
          { name: '청약 목록', url: '/listings' },
          { name: subscription.name, url: `/listings/${subscription.id}` },
        ]}
      />
      <div className="lg:grid lg:grid-cols-3 lg:gap-10">
        {/* Main content */}
        <div className="lg:col-span-2">
          <section className="mb-6">
            <SubscriptionHeader subscription={subscription} />
          </section>

          {subscription.regulations.length > 0 && (
            <section className="mb-8">
              <RegulationChips regulations={subscription.regulations} />
            </section>
          )}

          <DetailSection title="청약 일정">
            <div className="bg-bg-card rounded-lg p-6">
              <ScheduleTimeline phases={subscription.schedule} />
            </div>
          </DetailSection>

          <DetailSection title="공급 내역">
            <ModelSupplyCards models={subscription.models} />
          </DetailSection>

          {hasCompetitions && (
            <DetailSection title="경쟁률">
              <CompetitionTable rows={subscription.competitions} />
            </DetailSection>
          )}

          {hasWinnerScores && (
            <DetailSection title="당첨가점">
              <WinnerScoreTable rows={subscription.winnerScores} />
            </DetailSection>
          )}

          {hasSpecialStatus && (
            <DetailSection title="특별공급 신청현황">
              <SpecialSupplyStatusTable
                rows={subscription.specialSupplyStatus}
              />
            </DetailSection>
          )}
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
                inquiryPhone={subscription.inquiryPhone}
              />
            </section>

            <section>
              <h2 className="text-headline-sm text-text-primary mb-4">
                공유하기
              </h2>
              <ShareActions
                url={detailUrl}
                title={`${subscription.name} 청약 정보`}
                description={shareDescription}
                imageUrl={shareImageUrl}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-headline-lg text-text-primary mb-4">{title}</h2>
      {children}
    </section>
  );
}
