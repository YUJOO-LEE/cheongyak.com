import { Skeleton } from '@/shared/components';

/**
 * Mirrors `WeeklySchedule` dual layout:
 * - Mobile: 7-button day selector row + single day's listings area
 * - Desktop: `grid-cols-5` with header + stacked cards per column
 *
 * Keeps the same fixed heights as the real component so the
 * schedule band does not shift when data resolves.
 */
export function WeeklyScheduleSkeleton() {
  return (
    <>
      {/* ── Mobile ─────────────────────────────────────── */}
      <div className="lg:hidden" aria-hidden="true">
        <div className="flex gap-2 mb-4">
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl bg-bg-card"
            >
              <Skeleton width={28} height={14} />
              <Skeleton width={36} height={12} />
              <Skeleton width={24} height={12} />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="bg-bg-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-2.5">
                <Skeleton className="rounded-full" width={56} height={20} />
                <Skeleton width={96} height={12} />
              </div>
              <Skeleton className="mb-2.5" width="70%" height={22} />
              <div className="flex flex-col gap-1 mb-3">
                <Skeleton width="60%" height={16} />
                <Skeleton width="40%" height={16} />
              </div>
              <Skeleton width={120} height={12} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Desktop ────────────────────────────────────── */}
      <div className="hidden lg:grid grid-cols-5 gap-6" aria-hidden="true">
        {Array.from({ length: 5 }, (_, col) => (
          <div key={col}>
            <div className="text-center mb-3 flex flex-col items-center gap-1">
              <Skeleton width={40} height={18} />
              <Skeleton width={56} height={12} />
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 2 }, (_, row) => (
                <div key={row} className="rounded-lg bg-bg-card p-3">
                  <Skeleton
                    className="rounded-full mb-2"
                    width={56}
                    height={20}
                  />
                  <Skeleton className="mb-2" width="80%" height={16} />
                  <div className="flex flex-col gap-1 mb-2">
                    <Skeleton width="70%" height={14} />
                    <Skeleton width="55%" height={14} />
                  </div>
                  <Skeleton width="50%" height={12} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
