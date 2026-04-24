import { Skeleton } from '@/shared/components';

/**
 * Sibling skeleton for `RegulationChips`. Renders 3 placeholder chips
 * to reserve approximate height — the real component might show 0-8
 * chips, so the skeleton keeps a stable mid-range footprint to avoid
 * CLS when the API resolves.
 */
export function RegulationChipsSkeleton() {
  return (
    <div
      className="flex flex-wrap gap-2"
      data-testid="regulation-chips-skeleton"
    >
      <Skeleton width={96} height={32} className="rounded-md" />
      <Skeleton width={112} height={32} className="rounded-md" />
      <Skeleton width={88} height={32} className="rounded-md" />
    </div>
  );
}
