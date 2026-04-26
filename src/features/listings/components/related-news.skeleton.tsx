import { Skeleton } from '@/shared/components';

export function RelatedNewsSkeleton() {
  return (
    <div
      className="bg-bg-card rounded-lg p-3 md:p-4"
      data-testid="related-news-skeleton"
    >
      <div className="flex flex-col">
        {[0, 1, 2].map((i) => (
          <div key={i} className="px-3 py-3">
            <div className="flex items-center gap-1">
              <Skeleton width={128} height={12} />
              {/* Touch-device-only inline new-tab cue mirrors the real
                  row — desktop hover icon lives off-rest, so the
                  skeleton omits a right-side placeholder there. */}
              <Skeleton
                width={10}
                height={10}
                className="hidden pointer-coarse:block"
              />
            </div>
            <Skeleton className="mt-1.5" height={20} />
            <Skeleton width="75%" height={20} className="mt-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
}
