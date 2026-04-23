import { Card, Skeleton } from '@/shared/components';

/**
 * Mirrors the structural rhythm of `SubscriptionCard`:
 * chip row → headline → three info lines → meta line.
 * Heights and spacings match the real card so the grid does
 * not shift when data resolves.
 */
export function SubscriptionCardSkeleton() {
  return (
    <Card
      variant="subscription"
      interactive={false}
      data-testid="subscription-card-skeleton"
    >
      <div className="flex items-center gap-2 mb-3">
        <Skeleton width={56} height={24} className="rounded-full" />
        <Skeleton width={64} height={24} className="rounded-full" />
      </div>

      <Skeleton height={24} className="mb-2" width="75%" />

      <div className="flex flex-col gap-1.5 mb-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Skeleton variant="circle" width={16} height={16} />
            <Skeleton height={16} width={i === 1 ? '45%' : '70%'} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Skeleton height={14} width={72} />
        <Skeleton height={14} width={96} />
      </div>
    </Card>
  );
}
