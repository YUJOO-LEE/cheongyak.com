import { Skeleton } from '@/shared/components';

/**
 * Mirrors `TopTrades`: section heading + 5 rank rows, each a
 * card with rank number, title row, and a metadata caption row.
 */
export function TopTradesSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="mb-4">
        <Skeleton className="mb-2" width={220} height={24} />
        <Skeleton width={280} height={16} />
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="bg-bg-card rounded-xl px-4 py-3 lg:px-6 lg:py-4"
          >
            <div className="flex items-start gap-4 lg:items-center lg:gap-6">
              <Skeleton width={20} height={24} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <Skeleton height={18} width="45%" />
                  <Skeleton height={18} width={96} />
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Skeleton width={72} height={12} />
                  <Skeleton width={48} height={12} />
                  <Skeleton width={36} height={12} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
