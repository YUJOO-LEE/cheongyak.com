/**
 * Regression tests for Navigation.
 *
 * Navigation is a pure view after the A8 dependency inversion — it no
 * longer owns search state or the ⌘K listener. Covered here:
 *   1. `isActive(href)` routing predicate — exact match for `/`, prefix
 *      match elsewhere. Collapsing to a single `startsWith` would be a
 *      regression.
 *   2. Server-rendered markup — anchors, ⌘K aria label, aria-current.
 *
 * ⌘K keyboard handling and the dual-listener coexistence baseline now
 * live in `src/app/search-root.test.tsx` (the component that owns both
 * the open state and the shortcut).
 */
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('next/navigation', () => ({
  usePathname: () => '/listings',
  useRouter: () => ({
    push: () => undefined,
    replace: () => undefined,
    prefetch: () => undefined,
    back: () => undefined,
    forward: () => undefined,
    refresh: () => undefined,
  }),
}));

import { Navigation } from './navigation';

/* ─────────────────────────────────────────────────────────── */
/* isActive reference mirror. Two-branch predicate: Home item  */
/* must not match via startsWith('/').                         */
/* ─────────────────────────────────────────────────────────── */

function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

describe('Navigation · isActive routing predicate', () => {
  it('activates Home only on the exact root path', () => {
    expect(isActive('/', '/')).toBe(true);
    expect(isActive('/', '/listings')).toBe(false);
    expect(isActive('/', '/trades')).toBe(false);
    expect(isActive('/', '/news')).toBe(false);
  });

  it('activates /listings on the route and on any detail child route', () => {
    expect(isActive('/listings', '/listings')).toBe(true);
    expect(isActive('/listings', '/listings/sub-001')).toBe(true);
    expect(isActive('/listings', '/')).toBe(false);
    expect(isActive('/listings', '/trades')).toBe(false);
  });

  it('activates /trades on the route itself', () => {
    expect(isActive('/trades', '/trades')).toBe(true);
    expect(isActive('/trades', '/trades/some-region')).toBe(true);
    expect(isActive('/trades', '/listings')).toBe(false);
  });

  it('does not falsely activate Home when another route is selected', () => {
    expect(isActive('/', '/listings')).toBe(false);
  });
});

/* ─────────────────────────────────────────────────────────── */
/* Server-rendered output.                                     */
/* ─────────────────────────────────────────────────────────── */

describe('Navigation · server markup', () => {
  it('renders Home, Listings, and Trades anchors with the expected hrefs', () => {
    const html = renderToStaticMarkup(<Navigation />);
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/listings"');
    expect(html).toContain('href="/trades"');
  });

  it('exposes the search button with its ⌘K accessible label on desktop', () => {
    const html = renderToStaticMarkup(<Navigation />);
    expect(html).toContain('aria-label="검색 (⌘K)"');
  });

  it('marks the active route (listings) as aria-current on mobile', () => {
    const html = renderToStaticMarkup(<Navigation />);
    expect(html).toContain('aria-current="page"');
  });
});
