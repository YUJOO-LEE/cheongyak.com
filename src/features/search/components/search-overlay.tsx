'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Search as SearchIcon, X, RotateCcw, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcut';
import { useLockBodyScroll } from '@/shared/hooks/use-lock-body-scroll';
import { useRecentSearches } from '@/features/search/hooks/use-recent-searches';
import {
  useSearchResults,
  SEARCH_MAX_QUERY_LENGTH,
} from '@/features/search/hooks/use-search-results';
import { EmptyState, Skeleton, StatusChip } from '@/shared/components';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const DEBOUNCE_MS = 350;
const CLOSE_ANIMATION_MS = 150; // Mirrors --duration-fast.

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  // Single state stream: every keystroke (including IME-composing jamo)
  // updates `query`, debounced into the search hook. We do NOT gate on
  // `compositionend` because:
  //   1. The overlay searches on every change, not on Enter — the classic
  //      "double-fire on the last syllable when Enter commits the IME" bug
  //      simply does not apply here.
  //   2. Holding the request back until compositionend made fully-typed
  //      Korean queries (e.g. "푸르") look stuck in the "type 2+ chars"
  //      hint when the user paused mid-composition.
  // Same-keyword spam is already absorbed by TanStack Query's 60s staleTime.
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);
  const trimmedQuery = debouncedQuery.trim();

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
    items: recentSearches,
    add: addRecentSearch,
    clear: clearRecent,
  } = useRecentSearches();

  // Closing animation lifecycle: keep the panel mounted until the
  // .search-panel-closing transition has finished, then unmount.
  // Mount sync is render-time (idempotent — React de-dupes the setState),
  // so the only effect we need is the unmount timer when `open` flips off.
  const [isMounted, setIsMounted] = useState(open);
  if (open && !isMounted) setIsMounted(true);
  const isClosing = !open && isMounted;

  useEffect(() => {
    if (!isClosing) return;
    const t = window.setTimeout(() => setIsMounted(false), CLOSE_ANIMATION_MS);
    return () => window.clearTimeout(t);
  }, [isClosing]);

  const { results, state, totalCount } = useSearchResults(trimmedQuery);

  useLockBodyScroll(open, { preserveScrollbarGutter: true });

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  useKeyboardShortcut('Escape', handleClose, { enabled: open });
  useKeyboardShortcut('k', handleClose, {
    modifier: 'meta-or-ctrl',
    enabled: open,
  });

  const handleReset = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  const handleNavigate = useCallback(
    (id: string, label: string) => {
      addRecentSearch(label);
      handleClose();
      router.push(`/listings/${id}`);
    },
    [addRecentSearch, handleClose, router],
  );

  const handleRecentClick = useCallback((q: string) => {
    setQuery(q);
    inputRef.current?.focus();
  }, []);

  if (!isMounted) return null;

  const showReset = query.length > 0;

  return (
    <div className="fixed inset-0 z-modal" role="dialog" aria-modal="true" aria-label="검색">
      <div
        className={`absolute inset-0 bg-bg-inverse/25 backdrop-blur-sm ${
          isClosing ? 'overlay-closing' : 'animate-fade-in'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        className={`relative mx-4 sm:mx-auto max-w-160 mt-[8vh] sm:mt-[12vh] bg-bg-card rounded-xl shadow-lg max-h-[75vh] flex flex-col overflow-hidden ${
          isClosing ? 'search-panel-closing' : 'animate-slide-up'
        }`}
      >
        <div className="relative flex items-center bg-bg-sunken/50 shrink-0">
          <SearchIcon
            size={20}
            className="absolute left-4 text-text-tertiary pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="청약 단지명 검색..."
            maxLength={SEARCH_MAX_QUERY_LENGTH}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full h-14 pl-12 pr-24 bg-transparent text-body-lg placeholder:text-text-tertiary"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {/* Reset is a secondary, conditional affordance — text-only hover so
                Close stays the visually anchored exit. */}
            {showReset && (
              <button
                type="button"
                onClick={handleReset}
                className="p-2 rounded-md text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500"
                aria-label="검색어 지우기"
              >
                <RotateCcw size={16} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-sunken transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500"
              aria-label="검색 닫기"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" aria-live="polite">
          {state === 'idle' &&
            (recentSearches.length > 0 ? (
              <section className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-label-lg text-text-secondary">최근 검색</h2>
                  <button
                    type="button"
                    onClick={clearRecent}
                    className="text-body-sm text-text-tertiary hover:text-text-secondary cursor-pointer"
                  >
                    전체 삭제
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleRecentClick(q)}
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
                <p className="text-body-md text-text-tertiary">검색어를 입력하세요</p>
                <p className="text-caption text-text-tertiary mt-1">
                  <kbd className="px-1.5 py-0.5 bg-bg-sunken rounded text-caption">⌘K</kbd> 로 언제든 열 수 있습니다
                </p>
              </EmptyState>
            ))}

          {state === 'too-short' && (
            <EmptyState size="sm">
              <p className="text-body-md text-text-secondary">
                두 글자 이상의 검색어를 입력하세요.
              </p>
            </EmptyState>
          )}

          {state === 'loading' && (
            <ul className="flex flex-col p-2" aria-label="검색 결과 불러오는 중">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="px-2 py-3">
                  <Skeleton variant="text" className="w-2/3 mb-2" />
                  <Skeleton variant="text" className="w-1/2" />
                </li>
              ))}
            </ul>
          )}

          {state === 'error' && (
            <EmptyState size="sm">
              <p className="text-body-md text-text-secondary">
                검색 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.
              </p>
            </EmptyState>
          )}

          {state === 'empty' && (
            <EmptyState size="sm">
              <p className="text-body-lg text-text-secondary mb-2">
                &ldquo;{trimmedQuery}&rdquo;에 대한 검색 결과가 없습니다.
              </p>
              <p className="text-body-md text-text-tertiary">
                다른 키워드로 검색해 보세요.
              </p>
            </EmptyState>
          )}

          {state === 'ready' && (
            <section className="p-2">
              <h2 className="text-label-lg text-text-secondary px-2 pt-2 pb-1">
                검색 결과 ({totalCount})
              </h2>
              <ul className="flex flex-col">
                {results.map((sub) => (
                  <li key={sub.id}>
                    <button
                      type="button"
                      onClick={() => handleNavigate(sub.id, sub.name)}
                      className="w-full text-left px-3 py-3 rounded-md flex items-center justify-between gap-3 transition-colors cursor-pointer hover:bg-bg-sunken active:bg-bg-active focus-visible:outline-none focus-visible:bg-bg-sunken focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary-500"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-body-md font-semibold text-text-primary line-clamp-1">
                          {sub.name}
                        </p>
                        <p className="text-body-sm text-text-secondary line-clamp-1">
                          {[sub.region, sub.builder].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <StatusChip status={sub.status} />
                    </button>
                  </li>
                ))}
              </ul>
              {totalCount > results.length && (
                <div
                  className="text-caption text-text-tertiary text-center px-3 pt-3 pb-1"
                  role="note"
                >
                  <p>
                    전체 {totalCount}건 중 {results.length}건을 보여드려요
                  </p>
                  <p>키워드를 더 구체적으로 입력해 주세요</p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
