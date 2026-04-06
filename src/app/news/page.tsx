import type { Metadata } from 'next';
import { NewsListClient } from '@/features/news/components/news-list-client';
import { newsArticles } from '@/mocks/fixtures/news';

export const metadata: Metadata = {
  title: '뉴스',
  description: '청약 정책, 시장 동향, 분석 기사, 공지사항을 확인하세요.',
};

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-[1200px] py-6 lg:py-10">
      <div className="px-4 lg:px-8 mb-6">
        <h1 className="text-display-sm text-text-primary">뉴스</h1>
      </div>

      <NewsListClient articles={newsArticles} />
    </div>
  );
}
