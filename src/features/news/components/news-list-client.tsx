'use client';

import { useState, useMemo } from 'react';
import { CategoryTabs } from './category-tabs';
import { NewsCard } from './news-card';
import { Pagination } from '@/shared/components';
import type { NewsArticle } from '@/shared/types/api';

const categories = [
  { value: 'all', label: '전체' },
  { value: 'policy', label: '정책' },
  { value: 'market', label: '시장동향' },
  { value: 'analysis', label: '분석' },
  { value: 'notice', label: '공지' },
];

interface NewsListClientProps {
  articles: NewsArticle[];
}

const ITEMS_PER_PAGE = 15;

export function NewsListClient({ articles }: NewsListClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    if (selectedCategory === 'all') return articles;
    return articles.filter((a) => a.category === selectedCategory);
  }, [articles, selectedCategory]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  function handleCategoryChange(category: string) {
    setSelectedCategory(category);
    setCurrentPage(1);
  }

  return (
    <>
      <div className="sticky top-0 lg:top-16 z-dropdown bg-bg-page/80 backdrop-blur-[20px] px-4 lg:px-0 py-3 mb-6">
        <CategoryTabs
          categories={categories}
          selected={selectedCategory}
          onChange={handleCategoryChange}
        />
      </div>

      <div className="max-w-180 mx-auto px-4 lg:px-0">
        {paged.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-body-lg text-text-secondary">
              해당 카테고리에 기사가 없습니다.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {paged.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseHref={`/news${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`}
          className="mt-8"
        />
      </div>
    </>
  );
}
