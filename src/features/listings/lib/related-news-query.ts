/**
 * Related-news fetcher for the listing detail page.
 *
 * Wraps the orval-generated `getAptSalesNews` (`GET /apt-sales/{id}/news`,
 * tag `청약`) with an SSR-friendly entry that pins ISR at 300 s — same
 * window as the parent detail page in `ARCHITECTURE.md` §3, so a single
 * revalidation refreshes both the apartment data and its news sidecar.
 *
 * Failure mode is deliberately soft: 4xx → empty list (the listing page
 * still renders, the section just hides), 5xx propagates so the route
 * ErrorBoundary can decide. The 6 h backend cache (per the Swagger
 * description) lives below this layer; we don't double-cache.
 */
import { getAptSalesNews } from '@/shared/api/generated/endpoints';
import type { NewsItem } from '@/shared/api/generated/schemas/newsItem';
import { ApiClientError } from '@/shared/lib/api-client';

export async function fetchRelatedNewsSSR(
  listingId: number,
): Promise<NewsItem[]> {
  try {
    // Next augments RequestInit with `next` at runtime but the lib type
    // doesn't include it on `RequestInit` directly, so cast at the call
    // site (mirrors `fetchAptSalesListSSR` in apt-sales-query.ts).
    const envelope = await getAptSalesNews(listingId, {
      next: { revalidate: 300 },
    } as RequestInit);

    return envelope.data?.data?.items ?? [];
  } catch (err) {
    // 404 / 410 — listing has no related-news binding. Render empty,
    // not error: news is supplementary, not load-bearing.
    if (
      err instanceof ApiClientError &&
      (err.status === 404 || err.status === 410)
    ) {
      return [];
    }
    throw err;
  }
}
