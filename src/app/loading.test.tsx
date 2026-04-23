/**
 * Route loader structure regression for `/` (home).
 *
 * Pins the skeleton composition so that a future refactor of the home
 * loading fallback cannot silently drop a sibling skeleton or reintroduce
 * a phantom section that no longer exists in the real page.
 *
 * Home page renders three vertically stacked sections:
 *   1. HomeHero (featured subscription + insight column)
 *   2. WeeklySchedule
 *   3. TopTrades
 *
 * A previous iteration of the dashboard also shipped a "latest news" and
 * a separate market-insights block. Both are gone from `app/page.tsx`;
 * if they ever resurface in `loading.tsx` alone we get a layout shift on
 * navigation — this test guards that gap.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import HomeLoading from './loading';

describe('app/loading.tsx (home route)', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the three sibling skeletons that match app/page.tsx sections', () => {
    render(<HomeLoading />);

    expect(screen.getByTestId('home-hero-skeleton')).toBeTruthy();
    // WeeklyScheduleSkeleton emits the same testid on its mobile and
    // desktop wrappers (only one is visible per breakpoint in production).
    expect(screen.getAllByTestId('weekly-schedule-skeleton').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('top-trades-skeleton')).toBeTruthy();
  });

  it('does not re-introduce retired phantom sections', () => {
    render(<HomeLoading />);

    // These testids intentionally do not exist anywhere in the codebase.
    // If a future contributor adds them back, the loader has drifted away
    // from the real page shape.
    expect(screen.queryByTestId('latest-news-skeleton')).toBeNull();
    expect(screen.queryByTestId('market-insights-skeleton')).toBeNull();
    expect(screen.queryByTestId('recent-views-skeleton')).toBeNull();
  });
});
