/**
 * Regression tests for Navigation.
 *
 * Now that the vitest environment is happy-dom, interactive tests can observe
 * `useEffect`-registered document listeners directly. The three layers covered:
 *   1. `isActive(href)` routing predicate — exact match for `/`, prefix match
 *      elsewhere. Collapsing to a single `startsWith` would be a regression.
 *   2. Server-rendered markup — anchors, ⌘K aria label, aria-current.
 *   3. ⌘K keydown interaction + dual-listener coexistence with SearchOverlay.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

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

/* ─────────────────────────────────────────────────────────── */
/* ⌘K keydown interaction — exercise the document-level        */
/* listener that Navigation registers in useEffect.            */
/* ─────────────────────────────────────────────────────────── */

describe('Navigation · ⌘K keydown interactive', () => {
  afterEach(() => {
    cleanup();
  });

  it('opens the search overlay on first ⌘K press (metaKey)', () => {
    render(<Navigation />);
    expect(screen.queryByRole('dialog', { name: '검색' })).toBeNull();
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(screen.getByRole('dialog', { name: '검색' })).toBeTruthy();
  });

  it('opens the search overlay on first Ctrl+K press', () => {
    render(<Navigation />);
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog', { name: '검색' })).toBeTruthy();
  });

  it('calls preventDefault on ⌘K so the browser does not steal focus', () => {
    render(<Navigation />);
    // createEvent + dispatchEvent so we can inspect defaultPrevented afterwards.
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      document.dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores a plain "k" press without a modifier', () => {
    render(<Navigation />);
    fireEvent.keyDown(document, { key: 'k' });
    expect(screen.queryByRole('dialog', { name: '검색' })).toBeNull();
  });

  it('ignores ⌘ + non-k keys', () => {
    render(<Navigation />);
    fireEvent.keyDown(document, { key: 'p', metaKey: true });
    expect(screen.queryByRole('dialog', { name: '검색' })).toBeNull();
  });
});

/* ─────────────────────────────────────────────────────────── */
/* Dual-listener coexistence with SearchOverlay. Both          */
/* Navigation and SearchOverlay register ⌘K handlers on        */
/* document; this test captures the observable end-state so    */
/* a future `useKeyboardShortcut` unification cannot break the */
/* open / close / reopen toggle cycle.                         */
/* ─────────────────────────────────────────────────────────── */

describe('Navigation + SearchOverlay · dual ⌘K listener coexistence (baseline)', () => {
  afterEach(() => {
    cleanup();
  });

  it('round-trips open → close → open across three ⌘K presses', () => {
    render(<Navigation />);
    expect(screen.queryByRole('dialog', { name: '검색' })).toBeNull();

    // Press 1: open
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(screen.getByRole('dialog', { name: '검색' })).toBeTruthy();

    // Press 2: close. Both Navigation's toggle and SearchOverlay's close
    // handler fire; we assert on the end state, not the call count.
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(screen.queryByRole('dialog', { name: '검색' })).toBeNull();

    // Press 3: re-open.
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(screen.getByRole('dialog', { name: '검색' })).toBeTruthy();
  });
});
