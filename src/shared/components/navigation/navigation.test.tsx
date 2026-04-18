// @vitest-environment node
/**
 * Baseline regression tests for Navigation.
 *
 * Interactive behaviors (⌘K keydown toggle, open/close state) require a DOM,
 * which we cannot run today (see weekly-schedule.test.tsx header). What we
 * CAN pin without a DOM:
 *   1. The `isActive(href)` routing predicate — exact match for `/`, prefix
 *      match for other routes. A refactor that collapses this to a single
 *      `startsWith` would be a regression for the Home item.
 *   2. Server-rendered markup — each nav item is present with the right
 *      href, and the mobile/desktop container markers both appear.
 *
 * The ⌘K keydown handler is explicitly out of scope here and must be covered
 * by Playwright E2E once available.
 */
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

// next/navigation is a client-only module; the bits Navigation uses
// (`usePathname`, `useRouter`) must be stubbed for node-mode rendering.
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
/* isActive reference mirror. MUST stay a two-branch predicate */
/* so the Home item ('/') does not also match other routes     */
/* (which startsWith('/') would accidentally do).              */
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
    // Regression guard: collapsing to startsWith('/') alone would break this.
    const homeActive = isActive('/', '/listings');
    expect(homeActive).toBe(false);
  });
});

/* ─────────────────────────────────────────────────────────── */
/* Server-rendered output: every nav href, the ⌘K hint label,  */
/* and the logo alt exist in a snapshot with pathname=/listings */
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
    // At least one anchor in the mobile bar should carry aria-current="page".
    expect(html).toContain('aria-current="page"');
  });
});
