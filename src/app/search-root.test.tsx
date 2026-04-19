/**
 * Regression tests for SearchRoot.
 *
 * SearchRoot owns the ⌘K open state and the global keyboard shortcut
 * after the A8 dependency inversion. These tests pin behavior that
 * previously lived on Navigation; the observable end-state must stay
 * identical (open on ⌘K, close on ⌘K while open, round-trip across
 * three presses despite the SearchOverlay registering its own close
 * listener).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
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

import { SearchRoot } from './search-root';

/* ─────────────────────────────────────────────────────────── */
/* ⌘K keydown interaction — SearchRoot's document listener.    */
/* ─────────────────────────────────────────────────────────── */

describe('SearchRoot · ⌘K keydown interactive', () => {
  afterEach(() => {
    cleanup();
  });

  it('opens the search overlay on first ⌘K press (metaKey)', () => {
    render(<SearchRoot />);
    expect(screen.queryByRole('dialog', { name: '검색' })).toBeNull();
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(screen.getByRole('dialog', { name: '검색' })).toBeTruthy();
  });

  it('opens the search overlay on first Ctrl+K press', () => {
    render(<SearchRoot />);
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog', { name: '검색' })).toBeTruthy();
  });

  it('calls preventDefault on ⌘K so the browser does not steal focus', () => {
    render(<SearchRoot />);
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
    render(<SearchRoot />);
    fireEvent.keyDown(document, { key: 'k' });
    expect(screen.queryByRole('dialog', { name: '검색' })).toBeNull();
  });

  it('ignores ⌘ + non-k keys', () => {
    render(<SearchRoot />);
    fireEvent.keyDown(document, { key: 'p', metaKey: true });
    expect(screen.queryByRole('dialog', { name: '검색' })).toBeNull();
  });
});

/* ─────────────────────────────────────────────────────────── */
/* Dual-listener coexistence. SearchRoot's toggle listener and */
/* SearchOverlay's close listener both fire on ⌘K while open;  */
/* the assertion is on end-state, not call count, so a future  */
/* listener unification cannot break the round-trip.           */
/* ─────────────────────────────────────────────────────────── */

describe('SearchRoot · ⌘K open/close/reopen round-trip (dual-listener baseline)', () => {
  afterEach(() => {
    cleanup();
  });

  it('round-trips open → close → open across three ⌘K presses', () => {
    render(<SearchRoot />);
    expect(screen.queryByRole('dialog', { name: '검색' })).toBeNull();

    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(screen.getByRole('dialog', { name: '검색' })).toBeTruthy();

    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(screen.queryByRole('dialog', { name: '검색' })).toBeNull();

    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(screen.getByRole('dialog', { name: '검색' })).toBeTruthy();
  });
});
