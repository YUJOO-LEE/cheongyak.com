'use client';

import { MapPin, Ruler, Layers, CalendarDays } from 'lucide-react';
import { AnimateOnScroll, StaggerChildren } from '@/shared/components';
import type { TopTrade } from '@/shared/types/api';

interface TopTradesProps {
  trades: TopTrade[];
}

// 거래일(yyyy-MM-dd) → "M.d" 축약. 최근 2일 거래이므로 연도 생략.
function formatShortDate(iso: string): string {
  const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${Number(m[1])}.${m[2]}`;
}

// 1~3위 브랜드 강조, 4~5위 톤다운.
function rankColor(rank: number): string {
  return rank <= 3 ? 'text-brand-primary-500' : 'text-text-tertiary';
}

function Dot() {
  return (
    <span className="text-text-disabled" aria-hidden="true">
      ·
    </span>
  );
}

// TODO(top-trades-link): 실거래가 상세/검색 페이지 신설 후 행 전체를 Link 로 감싼다.
export function TopTrades({ trades }: TopTradesProps) {
  if (trades.length === 0) return null;

  return (
    <div>
      <AnimateOnScroll animation="fade-in-up" className="mb-4">
        <h2 className="text-headline-lg text-text-primary">
          전국 실거래가 TOP {trades.length}
        </h2>
        <p className="mt-1 text-body-md text-text-tertiary">
          최근 2일 거래 · 거래금액 상위 · 출처: 국토교통부
        </p>
      </AnimateOnScroll>

      <StaggerChildren
        as="div"
        animation="fade-in-up"
        interval={60}
        maxItems={trades.length}
        className="flex flex-col gap-3"
      >
        {trades.map((trade, i) => {
          const rank = i + 1;
          return (
            <article
              key={trade.id}
              className="bg-bg-card rounded-xl px-4 py-3 lg:px-6 lg:py-4"
            >
              {/* 순위 + 본문 정렬: 모바일은 items-start (본문이 2줄 이상일 때 순위가 위로 고정), 데스크톱은 한 줄 이므로 items-center. */}
              {/* gap 은 카드 좌우 패딩(px-4 / lg:px-6)과 동일하게 맞춰 순위 숫자의 좌/우 여백을 대칭으로. */}
              <div className="flex items-start gap-4 lg:items-center lg:gap-6">
                <span
                  className={[
                    'shrink-0 pt-0.5 lg:pt-0 leading-none',
                    'text-headline-sm tabular-nums',
                    rankColor(rank),
                  ].join(' ')}
                  aria-label={`${rank}위`}
                >
                  {rank}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-label-lg text-text-primary truncate">
                      {trade.aptName}
                    </p>
                    {/* 금액은 모바일에서 아파트명과 밸런스 맞춰 label-lg, 데스크톱에서 확대. */}
                    <p className="shrink-0 text-label-lg lg:text-headline-sm text-brand-primary-700 tabular-nums">
                      {trade.dealAmount}
                    </p>
                  </div>

                  {/* 메타 라인: 아이콘은 데스크톱에서만 노출(모바일 공간 확보), 구분자는 · bullet 통일. */}
                  <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-caption text-text-secondary">
                    <span className="inline-flex items-center gap-1">
                      <MapPin
                        size={12}
                        className="hidden lg:inline text-text-tertiary"
                        aria-hidden="true"
                      />
                      {trade.region}
                    </span>
                    {trade.area && (
                      <>
                        <Dot />
                        <span className="inline-flex items-center gap-1">
                          <Ruler
                            size={12}
                            className="hidden lg:inline text-text-tertiary"
                            aria-hidden="true"
                          />
                          {trade.area}
                        </span>
                      </>
                    )}
                    {trade.floor !== undefined && (
                      <>
                        <Dot />
                        <span className="inline-flex items-center gap-1">
                          <Layers
                            size={12}
                            className="hidden lg:inline text-text-tertiary"
                            aria-hidden="true"
                          />
                          {trade.floor}층
                        </span>
                      </>
                    )}
                    <Dot />
                    <span className="inline-flex items-center gap-1 text-text-tertiary">
                      <CalendarDays
                        size={12}
                        className="hidden lg:inline"
                        aria-hidden="true"
                      />
                      {formatShortDate(trade.dealDate)}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </StaggerChildren>
    </div>
  );
}
