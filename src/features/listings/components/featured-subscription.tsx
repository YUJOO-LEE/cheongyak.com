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
      <div className="lg:col-span-2 bg-brand-primary-500 text-text-on-dark rounded-xl p-6 lg:p-8">
        <p className="text-label-lg text-text-on-dark-muted mb-2 animate-fade-in-up">접수중인 청약</p>
        <p className="text-display-lg mb-1 animate-count-up-fade" style={{ animationDelay: '100ms' }}>{accepting.length}건</p>
        <p className="text-body-md text-text-on-dark-muted mb-6 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
          {upcoming.length}건 접수 예정
        </p>

        {accepting.length > 0 && (
          <div className="flex flex-col gap-2">
            {accepting.slice(0, 2).map((sub) => (
              <Link
                key={sub.id}
                href={`/listings/${sub.id}`}
                className="group flex items-center justify-between bg-bg-inverse-subtle hover:bg-bg-inverse-hover rounded-xl px-4 py-3.5 transition-all duration-fast active:scale-[0.98]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-label-lg text-text-on-dark truncate">{sub.name}</p>
                  <p className="text-body-sm text-text-on-dark-subtle">
                    {sub.location.sido} {sub.location.gugun} · {formatDateRange(sub.applicationStart, sub.applicationEnd)}
                  </p>
                </div>
                <ArrowRight size={18} className="shrink-0 ml-3 text-icon-inverse transition-transform duration-fast group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        )}

        <Link
          href="/listings"
          className="inline-flex items-center gap-1 mt-4 text-label-lg text-text-on-dark-muted hover:text-text-on-dark transition-colors"
        >
          전체 청약 보기 <ArrowRight size={16} />
        </Link>
      </div>

      {/* Quick stats sidebar */}
      <div className="flex flex-col gap-4">
        {insights.map((insight, i) => (
          <div key={insight.label} className="bg-bg-card rounded-xl p-5 flex-1 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <p className="text-label-md text-text-tertiary mb-1">{insight.label}</p>
            <p className="text-headline-sm text-text-primary">{insight.value}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={14} className={[insight.trend === 'up' ? 'text-danger-500' : 'text-success-500', 'transition-transform duration-fast'].join(' ')} />
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
