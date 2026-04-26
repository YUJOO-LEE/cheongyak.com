/**
 * Related-news fetcher for the listing detail page.
 *
 * Calls a planned, listing-scoped news endpoint that lives outside the
 * `/apt-sales/{id}` envelope (per PAGES.md §3.5). The endpoint path is
 * not yet finalized — see TODO(api-pending) below. Until the backend
 * ships, MSW serves a fixture so the UI can be designed and verified
 * locally; production builds receive an empty array (no MSW), which
 * gracefully hides the section.
 *
 * Failure mode is deliberately soft: 4xx → empty list (the listing page
 * still renders), 5xx propagates so the route ErrorBoundary can decide.
 * Zod parses item-by-item and silently drops malformed rows so a single
 * bad payload doesn't take down the whole section.
 */
import { z } from 'zod';
import { ApiClientError, apiClientMutator } from '@/shared/lib/api-client';
import {
  RelatedNewsItemSchema,
  type RelatedNewsItem,
} from '@/shared/types/api';

// TODO(api-pending): confirm path with backend. Current best guess
// follows the listing-scoped sub-resource convention used by
// `/apt-sales/{id}`. Update both this constant and the matching MSW
// handler in `src/mocks/handlers.ts` together.
function buildPath(listingId: number): string {
  return `/apt-sales/${listingId}/related-news`;
}

type Envelope = {
  data: { data: unknown };
  status: number;
  headers: Headers;
};

export async function fetchRelatedNewsSSR(
  listingId: number,
): Promise<RelatedNewsItem[]> {
  // TODO(api-pending): remove this dev-only branch once the backend
  // endpoint ships. The local API base points at the real backend, so
  // until the route exists we'd otherwise 404 in dev too — and the
  // section would render empty during design review. Production keeps
  // the real-fetch path, so a missing prod endpoint still hides the
  // section gracefully (4xx → []).
  if (process.env.NODE_ENV === 'development') {
    const { relatedNewsFixture } = await import(
      '@/mocks/fixtures/related-news'
    );
    return relatedNewsFixture;
  }

  try {
    const envelope = await apiClientMutator<Envelope>(buildPath(listingId), {
      method: 'GET',
      // ISR cycle matches the parent detail page (300s, see
      // ARCHITECTURE.md §3 rendering table). Keeping them aligned means
      // a single revalidation refreshes both the apartment data and its
      // news sidecar — no split staleness.
      next: { revalidate: 300 },
    } as RequestInit & { next?: { revalidate?: number } });

    const raw = envelope.data?.data;
    return z
      .array(RelatedNewsItemSchema)
      .catch([])
      .parse(Array.isArray(raw) ? raw : []);
  } catch (err) {
    // 404 / 410 — listing has no related-news binding yet. Render empty,
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
