import { Skeleton } from '@/shared/components';

/**
 * Sibling skeleton for `ModelSupplyCards`. Renders a 2-column grid with
 * two placeholder cards so the route fallback matches the desktop grid
 * layout while keeping mobile (1-column) CLS-neutral.
 */
export function ModelSupplyCardsSkeleton() {
  return (
    <ul
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      data-testid="model-supply-cards-skeleton"
    >
      {[0, 1].map((i) => (
        <li
          key={i}
          className="bg-bg-sunken rounded-md p-5 flex flex-col gap-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <Skeleton width={48} height={14} className="mb-2" />
              <Skeleton width="70%" height={22} />
            </div>
            <Skeleton width={64} height={16} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton width="80%" height={40} />
            <Skeleton width="80%" height={40} />
          </div>
          <Skeleton width="100%" height={32} />
          <Skeleton width="100%" height={28} />
        </li>
      ))}
    </ul>
  );
}
