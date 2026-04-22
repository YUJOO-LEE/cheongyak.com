import { Skeleton } from '@/shared/components';

/**
 * Mirrors `HomeHero` layout: 2-col featured block on brand primary
 * surface + stacked insight cards on the right. Keeps the same grid
 * (`lg:grid-cols-3`), padding (`p-6 lg:p-8`), and rounded-xl shell
 * so the hero does not shift when data resolves.
 */
export function HomeHeroSkeleton() {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      aria-hidden="true"
    >
      {/* Featured subscription placeholder (2-col on desktop) */}
      <div className="lg:col-span-2 bg-brand-primary-500/70 rounded-xl p-6 lg:p-8">
        <Skeleton className="mb-2 bg-white/30" width={96} height={16} />
        <Skeleton className="mb-2 bg-white/40" width="70%" height={28} />
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5">
            <Skeleton
              className="rounded-full bg-white/30"
              width={56}
              height={20}
            />
            <Skeleton
              className="rounded-full bg-white/30"
              width={64}
              height={20}
            />
          </div>
          <Skeleton className="bg-white/25" width={180} height={14} />
        </div>

        <div className="grid grid-cols-1 min-[375px]:grid-cols-2 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="bg-bg-inverse-subtle rounded-xl px-4 py-3"
            >
              <Skeleton className="mb-1 bg-white/25" width={56} height={12} />
              <Skeleton className="bg-white/40" width="75%" height={18} />
            </div>
          ))}
        </div>

        <Skeleton className="mt-5 bg-white/30" width={100} height={16} />
      </div>

      {/* Insight column (3 stacked cards) */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="bg-bg-card rounded-xl p-5 flex-1">
            <Skeleton className="mb-1" width={80} height={14} />
            <Skeleton className="mb-1" width="60%" height={22} />
            <Skeleton width={72} height={14} />
          </div>
        ))}
      </div>
    </div>
  );
}
