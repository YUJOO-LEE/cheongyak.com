/**
 * Regression tests for SearchOverlay.
 *
 * Coverage:
 *   1. Recent-searches storage model — SSR guard + MRU / de-dupe /
 *      MAX_RECENT slicing (reference implementation mirrors the helpers
 *      used by `useRecentSearches`).
 *   2. Null render when `open={false}`.
 *   3. Interactive — body scroll lock, debounce 350ms, min-length gate,
 *      cleared-input no-call, Escape close.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

// The hook fetches `/api/search?q=...&limit=...` directly (Next.js
// rewrites that to the upstream `/apt-sales/search`). Stub the global
// fetch so we can capture the URL and avoid network access.
const lastSearchArgs: { url: string; q: string }[] = [];
const stubbedFetch = vi.fn(async (input: RequestInfo | URL) => {
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
  if (url.includes('/api/search')) {
    const match = url.match(/[?&]q=([^&]+)/);
    const q = match ? decodeURIComponent(match[1]) : '';
    lastSearchArgs.push({ url, q });
    return new Response(JSON.stringify({ subscriptions: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(null, { status: 404 });
});

import { SearchOverlay } from './search-overlay';
import { renderWithNuqs } from '@/test/render';

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

/* Reference implementations — mirror the recent-searches hook helpers. */

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
/* Server markup: open=false short-circuits to null render.    */
/* ─────────────────────────────────────────────────────────── */

describe('SearchOverlay · server markup', () => {
  it('emits no dialog markup when open is false', () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <SearchOverlay open={false} onClose={() => undefined} />
      </QueryClientProvider>,
    );
    expect(html).toBe('');
  });
});

/* ─────────────────────────────────────────────────────────── */
/* Interactive — body scroll lock, debounce, IME, Escape.      */
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
    renderWithNuqs(<SearchOverlay open onClose={() => undefined} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when the component rerenders closed', () => {
    const { rerender } = renderWithNuqs(
      <SearchOverlay open onClose={() => undefined} />,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<SearchOverlay open={false} onClose={() => undefined} />);
    expect(document.body.style.overflow).toBe('');
  });
});

describe('SearchOverlay · debounce + safeguards', () => {
  beforeEach(() => {
    lastSearchArgs.length = 0;
    stubbedFetch.mockClear();
    vi.stubGlobal('fetch', stubbedFetch);
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    cleanup();
  });

  it('does not call the search hook for queries shorter than 2 chars', () => {
    renderWithNuqs(<SearchOverlay open onClose={() => undefined} />);
    const input = screen.getByPlaceholderText('청약 단지명 검색...');

    fireEvent.change(input, { target: { value: 'ㄱ' } });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(lastSearchArgs).toEqual([]);
  });

  it('fires exactly once after 350ms following the last keystroke', () => {
    renderWithNuqs(<SearchOverlay open onClose={() => undefined} />);
    const input = screen.getByPlaceholderText('청약 단지명 검색...');

    fireEvent.change(input, { target: { value: '래미안' } });

    act(() => {
      vi.advanceTimersByTime(349);
    });
    expect(lastSearchArgs).toEqual([]);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(lastSearchArgs.map((a) => a.q)).toEqual(['래미안']);
  });

  it('skips the search call when the user clears the input', () => {
    renderWithNuqs(<SearchOverlay open onClose={() => undefined} />);
    const input = screen.getByPlaceholderText('청약 단지명 검색...');

    fireEvent.change(input, { target: { value: '래미안' } });
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(lastSearchArgs.map((a) => a.q)).toContain('래미안');

    fireEvent.change(input, { target: { value: '' } });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    // The cleared state must not trigger a request for any keyword
    // other than the still-debounced "래미안". Specifically, no call
    // with q="" should ever fire — that's the protection we care about.
    const distinct = Array.from(new Set(lastSearchArgs.map((a) => a.q)));
    expect(distinct).toEqual(['래미안']);
  });

});

describe('SearchOverlay · Escape key close', () => {
  afterEach(() => {
    cleanup();
  });

  it('invokes onClose when Escape is pressed while open', () => {
    const onClose = vi.fn();
    renderWithNuqs(<SearchOverlay open onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onClose for unrelated keys', () => {
    const onClose = vi.fn();
    renderWithNuqs(<SearchOverlay open onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'a' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
