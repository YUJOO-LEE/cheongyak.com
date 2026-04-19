'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useLockBodyScroll } from '@/shared/hooks/use-lock-body-scroll';
import { useRecentSearches } from '@/features/search/hooks/use-recent-searches';
import { Card, EmptyState, StatusChip } from '@/shared/components';

import { subscriptions } from '@/mocks/fixtures/subscriptions';
import type { Subscription } from '@/shared/types/api';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const { items: recentSearches, add: addRecentSearch, clear: clearRecent } =
    useRecentSearches();
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useSearchResults(debouncedQuery);

  useLockBodyScroll(open, { preserveScrollbarGutter: true });

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) handleClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) handleClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleClose]);

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      if (q.trim()) {
        addRecentSearch(q.trim());
      }
    },
    [addRecentSearch],
  );

  const handleClearRecent = useCallback(() => {
    clearRecent();
  }, [clearRecent]);

  const handleNavigate = useCallback(
    (href: string) => {
      handleClose();
      router.push(href);
    },
    [handleClose, router],
  );

  if (!open) return null;

  const showResults = debouncedQuery.trim().length > 0;
  const hasResults = results.subscriptions.length > 0;

  return (
    <div className="fixed inset-0 z-modal" role="dialog" aria-modal="true" aria-label="검색">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg-inverse/25 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative mx-4 sm:mx-auto max-w-160 mt-[8vh] sm:mt-[12vh] bg-bg-card rounded-xl shadow-lg max-h-[75vh] flex flex-col overflow-hidden animate-slide-up">
        {/* Search Input */}
        <div className="relative flex items-center bg-bg-sunken/50 shrink-0">
          <SearchIcon
            size={20}
            className="absolute left-4 text-text-tertiary"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) handleSearch(query);
            }}
            placeholder="청약명, 지역, 건설사 검색..."
            className="w-full h-14 pl-12 pr-10 bg-transparent text-body-lg placeholder:text-text-tertiary focus:outline-none"
          />
          <button
            onClick={handleClose}
            className="absolute right-4 text-text-tertiary hover:text-text-secondary cursor-pointer"
            aria-label="검색 닫기"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results / Recent */}
        <div className="flex-1 overflow-y-auto p-4">
          {showResults ? (
            hasResults ? (
              <div className="flex flex-col gap-6">
                {results.subscriptions.length > 0 && (
                  <section>
                    <h2 className="text-label-lg text-text-secondary mb-2">
                      청약 ({results.subscriptions.length})
                    </h2>
                    <div className="flex flex-col gap-2">
                      {results.subscriptions.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => handleNavigate(`/listings/${sub.id}`)}
                          className="w-full text-left cursor-pointer"
                        >
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
                              <StatusChip status={sub.status} />
                            </div>
                          </Card>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <EmptyState size="sm">
                <p className="text-body-lg text-text-secondary mb-2">
                  &ldquo;{debouncedQuery}&rdquo;에 대한 검색 결과가 없습니다.
                </p>
                <p className="text-body-md text-text-tertiary">
                  다른 키워드로 검색하거나, 청약명/지역명/건설사명을 입력해 보세요.
                </p>
              </EmptyState>
            )
          ) : recentSearches.length > 0 ? (
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-sunken text-body-md text-text-secondary hover:bg-chip-bg-hover transition-colors cursor-pointer"
                  >
                    <Clock size={14} aria-hidden="true" />
                    {q}
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <EmptyState size="sm">
              <p className="text-body-md text-text-tertiary">
                검색어를 입력하세요
              </p>
              <p className="text-caption text-text-tertiary mt-1">
                <kbd className="px-1.5 py-0.5 bg-bg-sunken rounded text-caption">⌘K</kbd> 로 언제든 열 수 있습니다
              </p>
            </EmptyState>
          )}
        </div>
      </div>
    </div>
  );
}

function useSearchResults(query: string): { subscriptions: Subscription[] } {
  if (!query.trim()) return { subscriptions: [] };

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

  return { subscriptions: matchedSubscriptions };
}
