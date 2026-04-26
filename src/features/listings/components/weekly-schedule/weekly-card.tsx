import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { StatusChip, TypeChip } from '@/shared/components';
import type { WeeklySubscription } from '@/shared/types/api';

interface WeeklyCardProps {
  subscription: WeeklySubscription;
  /** 데스크톱 5열 그리드에서 오늘 컬럼은 그림자 강조. 모바일은 day-selector 가
   *  이미 선택 상태를 보여주므로 무시. */
  isToday?: boolean;
  /** 데스크톱에서 과거 컬럼은 톤다운. 모바일은 단일 day 만 노출하므로 무시. */
  isPast?: boolean;
  /** stagger fade-in 인덱스. */
  index?: number;
}

export function WeeklyCard({
  subscription: sub,
  isToday = false,
  isPast = false,
  index = 0,
}: WeeklyCardProps) {
  const region = [sub.location.gugun, sub.location.dong].filter(Boolean).join(' ');

  return (
    <Link
      href={`/listings/${sub.id}`}
      prefetch={false}
      style={{ animationDelay: `${index * 50}ms` }}
      className={[
        'block bg-bg-card animate-fade-in-up',
        // 모바일: rounded-xl + p-4 / 데스크톱: rounded-lg + p-3
        'rounded-xl p-4 lg:rounded-lg lg:p-3',
        'transition-all duration-fast ease-default',
        // 모바일은 탭 피드백 / 데스크톱은 hover lift + active press
        'active:bg-bg-active lg:hover:-translate-y-0.5 lg:hover:shadow-md lg:active:translate-y-0 lg:active:shadow-sm',
        // 데스크톱 그리드 상태 모디파이어 (모바일은 lg: 미적용으로 자연 무시)
        isToday ? 'lg:shadow-md' : '',
        isPast ? 'lg:opacity-80 lg:hover:opacity-100' : '',
      ].join(' ')}
    >
      <div className="flex flex-wrap gap-1 mb-2">
        {sub.phases.map((phase) => (
          <StatusChip key={phase} status={sub.status} label={phase} size="sm" />
        ))}
        <TypeChip type={sub.type} size="sm" />
      </div>

      <h3 className="text-body-lg font-semibold text-text-primary line-clamp-2 mb-2">
        {sub.name}
      </h3>

      {region && (
        <div className="flex items-center gap-1 text-body-sm text-text-secondary">
          <MapPin
            size={14}
            className="text-text-tertiary shrink-0"
            aria-hidden="true"
          />
          <span className="truncate">{region}</span>
        </div>
      )}
    </Link>
  );
}
