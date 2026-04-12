import Link from 'next/link';
import { ArrowRight, TrendingUp, Building2, Ruler, Banknote, Calendar } from 'lucide-react';
import { StatusChip, TypeChip } from '@/shared/components';
import { formatDateRange } from '@/shared/lib/format';
import type { Subscription, MarketInsight } from '@/shared/types/api';

interface HomeHeroProps {
  featured: Subscription;
  insights: MarketInsight[];
}

export function HomeHero({ featured, insights }: HomeHeroProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Featured subscription card */}
      <div className="lg:col-span-2 bg-brand-primary-500 text-text-on-dark rounded-xl p-6 lg:p-8">
        <p className="text-label-md text-text-on-dark-muted mb-2 animate-fade-in-up">
          지금 뜨는 청약
        </p>
        <h3 className="text-headline-lg text-text-on-dark mb-2 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
          {featured.name}
        </h3>
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-1.5">
            <StatusChip status={featured.status} size="sm" />
            <TypeChip type={featured.type} size="sm" />
          </div>
          <p className="text-caption text-text-on-dark-subtle">
            {featured.location.sido} {featured.location.gugun}
            {featured.location.dong && ` ${featured.location.dong}`}
            {' · '}
            {featured.builder}
          </p>
        </div>

        <div className="grid grid-cols-1 min-[375px]:grid-cols-2 gap-3 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
          <SpecBox icon={Building2} label="세대수" value={`${featured.totalUnits.toLocaleString()}세대`} />
          <SpecBox icon={Ruler} label="평형" value={featured.sizeRange} />
          {featured.priceRange && (
            <SpecBox icon={Banknote} label="분양가" value={featured.priceRange} />
          )}
          <SpecBox icon={Calendar} label="접수기간" value={formatDateRange(featured.applicationStart, featured.applicationEnd)} />
        </div>

        <Link
          href={`/listings/${featured.id}`}
          className="group inline-flex items-center gap-1 mt-5 text-label-lg text-text-on-dark-muted hover:text-text-on-dark transition-colors animate-fade-in-up"
          style={{ animationDelay: '220ms' }}
        >
          자세히 보기 <ArrowRight size={16} className="transition-transform duration-fast group-hover:translate-x-0.5" />
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

function SpecBox({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="bg-bg-inverse-subtle rounded-xl px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={14} className="text-icon-inverse" aria-hidden="true" />
        <span className="text-caption text-text-on-dark-subtle">{label}</span>
      </div>
      <p className="text-label-lg text-text-on-dark">{value}</p>
    </div>
  );
}
