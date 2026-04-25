import { Skeleton } from '@/shared/components';

export function SpecialSupplyStatusTableSkeleton() {
  return (
    <div
      className="rounded-md overflow-hidden"
      data-testid="special-supply-status-table-skeleton"
    >
      <div className="bg-bg-sunken px-4 py-3 flex gap-4 min-w-150">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} width={`${100 / 7}%`} height={16} />
        ))}
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={[
            'px-4 py-3 flex gap-4 min-w-150',
            i % 2 === 0 ? 'bg-bg-card' : 'bg-bg-page',
          ].join(' ')}
        >
          {[0, 1, 2, 3, 4, 5, 6].map((j) => (
            <Skeleton key={j} width={`${100 / 7}%`} height={14} />
          ))}
        </div>
      ))}
    </div>
  );
}
