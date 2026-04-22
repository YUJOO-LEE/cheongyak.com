import { Skeleton } from '@/shared/components';

/**
 * Placeholder for `FilterBar` that preserves both the desktop
 * sticky bar and the mobile trigger button so neither viewport
 * shifts when the real bar hydrates.
 */
export function FilterBarSkeleton() {
  return (
    <>
      {/* Mobile: matches FilterBar MobileTrigger wrapper (lg:hidden px-4 py-3 mb-4) */}
      <div className="lg:hidden px-4 py-3 mb-4" aria-hidden="true">
        <Skeleton className="rounded-md" width={96} height={44} />
      </div>

      {/* Desktop: matches FilterBar DesktopBar shell (sticky top-16 …) */}
      <div
        className="hidden lg:flex items-center gap-x-4 gap-y-3 bg-bg-card/80 backdrop-blur-glass px-6 py-3 rounded-lg shadow-sm mb-6"
        aria-hidden="true"
      >
        <Skeleton className="rounded-md" width={140} height={36} />
        <Skeleton className="rounded-md" width={220} height={36} />
        <Skeleton className="rounded-md" width={260} height={36} />
      </div>
    </>
  );
}
