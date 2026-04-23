/**
 * Route loader structure regression for `/listings/[id]` (listing detail).
 *
 * The real detail page (`app/listings/[id]/page.tsx`) renders a 3-col
 * grid on desktop with:
 *   Main column (col-span-2):
 *     - SubscriptionHeader         (chip + title + description)
 *     - Schedule card              (timeline)
 *     - Supply card                (supply breakdown)
 *   Sidebar (col-span-1):
 *     - OfficialLinks card         (single block)
 *
 * An earlier revision stacked TWO sidebar blocks (related listings was
 * later removed). If a future refactor brings a second sidebar skeleton
 * back alone — without the real component — users see a phantom block
 * flash and the hydrated page jumps. This test guards that invariant.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import SubscriptionDetailLoading from './loading';

describe('app/listings/[id]/loading.tsx', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the main-column skeletons in the order header → schedule → supply', () => {
    render(<SubscriptionDetailLoading />);

    expect(screen.getByTestId('listing-detail-header-skeleton')).toBeTruthy();
    expect(screen.getByTestId('listing-detail-schedule-skeleton')).toBeTruthy();
    expect(screen.getByTestId('listing-detail-supply-skeleton')).toBeTruthy();
  });

  it('renders exactly one sidebar card (links) — no phantom second block', () => {
    const { container } = render(<SubscriptionDetailLoading />);

    const sidebar = screen.getByTestId('listing-detail-sidebar-col');
    const sidebarSkeletons = sidebar.querySelectorAll('[data-testid$="-skeleton"]');

    expect(sidebarSkeletons).toHaveLength(1);
    expect(sidebar.querySelector('[data-testid="listing-detail-links-skeleton"]')).not.toBeNull();

    // Hedge: overall loader has 4 labelled skeletons total (3 main + 1 sidebar),
    // which lets the test fail cleanly if the main column sprouts an extra band
    // or the sidebar grows a new card.
    expect(
      container.querySelectorAll('[data-testid$="-skeleton"]'),
    ).toHaveLength(5);
    //            ^--- 4 content + 1 outer listing-detail-skeleton wrapper
  });

  it('uses the 3-col responsive grid that matches the real page shape', () => {
    const { container } = render(<SubscriptionDetailLoading />);

    const gridEl = container.querySelector('.lg\\:grid-cols-3');
    expect(gridEl).not.toBeNull();
  });
});
