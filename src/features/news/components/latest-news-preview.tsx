import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/shared/components';
import { formatRelativeDate } from '@/shared/lib/format';
import { NEWS_CATEGORY_LABELS } from '@/shared/lib/constants';
import type { NewsArticle } from '@/shared/types/api';

interface LatestNewsPreviewProps {
  articles: NewsArticle[];
}

export function LatestNewsPreview({ articles }: LatestNewsPreviewProps) {
  return (
    <div className="flex flex-col gap-4">
      {articles.map((article) => (
        <Link key={article.id} href={`/news/${article.id}`}>
          <Card variant="news" className="flex gap-4">
            {article.thumbnailUrl && (
              <div className="shrink-0 w-20 h-20 rounded-md overflow-hidden bg-bg-sunken relative">
                <Image
                  src={article.thumbnailUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-label-md text-brand-primary-600">
                  {NEWS_CATEGORY_LABELS[article.category as keyof typeof NEWS_CATEGORY_LABELS] || article.category}
                </span>
                <span className="text-caption text-text-tertiary">
                  {formatRelativeDate(article.publishedAt)}
                </span>
              </div>
              <h3 className="text-body-md text-text-primary line-clamp-2">
                {article.title}
              </h3>
            </div>
          </Card>
        </Link>
      ))}

    </div>
  );
}
