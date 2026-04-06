'use client';

import { useState, useCallback } from 'react';
import { Search as SearchIcon, X, Clock } from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { Card, StatusChip } from '@/shared/components';
import { statusToChipStatus } from '@/shared/lib/format';
import { subscriptions } from '@/mocks/fixtures/subscriptions';
import { newsArticles } from '@/mocks/fixtures/news';
import type { Subscription, NewsArticle } from '@/shared/types/api';

const MAX_RECENT = 10;
const STORAGE_KEY = 'cheongyak-recent-searches';

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const recent = getRecentSearches().filter((q) => q !== query);
  recent.unshift(query);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function clearRecentSearches() {
  localStorage.removeItem(STORAGE_KEY);
}

export function SearchPageClient() {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getRecentSearches());
  const debouncedQuery = useDebounce(query, 300);

  const results = useSearchResults(debouncedQuery);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (q.trim()) {
      saveRecentSearch(q.trim());
      setRecentSearches(getRecentSearches());
    }
  }, []);

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const showResults = debouncedQuery.trim().length > 0;
  const hasResults = results.subscriptions.length > 0 || results.news.length > 0;

  return (
    <div className="mx-auto max-w-[720px] px-4 lg:px-8 py-6 lg:py-10">
      {/* Search Input */}
      <div className="relative mb-6">
        <SearchIcon
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) handleSearch(query);
          }}
          placeholder="청약명, 지역, 건설사, 뉴스 검색..."
          className="w-full h-12 pl-12 pr-10 bg-bg-card rounded-lg text-body-lg placeholder:text-text-tertiary focus:outline-none focus-visible:outline-2 focus-visible:outline-brand-primary-500 focus-visible:outline-offset-2"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary cursor-pointer"
            aria-label="검색어 지우기"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Results */}
      {showResults ? (
        hasResults ? (
          <div className="flex flex-col gap-8">
            {results.subscriptions.length > 0 && (
              <section>
                <h2 className="text-label-lg text-text-secondary mb-3">
                  청약 ({results.subscriptions.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {results.subscriptions.map((sub) => (
                    <Link key={sub.id} href={`/subscriptions/${sub.id}`}>
                      <Card variant="compact">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-body-md font-semibold text-text-primary line-clamp-1">
                              {sub.name}
                            </p>
                            <p className="text-body-sm text-text-secondary">
                              {sub.location.sido} {sub.location.gugun} · {sub.builder}
                            </p>
                          </div>
                          <StatusChip status={statusToChipStatus(sub.status)} />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.news.length > 0 && (
              <section>
                <h2 className="text-label-lg text-text-secondary mb-3">
                  뉴스 ({results.news.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {results.news.map((article) => (
                    <Link key={article.id} href={`/news/${article.id}`}>
                      <Card variant="compact">
                        <p className="text-body-md font-semibold text-text-primary line-clamp-1">
                          {article.title}
                        </p>
                        <p className="text-body-sm text-text-secondary line-clamp-1">
                          {article.excerpt}
                        </p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-body-lg text-text-secondary">
              &ldquo;{debouncedQuery}&rdquo;에 대한 검색 결과가 없습니다.
            </p>
          </div>
        )
      ) : (
        /* Recent Searches */
        recentSearches.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-label-lg text-text-secondary">최근 검색어</h2>
              <button
                onClick={handleClearRecent}
                className="text-body-sm text-text-tertiary hover:text-text-secondary cursor-pointer"
              >
                전체 삭제
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSearch(q)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-sunken text-body-md text-text-secondary hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <Clock size={14} aria-hidden="true" />
                  {q}
                </button>
              ))}
            </div>
          </section>
        )
      )}
    </div>
  );
}

function useSearchResults(query: string): {
  subscriptions: Subscription[];
  news: NewsArticle[];
} {
  if (!query.trim()) return { subscriptions: [], news: [] };

  const q = query.toLowerCase();

  const matchedSubscriptions = subscriptions
    .filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.location.sido.includes(q) ||
        s.location.gugun.includes(q) ||
        s.builder.toLowerCase().includes(q),
    )
    .slice(0, 5);

  const matchedNews = newsArticles
    .filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q),
    )
    .slice(0, 5);

  return { subscriptions: matchedSubscriptions, news: matchedNews };
}
