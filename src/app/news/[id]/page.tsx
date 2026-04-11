import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleBody } from '@/features/news/components/article-body';
import { RelatedSubscriptions } from '@/features/news/components/related-subscriptions';
import { NewsCard } from '@/features/news/components/news-card';
import { NewsArticleJsonLd } from '@/shared/components/json-ld';
import { formatDate } from '@/shared/lib/format';
import { NEWS_CATEGORY_LABELS } from '@/shared/lib/constants';
import { newsArticles } from '@/mocks/fixtures/news';
import { subscriptions } from '@/mocks/fixtures/subscriptions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return newsArticles.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const article = newsArticles.find((a) => a.id === id);
  if (!article) return { title: '기사를 찾을 수 없습니다' };

  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { id } = await params;
  const article = newsArticles.find((a) => a.id === id);

  if (!article) notFound();

  const relatedSubs = article.relatedSubscriptionIds
    ? subscriptions.filter((s) => article.relatedSubscriptionIds!.includes(s.id))
    : [];

  const moreArticles = newsArticles
    .filter((a) => a.id !== id && a.category === article.category)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-180 px-4 lg:px-8 py-6 lg:py-10">
      <NewsArticleJsonLd
        title={article.title}
        description={article.excerpt}
        url={`https://cheongyak.com/news/${id}`}
        publishedAt={article.publishedAt}
      />

      {/* Article Header */}
      <header className="mb-8">
        <span className="text-label-lg text-brand-primary-700 mb-2 block">
          {NEWS_CATEGORY_LABELS[article.category as keyof typeof NEWS_CATEGORY_LABELS] || article.category}
        </span>
        <h1 className="text-display-sm text-text-primary mb-3">
          {article.title}
        </h1>
        <time className="text-body-md text-text-tertiary">
          {formatDate(article.publishedAt)}
        </time>
      </header>

      {/* Article Body */}
      {article.body && (
        <section className="mb-10">
          <ArticleBody html={article.body} />
        </section>
      )}

      {/* Related Subscriptions */}
      {relatedSubs.length > 0 && (
        <section className="mb-10">
          <RelatedSubscriptions subscriptions={relatedSubs} />
        </section>
      )}

      {/* More Articles */}
      {moreArticles.length > 0 && (
        <section className="mb-10">
          <h2 className="text-headline-sm text-text-primary mb-4">
            관련 기사
          </h2>
          <div className="flex flex-col gap-6">
            {moreArticles.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
