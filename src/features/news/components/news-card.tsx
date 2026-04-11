import Link from 'next/link';
import Image from 'next/image';
import { Newspaper } from 'lucide-react';
import { Card } from '@/shared/components';
import { formatRelativeDate } from '@/shared/lib/format';
import { NEWS_CATEGORY_LABELS } from '@/shared/lib/constants';
import type { NewsArticle } from '@/shared/types/api';

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  return (
    <Link href={`/news/${article.id}`}>
      <Card variant="news" as="article" className="flex flex-row gap-4 h-full">
        {/* Thumbnail or placeholder — fixed size */}
        <div className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-bg-sunken">
          {article.thumbnailUrl ? (
            <Image
              src={article.thumbnailUrl}
              alt=""
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-brand-primary-50">
              <Newspaper size={24} className="text-brand-primary-300" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-label-md text-brand-primary-600">
              {NEWS_CATEGORY_LABELS[article.category as keyof typeof NEWS_CATEGORY_LABELS] || article.category}
            </span>
            <span className="text-caption text-text-tertiary">
              {formatRelativeDate(article.publishedAt)}
            </span>
          </div>

          <h3 className="text-body-lg text-text-primary mb-1 line-clamp-2">
            {article.title}
          </h3>

          <p className="text-body-sm text-text-secondary line-clamp-1">
            {article.excerpt}
          </p>
        </div>
      </Card>
    </Link>
  );
}
