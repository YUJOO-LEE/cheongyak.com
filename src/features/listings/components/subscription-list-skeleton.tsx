/**
 * Placeholder skeleton for the Suspense boundary around
 * `SubscriptionListClient`. Renders a static count line plus six
 * card-shaped blocks so the layout stays stable during the first
 * paint (prevents CLS on deep-link refreshes).
 *
 * Tokens only — no raw palette or arbitrary values. The `bg-bg-sunken`
 * tone shift mirrors the empty-state pattern so we do not introduce
 * nested cards (CLAUDE.md §5 memory rule).
 */
export function SubscriptionListSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="px-4 lg:px-0">
      <p className="sr-only">청약 목록을 불러오는 중입니다.</p>
      <div className="h-4 w-24 mb-4 rounded-md bg-bg-sunken animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-lg bg-bg-sunken animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
