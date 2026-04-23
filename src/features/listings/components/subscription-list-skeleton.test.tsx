/**
 * Regression for SubscriptionListSkeleton — the client-side Suspense
 * fallback that sits between `/listings` route loader and hydrated
 * `SubscriptionListClient`.
 *
 * Two invariants that the production CLS budget depends on:
 *   1. `aria-busy="true"` so assistive tech announces a loading state.
 *   2. Six sibling cards, matching the page size of the real list. A
 *      silent change to 3 or 12 here would race with the route loader
 *      and produce a visible jump when data resolves.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { SubscriptionListSkeleton } from './subscription-list-skeleton';

describe('SubscriptionListSkeleton', () => {
  afterEach(() => {
    cleanup();
  });

  it('announces itself as a busy, live region for assistive tech', () => {
    render(<SubscriptionListSkeleton />);

    const wrapper = screen.getByTestId('subscription-list-skeleton');
    expect(wrapper.getAttribute('aria-busy')).toBe('true');
    expect(wrapper.getAttribute('aria-live')).toBe('polite');
  });

  it('renders exactly six SubscriptionCardSkeletons (matches /listings page size)', () => {
    render(<SubscriptionListSkeleton />);

    const cards = screen.getAllByTestId('subscription-card-skeleton');
    expect(cards).toHaveLength(6);
  });
});
