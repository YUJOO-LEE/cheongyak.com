/**
 * Route loader structure regression for `/listings/[id]` (listing detail).
 *
 * The real detail page (`app/listings/[id]/page.tsx`) now renders a 3-col
 * grid on desktop with:
 *   Main column (col-span-2):
 *     - SubscriptionHeader            (chip + title + description)
 *     - RegulationChips               (neutral chip group — only when active)
 *     - Schedule card                 (7-phase timeline)
 *     - ModelSupplyCards              (per-평형 cards replacing old table)
 *     - CompetitionTable              (경쟁률 — only when data present)
 *     - WinnerScoreTable              (당첨가점)
 *     - SpecialSupplyStatusTable      (특공 신청현황)
 *   Sidebar (col-span-1):
 *     - OfficialLinks card            (links block)
 *     - ShareActions card             (URL copy + Kakao share)
 *
 * This test pins the loader composition so shape changes in the real page
 * can't drift from the Suspense fallback silently.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import SubscriptionDetailLoading from './loading';

describe('app/listings/[id]/loading.tsx', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the main-column skeletons in canonical order', () => {
    render(<SubscriptionDetailLoading />);

    const main = screen.getByTestId('listing-detail-main-col');
    const order = Array.from(
      main.querySelectorAll<HTMLElement>('[data-testid$="-skeleton"]'),
    ).map((el) => el.dataset.testid);

    expect(order).toEqual([
      'listing-detail-header-skeleton',
      'regulation-chips-skeleton',
      'listing-detail-schedule-skeleton',
      'model-supply-cards-skeleton',
      'competition-table-skeleton',
      'winner-score-table-skeleton',
      'special-supply-status-table-skeleton',
    ]);
  });

  it('renders the sidebar cards (links + share) in canonical order — no phantom blocks', () => {
    render(<SubscriptionDetailLoading />);

    const sidebar = screen.getByTestId('listing-detail-sidebar-col');
    const order = Array.from(
      sidebar.querySelectorAll<HTMLElement>('[data-testid$="-skeleton"]'),
    ).map((el) => el.dataset.testid);

    expect(order).toEqual([
      'listing-detail-links-skeleton',
      'listing-detail-share-skeleton',
    ]);
  });

  it('pins the overall skeleton-testid count so phantom bands fail loudly', () => {
    const { container } = render(<SubscriptionDetailLoading />);
    // 7 content sections in main + 2 in sidebar + 1 outer wrapper = 10
    expect(
      container.querySelectorAll('[data-testid$="-skeleton"]'),
    ).toHaveLength(10);
  });

  it('uses the 3-col responsive grid that matches the real page shape', () => {
    const { container } = render(<SubscriptionDetailLoading />);

    const gridEl = container.querySelector('.lg\\:grid-cols-3');
    expect(gridEl).not.toBeNull();
  });
});
