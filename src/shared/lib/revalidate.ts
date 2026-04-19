/**
 * Per-endpoint ISR revalidate windows (seconds).
 *
 * Route-level `export const revalidate` in `app/*` controls the page shell;
 * these constants control individual `fetch()` cache windows when a page
 * composes multiple upstream calls with different freshness needs.
 */
export const REVALIDATE = {
  MAIN_FEATURED: 60,
  MAIN_STATS: 60,
  MAIN_WEEKLY: 60,
  MAIN_TOP_TRADES: 120,
} as const;
