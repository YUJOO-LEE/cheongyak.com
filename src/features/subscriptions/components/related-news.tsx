import Link from 'next/link';
import { Card } from '@/shared/components';
import { formatRelativeDate } from '@/shared/lib/format';
import type { NewsArticle } from '@/shared/types/api';

const categoryLabels: Record<string, string> = {
  policy: '정책',
  market: '시장동향',
  analysis: '분석',
  notice: '공지',
};

interface RelatedNewsProps {
  articles: NewsArticle[];
}

export function RelatedNews({ articles }: RelatedNewsProps) {
  if (articles.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {articles.map((article) => (
        <Link key={article.id} href={`/news/${article.id}`}>
          <Card variant="compact">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-label-md text-brand-primary-700">
                {categoryLabels[article.category] || article.category}
              </span>
              <span className="text-caption text-text-tertiary">
                {formatRelativeDate(article.publishedAt)}
              </span>
            </div>
            <p className="text-body-md text-text-primary line-clamp-1">
              {article.title}
            </p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
