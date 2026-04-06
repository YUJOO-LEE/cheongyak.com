import type { MetadataRoute } from 'next';
import { subscriptions } from '@/mocks/fixtures/subscriptions';
import { newsArticles } from '@/mocks/fixtures/news';

const BASE_URL = 'https://cheongyak.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/listings`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  const subscriptionRoutes: MetadataRoute.Sitemap = subscriptions.map((sub) => ({
    url: `${BASE_URL}/listings/${sub.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const newsRoutes: MetadataRoute.Sitemap = newsArticles.map((article) => ({
    url: `${BASE_URL}/news/${article.id}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...subscriptionRoutes, ...newsRoutes];
}
