import { MapPin, Ruler, Layers, CalendarDays } from 'lucide-react';
import type { TopTrade } from '@/shared/types/api';

interface TopTradesProps {
  trades: TopTrade[];
}

// 거래일(yyyy-MM-dd) → "yyyy.MM.dd" 풀 포맷. 다른 화면(/listings, 상세)과
// 동일한 형식으로 통일.
function formatFullDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${m[1]}.${m[2]}.${m[3]}`;
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
    <div data-section="top-trades">
      <div className="mb-4">
        <h2 className="text-headline-lg text-text-primary">
          전국 실거래가 TOP {trades.length}
        </h2>
        <p className="mt-1 text-body-md text-text-tertiary">
          최근 2일 거래 · 거래금액 상위 · 출처: 국토교통부
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {trades.map((trade, i) => {
          const rank = i + 1;
          return (
            <article
              key={trade.id}
              className="bg-bg-card rounded-xl px-4 py-3 lg:px-6 lg:py-4 animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-4 lg:items-center lg:gap-6">
                <span
                  className={[
                    'shrink-0 leading-none tabular-nums',
                    rankColor(rank),
                  ].join(' ')}
                  aria-label={`${rank}위`}
                >
                  {/* viewport 별 사이즈 분기 — text-headline-* 가 plain CSS 클래스라 lg: variant 가 토글되지 않음. */}
                  <span className="text-headline-lg lg:hidden">{rank}</span>
                  <span className="hidden lg:inline text-headline-sm">{rank}</span>
                </span>

                <div className="flex-1 min-w-0">
                  {/* ── Mobile: stack with date+price shared baseline row ───────────── */}
                  {/* 타이틀/가격 모두 한 단계 톤다운(body-lg semibold). 가격을 date 와 같은 row 에 */}
                  {/* baseline 정렬해 위 size·floor row 와의 시각적 밀착 해소. */}
                  {/* pt-1 로 텍스트 섹션만 상단 여백 확보 — rank 는 article 의 py-3 그대로. */}
                  <div className="flex flex-col gap-2 pt-1 lg:hidden">
                    <p className="text-body-lg font-semibold text-text-primary line-clamp-2">
                      {trade.aptName}
                    </p>

                    <div className="flex items-center gap-1 text-body-sm text-text-secondary">
                      <MapPin
                        size={14}
                        className="text-text-tertiary shrink-0"
                        aria-hidden="true"
                      />
                      <span className="truncate">{trade.region}</span>
                    </div>

                    {(trade.area || trade.floor !== undefined) && (
                      <div className="flex flex-wrap items-center gap-x-1.5 text-body-sm text-text-secondary">
                        {trade.area && (
                          <span className="inline-flex items-center gap-1">
                            <Ruler size={14} className="text-text-tertiary shrink-0" aria-hidden="true" />
                            {trade.area}
                          </span>
                        )}
                        {trade.area && trade.floor !== undefined && <Dot />}
                        {trade.floor !== undefined && (
                          <span className="inline-flex items-center gap-1">
                            <Layers size={14} className="text-text-tertiary shrink-0" aria-hidden="true" />
                            {trade.floor}층
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-1 text-body-sm text-text-secondary">
                        <CalendarDays size={14} className="text-text-tertiary shrink-0" aria-hidden="true" />
                        {formatFullDate(trade.dealDate)}
                      </div>
                      <p className="shrink-0 text-body-lg font-semibold text-brand-primary-700 tabular-nums">
                        {trade.dealAmount}
                      </p>
                    </div>
                  </div>

                  {/* ── Desktop: 2-line layout (title+price / single meta row) ── */}
                  {/* 타이틀 / 가격 둘 다 body-lg + semibold (16px / 600) — headline-sm(20/700) 보단 한 단계 톤다운. */}
                  <div className="hidden lg:block">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-body-lg font-semibold text-text-primary truncate">
                        {trade.aptName}
                      </p>
                      <p className="shrink-0 text-body-lg font-semibold text-brand-primary-700 tabular-nums">
                        {trade.dealAmount}
                      </p>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-body-sm text-text-secondary">
                      <span className="inline-flex items-center gap-1">
                        <MapPin
                          size={14}
                          className="text-text-tertiary"
                          aria-hidden="true"
                        />
                        {trade.region}
                      </span>
                      {trade.area && (
                        <>
                          <Dot />
                          <span className="inline-flex items-center gap-1">
                            <Ruler
                              size={14}
                              className="text-text-tertiary"
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
                              size={14}
                              className="text-text-tertiary"
                              aria-hidden="true"
                            />
                            {trade.floor}층
                          </span>
                        </>
                      )}
                      <Dot />
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={14} className="text-text-tertiary" aria-hidden="true" />
                        {formatFullDate(trade.dealDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
