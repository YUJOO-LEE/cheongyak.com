import type { MetadataRoute } from 'next';
import { fetchAptSalesList } from '@/features/listings/lib/apt-sales-query';
import { SITE_URL } from '@/shared/lib/seo';

/**
 * Build the sitemap from the live `/apt-sales` list. Runs at build time
 * and at revalidation, so stale IDs self-heal within the ISR window.
 *
 * The backend caps `size` at 100; for current listing volumes that's
 * enough. When it's not, we can page through or ask for a dedicated
 * sitemap endpoint. On any error we still emit the static routes so a
 * transient outage doesn't blow up the build.
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

  let subscriptionRoutes: MetadataRoute.Sitemap = [];
  try {
    const envelope = await fetchAptSalesList(
      { page: 0, size: 100 },
      { next: { revalidate: 300 } } as RequestInit,
    );
    const items = envelope.data.data?.items ?? [];
    subscriptionRoutes = items.map((item) => ({
      url: `${SITE_URL}/listings/${item.id}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));
  } catch {
    // swallow — sitemap must still publish the static routes
  }

  return [...staticRoutes, ...subscriptionRoutes];
}
