import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/shared/components';
import { formatRelativeDate } from '@/shared/lib/format';
import type { NewsArticle } from '@/shared/types/api';

const categoryLabels: Record<string, string> = {
  policy: '정책',
  market: '시장동향',
  analysis: '분석',
  notice: '공지',
};

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  return (
    <Link href={`/news/${article.id}`}>
      <Card variant="news" as="article" className="flex flex-col gap-3">
        {article.thumbnailUrl && (
          <div className="relative w-full aspect-video rounded-md overflow-hidden bg-bg-sunken">
            <Image
              src={article.thumbnailUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-label-md text-brand-primary-700">
              {categoryLabels[article.category] || article.category}
            </span>
            <span className="text-caption text-text-tertiary">
              {formatRelativeDate(article.publishedAt)}
            </span>
          </div>

          <h3 className="text-headline-sm text-text-primary mb-1 line-clamp-2">
            {article.title}
          </h3>

          <p className="text-body-md text-text-secondary line-clamp-3">
            {article.excerpt}
          </p>
        </div>
      </Card>
    </Link>
  );
}
