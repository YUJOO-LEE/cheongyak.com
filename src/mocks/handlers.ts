import { http, HttpResponse } from 'msw';
import { subscriptions, subscriptionDetail } from './fixtures/subscriptions';
import { newsArticles } from './fixtures/news';
import { marketInsights } from './fixtures/insights';
import { filterOptions } from './fixtures/filters';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const handlers = [
  // Featured subscription
  http.get(`${API_BASE}/subscriptions/featured`, () => {
    return HttpResponse.json(subscriptions[0]);
  }),

  // Weekly schedule
  http.get(`${API_BASE}/subscriptions/weekly`, () => {
    const weekly = subscriptions.filter((s) => s.status !== 'closed');
    return HttpResponse.json(weekly);
  }),

  // Subscription list (paginated)
  http.get(`${API_BASE}/subscriptions`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const perPage = 20;
    const status = url.searchParams.get('status');
    const region = url.searchParams.get('region');

    let filtered = [...subscriptions];
    if (status) filtered = filtered.filter((s) => s.status === status);
    if (region) filtered = filtered.filter((s) => s.location.sido === region);

    const total = filtered.length;
    const items = filtered.slice((page - 1) * perPage, page * perPage);

    return HttpResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / perPage),
    });
  }),

  // Subscription detail
  http.get(`${API_BASE}/subscriptions/:id`, ({ params }) => {
    const { id } = params;
    if (id === subscriptionDetail.id) {
      return HttpResponse.json(subscriptionDetail);
    }
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) {
      return HttpResponse.json(
        { status: 404, code: 'LISTING_NOT_FOUND', message: '해당 청약 정보를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ ...subscriptionDetail, ...sub });
  }),

  // Market insights
  http.get(`${API_BASE}/insights/summary`, () => {
    return HttpResponse.json(marketInsights);
  }),

  // News list (paginated)
  http.get(`${API_BASE}/news`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const category = url.searchParams.get('category');
    const limit = Number(url.searchParams.get('limit') || '15');
    const exclude = url.searchParams.get('exclude');

    let filtered = [...newsArticles];
    if (category && category !== 'all') {
      filtered = filtered.filter((n) => n.category === category);
    }
    if (exclude) {
      filtered = filtered.filter((n) => n.id !== exclude);
    }

    const total = filtered.length;
    const items = filtered.slice((page - 1) * limit, page * limit);

    return HttpResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  }),

  // News detail
  http.get(`${API_BASE}/news/:id`, ({ params }) => {
    const article = newsArticles.find((n) => n.id === params.id);
    if (!article) {
      return HttpResponse.json(
        { status: 404, code: 'ARTICLE_NOT_FOUND', message: '해당 기사를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }
    return HttpResponse.json(article);
  }),

  // Filter options
  http.get(`${API_BASE}/filters/regions`, () => {
    return HttpResponse.json(filterOptions.regions);
  }),

  http.get(`${API_BASE}/filters/builders`, () => {
    return HttpResponse.json(filterOptions.builders);
  }),

  // Search
  http.get(`${API_BASE}/search`, ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').toLowerCase();

    const matchedSubscriptions = subscriptions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.location.sido.includes(q) ||
        s.location.gugun.includes(q) ||
        s.builder.toLowerCase().includes(q),
    );

    const matchedNews = newsArticles.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q),
    );

    return HttpResponse.json({
      subscriptions: matchedSubscriptions.slice(0, 5),
      news: matchedNews.slice(0, 5),
    });
  }),
];
