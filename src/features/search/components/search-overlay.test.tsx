/**
 * Regression tests for SearchOverlay.
 *
 * Coverage:
 *   1. Recent-searches storage model — SSR guard + MRU / de-dupe /
 *      MAX_RECENT slicing (reference implementation mirrors the helpers in
 *      the component body).
 *   2. Fixture-backed search filter — `useSearchResults` matches by name,
 *      sido, gugun, builder; caps at 5.
 *   3. Null render when `open={false}`.
 *   4. Interactive — body scroll lock, debounce 300ms, Escape close.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: () => undefined,
    replace: () => undefined,
    prefetch: () => undefined,
    back: () => undefined,
    forward: () => undefined,
    refresh: () => undefined,
  }),
}));

import { SearchOverlay } from './search-overlay';
import { subscriptions } from '@/mocks/fixtures/subscriptions';
import type { Subscription } from '@/shared/types/api';

/* ─────────────────────────────────────────────────────────── */
/* In-memory localStorage stand-in so we can exercise the      */
/* recent-searches storage model in node mode.                 */
/* ─────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'cheongyak-recent-searches';
const MAX_RECENT = 10;

interface FakeStorage {
  store: Map<string, string>;
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

function makeStorage(): FakeStorage {
  const store = new Map<string, string>();
  return {
    store,
    getItem: (k) => (store.has(k) ? store.get(k)! : null),
    setItem: (k, v) => void store.set(k, v),
    removeItem: (k) => void store.delete(k),
  };
}

/* Reference implementations — mirror search-overlay.tsx helpers. */

function getRecentSearches(
  hasWindow: boolean,
  storage: FakeStorage | null,
): string[] {
  if (!hasWindow) return [];
  try {
    return JSON.parse(storage!.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecentSearch(storage: FakeStorage, query: string): void {
  const recent = getRecentSearches(true, storage).filter((q) => q !== query);
  recent.unshift(query);
  storage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function clearRecentSearches(storage: FakeStorage): void {
  storage.removeItem(STORAGE_KEY);
}

describe('SearchOverlay · recent-searches storage model (reference)', () => {
  let storage: FakeStorage;
  beforeEach(() => {
    storage = makeStorage();
  });

  it('returns an empty list on the server where window is undefined', () => {
    expect(getRecentSearches(false, null)).toEqual([]);
  });

  it('returns an empty list when the key has never been written', () => {
    expect(getRecentSearches(true, storage)).toEqual([]);
  });

  it('returns an empty list when the stored value is corrupt JSON (graceful fallback)', () => {
    storage.setItem(STORAGE_KEY, '{not valid');
    expect(getRecentSearches(true, storage)).toEqual([]);
  });

  it('saves a fresh query as the newest entry (MRU order)', () => {
    saveRecentSearch(storage, '서초구');
    saveRecentSearch(storage, '래미안');
    expect(getRecentSearches(true, storage)).toEqual(['래미안', '서초구']);
  });

  it('de-duplicates — re-saving an existing query moves it to the front, no duplicates', () => {
    saveRecentSearch(storage, '서초구');
    saveRecentSearch(storage, '래미안');
    saveRecentSearch(storage, '서초구'); // should bump, not duplicate
    expect(getRecentSearches(true, storage)).toEqual(['서초구', '래미안']);
  });

  it('slices to MAX_RECENT (10) — the oldest entry is dropped on overflow', () => {
    for (let i = 1; i <= 12; i++) {
      saveRecentSearch(storage, `query-${i}`);
    }
    const recent = getRecentSearches(true, storage);
    expect(recent).toHaveLength(MAX_RECENT);
    expect(recent[0]).toBe('query-12');
    expect(recent[MAX_RECENT - 1]).toBe('query-3');
    expect(recent).not.toContain('query-1');
    expect(recent).not.toContain('query-2');
  });

  it('clearRecentSearches removes the storage key entirely', () => {
    saveRecentSearch(storage, '서초구');
    clearRecentSearches(storage);
    expect(getRecentSearches(true, storage)).toEqual([]);
  });
});

/* ─────────────────────────────────────────────────────────── */
/* Fixture-backed search filter — mirrors useSearchResults     */
/* body. Captures the 4-field match and the 5-item slice cap.  */
/* ─────────────────────────────────────────────────────────── */

function useSearchResultsRef(query: string): Subscription[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return subscriptions
    .filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.location.sido.includes(q) ||
        s.location.gugun.includes(q) ||
        s.builder.toLowerCase().includes(q),
    )
    .slice(0, 5);
}

describe('SearchOverlay · fixture-backed search (reference)', () => {
  it('returns no results for an empty or whitespace query', () => {
    expect(useSearchResultsRef('')).toEqual([]);
    expect(useSearchResultsRef('   ')).toEqual([]);
  });

  it('matches subscription name case-insensitively', () => {
    const hits = useSearchResultsRef('래미안');
    expect(hits.some((s) => s.name.includes('래미안'))).toBe(true);
  });

  it('matches by gugun region literal', () => {
    const hits = useSearchResultsRef('서초구');
    expect(hits.some((s) => s.location.gugun === '서초구')).toBe(true);
  });

  it('caps results at 5', () => {
    // '동' substring hits dong values across many fixtures → cap kicks in.
    const hits = useSearchResultsRef('동');
    expect(hits.length).toBeLessThanOrEqual(5);
  });
});

/* ─────────────────────────────────────────────────────────── */
/* Server markup: open=false short-circuits to null render.    */
/* ─────────────────────────────────────────────────────────── */

describe('SearchOverlay · server markup', () => {
  it('emits no dialog markup when open is false', () => {
    const html = renderToStaticMarkup(
      <SearchOverlay open={false} onClose={() => undefined} />,
    );
    expect(html).toBe('');
  });
});

/* ─────────────────────────────────────────────────────────── */
/* Interactive — body scroll lock, debounce, Escape close.     */
/* These pin the useEffect-driven behavior that any future     */
/* hook extraction must preserve 1:1.                          */
/* ─────────────────────────────────────────────────────────── */

describe('SearchOverlay · body scroll lock', () => {
  afterEach(() => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    cleanup();
  });

  it('locks body overflow when open transitions to true', () => {
    render(<SearchOverlay open onClose={() => undefined} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when the component rerenders closed', () => {
    const { rerender } = render(
      <SearchOverlay open onClose={() => undefined} />,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<SearchOverlay open={false} onClose={() => undefined} />);
    expect(document.body.style.overflow).toBe('');
  });
});

describe('SearchOverlay · debounce 300ms', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('does not surface results until exactly 300ms after the last keystroke', () => {
    render(<SearchOverlay open onClose={() => undefined} />);
    const input = screen.getByPlaceholderText('청약명, 지역, 건설사 검색...');

    fireEvent.change(input, { target: { value: '래미안' } });

    // Before the full debounce delay, the results section must not yet exist.
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(screen.queryByText(/청약 \(/)).toBeNull();

    // One more ms crosses the 300ms boundary and the results section appears.
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText(/청약 \(/)).toBeTruthy();
  });
});

describe('SearchOverlay · Escape key close', () => {
  afterEach(() => {
    cleanup();
  });

  it('invokes onClose when Escape is pressed while open', () => {
    const onClose = vi.fn();
    render(<SearchOverlay open onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onClose for unrelated keys', () => {
    const onClose = vi.fn();
    render(<SearchOverlay open onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'a' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
