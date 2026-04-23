/**
 * Route loader structure regression for `/listings`.
 *
 * `/listings` ships three visual bands:
 *   1. FilterBar — sticky desktop bar + mobile trigger button
 *   2. Subscription grid — 1 col mobile, 2 cols desktop, 6 cards per page
 *   3. Pagination strip
 *
 * The loader must render a placeholder for each so the page does not
 * flash-rebuild when the real data resolves. This test pins the count so
 * a refactor of `SubscriptionCardSkeleton` or the pagination markup can't
 * silently drop one of the three layers.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import SubscriptionsLoading from './loading';

describe('app/listings/loading.tsx', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders both filter-bar shells so neither breakpoint shifts', () => {
    render(<SubscriptionsLoading />);

    expect(screen.getByTestId('filter-bar-skeleton-mobile')).toBeTruthy();
    expect(screen.getByTestId('filter-bar-skeleton-desktop')).toBeTruthy();
  });

  it('renders exactly six subscription card skeletons (one page of results)', () => {
    render(<SubscriptionsLoading />);

    const cards = screen.getAllByTestId('subscription-card-skeleton');
    expect(cards).toHaveLength(6);
  });

  it('renders the pagination placeholder strip', () => {
    render(<SubscriptionsLoading />);

    expect(screen.getByTestId('listings-pagination-skeleton')).toBeTruthy();
  });
});
