import type { MetadataRoute } from 'next';
import { subscriptions } from '@/mocks/fixtures/subscriptions';
import { SITE_URL } from '@/shared/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/listings`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/trades`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
  ];

  const subscriptionRoutes: MetadataRoute.Sitemap = subscriptions.map((sub) => ({
    url: `${SITE_URL}/listings/${sub.id}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...subscriptionRoutes];
}
