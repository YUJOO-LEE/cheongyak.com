import type { MetadataRoute } from 'next';
import { fetchAptSalesList } from '@/features/listings/lib/apt-sales-query';
import { PAGE_SIZE } from '@/features/listings/lib/listings-search-params';
import { SITE_URL } from '@/shared/lib/seo';

/**
 * Build the sitemap from the live `/apt-sales` list. Runs at build time
 * and at revalidation, so stale IDs self-heal within the ISR window.
 *
 * Three groups of URLs are emitted:
 *
 *   1. Static routes (home, listings, trades, about, terms).
 *   2. Listings pagination URLs (`?page=2…N`) — added so each
 *      paginated view is its own indexable URL. SSR + ISR makes these
 *      meaningful targets: each one server-renders the matching slice
 *      with full RealEstateListing JSON-LD.
 *   3. One detail URL per listing the backend returns (capped at the
 *      backend's `size: 100` for now; revisit when volume warrants).
 *
 * On any error we still emit the static routes so a transient backend
 * outage doesn't blow up the build.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/listings`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/trades`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/terms`, lastModified: new Date('2026-04-26'), changeFrequency: 'yearly', priority: 0.3 },
  ];

  let listingsPaginationRoutes: MetadataRoute.Sitemap = [];
  let subscriptionRoutes: MetadataRoute.Sitemap = [];
  try {
    const envelope = await fetchAptSalesList(
      { page: 0, size: 100 },
      { next: { revalidate: 300 } } as RequestInit,
    );
    const data = envelope.data.data;
    const items = data?.items ?? [];
    const totalCount = data?.totalCount ?? items.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    // Pages 2…N. Page 1 is already covered by the bare `/listings`
    // entry in `staticRoutes`. Priority decays mildly so the first
    // page is still the canonical entry point.
    listingsPaginationRoutes = Array.from({ length: totalPages - 1 }, (_, i) => {
      const page = i + 2;
      return {
        url: `${SITE_URL}/listings?page=${page}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.6,
      };
    });

    subscriptionRoutes = items.map((item) => ({
      url: `${SITE_URL}/listings/${item.id}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));
  } catch {
    // swallow — sitemap must still publish the static routes
  }

  return [...staticRoutes, ...listingsPaginationRoutes, ...subscriptionRoutes];
}
