import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Flame,
  Building2,
  Ruler,
  Banknote,
  Calendar,
} from 'lucide-react';
import { StatusChip, TypeChip } from '@/shared/components';
import { formatDateRange } from '@/shared/lib/format';
import type { Subscription, MarketInsight } from '@/shared/types/api';

interface HomeHeroProps {
  featured: Subscription | null;
  insights: MarketInsight[];
}

// 시각적 노이즈 줄이고 지표 하나하나 눈에 띄게 모두 danger(빨강) 톤으로 통일.
const INSIGHT_ACCENT = 'text-danger-500';

// flat = "인기 지역" 처럼 방향성 없는 하이라이트 지표 — 불꽃 아이콘으로 강조.
function TrendIcon({ trend, className }: { trend: MarketInsight['trend']; className: string }) {
  if (trend === 'up') return <TrendingUp size={14} className={className} aria-hidden="true" />;
  if (trend === 'down') return <TrendingDown size={14} className={className} aria-hidden="true" />;
  return <Flame size={14} className={className} aria-hidden="true" />;
}

function InsightCard({ insight, index }: { insight: MarketInsight; index: number }) {
  return (
    <div
      className="bg-bg-card rounded-xl p-5 flex-1 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <p className="text-label-md text-text-tertiary mb-1">{insight.label}</p>
      <p className="text-headline-sm text-text-primary">{insight.value}</p>
      <div className="flex items-center gap-1 mt-1">
        <TrendIcon
          trend={insight.trend}
          className={[INSIGHT_ACCENT, 'transition-transform duration-fast'].join(' ')}
        />
        <span className={['text-body-sm', INSIGHT_ACCENT].join(' ')}>
          {insight.trendValue}
        </span>
      </div>
    </div>
  );
}

export function HomeHero({ featured, insights }: HomeHeroProps) {
  // featured 가 없을 때(서버 장애 등)는 insights 만 가로 3-column 으로 노출.
  if (!featured) {
    return insights.length > 0 ? (
      <div
        data-section="home-hero"
        className="grid grid-cols-1 min-[600px]:grid-cols-3 gap-4"
      >
        {insights.map((insight, i) => (
          <InsightCard key={insight.label} insight={insight} index={i} />
        ))}
      </div>
    ) : null;
  }

  return (
    <div
      data-section="home-hero"
      className="grid grid-cols-1 lg:grid-cols-3 gap-4"
    >
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
          {/* 위클리 카드 주소(text-body-sm = 12px)와 동일 사이즈. 타이틀/세대수와 동일한 on-dark 흰색. */}
          <p className="text-body-sm text-text-on-dark">
            {featured.location.sido} {featured.location.gugun}
            {featured.location.dong && ` ${featured.location.dong}`}
            {' · '}
            {featured.builder}
          </p>
        </div>

        <div className="grid grid-cols-1 min-[375px]:grid-cols-2 gap-3 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
          <SpecBox icon={Building2} label="세대수" value={`${featured.totalUnits.toLocaleString()}세대`} />
          <SpecBox icon={Ruler} label="공급면적" value={featured.sizeRange} />
          {featured.priceRange && (
            <SpecBox icon={Banknote} label="분양가" value={featured.priceRange} />
          )}
          <SpecBox icon={Calendar} label="접수기간" value={formatDateRange(featured.applicationStart, featured.applicationEnd)} />
        </div>

        <Link
          href={`/listings/${featured.id}`}
          prefetch={false}
          className="group inline-flex items-center gap-1 mt-5 text-label-lg text-text-on-dark-muted hover:text-text-on-dark transition-colors animate-fade-in-up"
          style={{ animationDelay: '220ms' }}
        >
          자세히 보기 <ArrowRight size={16} className="transition-transform duration-fast group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Quick stats sidebar */}
      <div className="flex flex-col gap-4">
        {insights.map((insight, i) => (
          <InsightCard key={insight.label} insight={insight} index={i} />
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
