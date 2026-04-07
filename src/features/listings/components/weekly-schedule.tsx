import Link from 'next/link';
import { Card, StatusChip } from '@/shared/components';
import { formatDateRange, statusToChipStatus } from '@/shared/lib/format';
import type { Subscription } from '@/shared/types/api';

interface WeeklyScheduleProps {
  subscriptions: Subscription[];
}

export function WeeklySchedule({ subscriptions }: WeeklyScheduleProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-body-md text-text-secondary">
          이번 주 예정된 청약이 없습니다.
        </p>
        <Link
          href="/listings"
          className="inline-block mt-2 text-label-lg text-interactive-default hover:text-interactive-hover transition-colors"
        >
          전체 청약 보기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible">
      {subscriptions.map((sub) => (
        <Link
          key={sub.id}
          href={`/listings/${sub.id}`}
          className="snap-start shrink-0 w-70 lg:w-auto"
        >
          <Card variant="compact" className="h-full">
            <StatusChip status={statusToChipStatus(sub.status)} className="mb-2" />
            <h3 className="text-headline-sm text-text-primary mb-1 line-clamp-1">
              {sub.name}
            </h3>
            <p className="text-body-sm text-text-secondary mb-2 line-clamp-1">
              {sub.location.sido} {sub.location.gugun}
            </p>
            <p className="text-caption text-text-tertiary">
              {formatDateRange(sub.applicationStart, sub.applicationEnd)}
            </p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
