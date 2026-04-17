import type { MetadataRoute } from 'next';
import { subscriptions } from '@/mocks/fixtures/subscriptions';

const BASE_URL = 'https://cheongyak.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/listings`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  const subscriptionRoutes: MetadataRoute.Sitemap = subscriptions.map((sub) => ({
    url: `${BASE_URL}/listings/${sub.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...subscriptionRoutes];
}
