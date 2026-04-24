import { Skeleton } from '@/shared/components';

export function WinnerScoreTableSkeleton() {
  return (
    <div
      className="rounded-md overflow-hidden"
      data-testid="winner-score-table-skeleton"
    >
      <div className="bg-bg-sunken px-4 py-3 flex gap-4">
        <Skeleton width="25%" height={16} />
        <Skeleton width="25%" height={16} />
        <Skeleton width="15%" height={16} />
        <Skeleton width="15%" height={16} />
        <Skeleton width="15%" height={16} />
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={[
            'px-4 py-3 flex gap-4',
            i % 2 === 0 ? 'bg-bg-card' : 'bg-bg-page',
          ].join(' ')}
        >
          <Skeleton width="25%" height={14} />
          <Skeleton width="25%" height={14} />
          <Skeleton width="15%" height={14} />
          <Skeleton width="15%" height={14} />
          <Skeleton width="15%" height={14} />
        </div>
      ))}
    </div>
  );
}
