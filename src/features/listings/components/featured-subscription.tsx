import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { formatDateRange } from '@/shared/lib/format';
import type { Subscription, MarketInsight } from '@/shared/types/api';

interface HomeHeroProps {
  activeSubs: Subscription[];
  insights: MarketInsight[];
}

export function HomeHero({ activeSubs, insights }: HomeHeroProps) {
  const accepting = activeSubs.filter((s) => s.status === 'accepting');
  const upcoming = activeSubs.filter((s) => s.status === 'upcoming');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main stat card */}
      <div className="lg:col-span-2 bg-brand-primary-500 text-neutral-0 rounded-xl p-6 lg:p-8">
        <p className="text-label-lg font-semibold text-neutral-0/70 mb-2">접수중인 청약</p>
        <p className="text-display-lg font-extrabold mb-1">{accepting.length}건</p>
        <p className="text-body-md text-neutral-0/70 mb-6">
          {upcoming.length}건 접수 예정
        </p>

        {accepting.length > 0 && (
          <div className="flex flex-col gap-2">
            {accepting.slice(0, 2).map((sub) => (
              <Link
                key={sub.id}
                href={`/listings/${sub.id}`}
                className="flex items-center justify-between bg-neutral-0/10 hover:bg-neutral-0/15 rounded-xl px-4 py-3.5 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-label-lg font-semibold text-neutral-0 truncate">{sub.name}</p>
                  <p className="text-body-sm text-neutral-0/60">
                    {sub.location.sido} {sub.location.gugun} · {formatDateRange(sub.applicationStart, sub.applicationEnd)}
                  </p>
                </div>
                <ArrowRight size={18} className="shrink-0 ml-3 text-neutral-0/50" />
              </Link>
            ))}
          </div>
        )}

        <Link
          href="/listings"
          className="inline-flex items-center gap-1 mt-4 text-label-lg font-semibold text-neutral-0/80 hover:text-neutral-0 transition-colors"
        >
          전체 청약 보기 <ArrowRight size={16} />
        </Link>
      </div>

      {/* Quick stats sidebar */}
      <div className="flex flex-col gap-4">
        {insights.map((insight) => (
          <div key={insight.label} className="bg-bg-card rounded-xl p-5 flex-1">
            <p className="text-label-md font-semibold text-text-tertiary mb-1">{insight.label}</p>
            <p className="text-headline-sm font-bold text-text-primary">{insight.value}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={14} className={insight.trend === 'up' ? 'text-danger-500' : 'text-success-500'} />
              <span className={['text-body-sm', insight.trend === 'up' ? 'text-danger-500' : 'text-success-500'].join(' ')}>
                {insight.trendValue}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
