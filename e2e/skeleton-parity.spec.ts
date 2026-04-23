/**
 * Phase B-2b — Skeleton ↔ Real page bounding-box parity gate.
 *
 * Goal: flag CLS-class regressions where a `*.skeleton.tsx` and its real
 * sibling drift in height by more than 10%. RTL in `src/app/**\/loading.test.tsx`
 * (Phase B-2a) already pins which skeletons a route loader renders; this
 * spec pins the *rendered size*, which is the signal browsers actually
 * feel as layout shift.
 *
 * Scope & known limitations (intentional):
 *
 * - `/listings` is covered because the page keeps its own client-side
 *   skeleton (`SubscriptionListSkeleton`) visible until TanStack Query
 *   resolves `/api/backend/apt-sales`. We delay that fetch with
 *   `page.route`, measure the first placeholder card, let the data land,
 *   then measure the first real `<article>`. Per-card parity is the
 *   right unit: the skeleton renders a fixed 6 cards while the real
 *   list renders whatever the backend returns (20+ per page today), so
 *   outer-wrapper totals could never match — but each card must occupy
 *   the same box as its placeholder or users feel the shift.
 * - `/listings/[id]` is NOT covered at runtime. The detail page is a
 *   pure Server Component that reads from static fixtures
 *   (`src/mocks/fixtures/subscriptions.ts`) — there is no async work to
 *   suspend on. Empirically on Next 16 + React 19 this means the
 *   concurrent router stages the new tree inside `<div hidden>` during
 *   the RSC payload fetch and atomically unwraps once ready, so
 *   `loading.tsx` never actually renders visible to the user. We
 *   verified this with an instrumented run: skeleton `offsetHeight`
 *   stayed at 0 during the 2s RSC delay and was removed from the DOM
 *   the moment the real content committed, with no interval where the
 *   skeleton was both attached and visible. The composition of
 *   `src/app/listings/[id]/loading.tsx` is still pinned by the RTL
 *   gate at `src/app/listings/[id]/loading.test.tsx`; height parity is
 *   not a meaningful signal for a skeleton users never see. If this
 *   page becomes async (real API fetch instead of fixtures), revisit
 *   this decision.
 * - `/` (home) is *not* covered here. The home page is a pure Server
 *   Component that does its API fetches server-side, before any
 *   browser-visible request exists for `page.route` to intercept. The
 *   RTL gate in `src/app/loading.test.tsx` (and the inline Suspense
 *   fallback tests) still pins the home loader's composition; pairing
 *   height parity on the home route requires either an MSW browser
 *   worker or a dev-server latency flag, both tracked in
 *   `docs/skeleton-parity-test-plan.md` as follow-up.
 *
 * Flake controls:
 *
 * - `readStableHeight` re-samples `offsetHeight` until two consecutive
 *   reads match, so animated skeletons (shimmer wave) and settling
 *   fonts don't poison the measurement.
 * - MSW is *not* enabled in dev (no `public/mockServiceWorker.js`, no
 *   `setupWorker` call in the app bundle), so `page.route` owns the
 *   network and does not race an MSW service worker.
 *
 * Review guidance — how to prove the gate bites:
 *
 *   1. Temporarily reduce `SubscriptionCardSkeleton`'s headline or
 *      metadata-row heights (e.g. swap `height={24}` for `height={4}`
 *      on the `mb-2` Skeleton in
 *      `src/features/listings/components/subscription-card.skeleton.tsx`)
 *      so the placeholder no longer mirrors a real card.
 *   2. `pnpm test:e2e:skeleton-parity` should fail with a clear
 *      "listings-card: skeleton Xpx vs real Ypx (drift Z.%> 10%)"
 *      message.
 *   3. Revert before committing. Do NOT keep the intentional break.
 */
import { test, expect, type Page } from '@playwright/test';

/** Drift tolerance: 10% as agreed in the plan doc. */
const TOLERANCE = 0.1;

/** Artificial API latency window used to stretch the skeleton phase. */
const API_DELAY_MS = 2_000;

/**
 * Poll a selector's rendered height until two consecutive samples agree.
 * Returns the settled height. Bails with an informative message on
 * timeout so a dropped selector (typo, or the DOM node actually missing)
 * does not masquerade as a flake.
 *
 * Implementation note: we use `page.evaluate` with a raw selector
 * instead of `locator.evaluate(...)` because Playwright's locator
 * auto-waiting treats every descendant of an `aria-hidden="true"`
 * subtree as not-visible and hangs `locator.evaluate` waiting for
 * visibility. `offsetHeight` is a pure layout property, so reading it
 * via `document.querySelector(sel).offsetHeight` is safe regardless of
 * visibility heuristics.
 */
async function readStableHeight(
  page: Page,
  selector: string,
  label: string,
): Promise<number> {
  const start = Date.now();
  let previous = -1;
  while (Date.now() - start < 5_000) {
    const current = await page.evaluate((sel) => {
      const el = document.querySelector(sel) as HTMLElement | null;
      return el ? el.offsetHeight : 0;
    }, selector);
    if (current === previous && current > 0) return current;
    previous = current;
    await page.waitForTimeout(100);
  }
  throw new Error(
    `readStableHeight(${label}) did not settle within 5s (selector: ${selector})`,
  );
}

/**
 * Strict height-parity assertion so the failure message names which
 * section drifted and by how much — saves a debugging round-trip.
 */
function expectHeightParity(
  label: string,
  skeletonHeight: number,
  realHeight: number,
): void {
  expect(realHeight, `${label} real height must be > 0`).toBeGreaterThan(0);
  const drift = Math.abs(skeletonHeight - realHeight) / realHeight;
  expect(
    drift,
    `${label}: skeleton ${skeletonHeight}px vs real ${realHeight}px ` +
      `(drift ${(drift * 100).toFixed(1)}% > ${TOLERANCE * 100}%)`,
  ).toBeLessThanOrEqual(TOLERANCE);
}

/**
 * Install a delay on a specific URL glob. We unroute after measurement
 * so subsequent navigations inside the same test aren't throttled.
 */
async function withApiDelay(
  page: Page,
  urlGlob: string,
  handler: () => Promise<void>,
): Promise<void> {
  await page.route(urlGlob, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, API_DELAY_MS));
    await route.continue();
  });
  try {
    await handler();
  } finally {
    await page.unroute(urlGlob);
  }
}

test.describe('skeleton ↔ real layout parity (CLS gate)', () => {
  test('/listings first card matches subscription-card-skeleton', async ({
    page,
  }) => {
    await withApiDelay(page, '**/api/backend/apt-sales*', async () => {
      // Start the navigation; don't await its completion — we want the
      // skeleton phase to be alive when we measure.
      const navigation = page.goto('/listings');

      // Compare a single skeleton card to a single real card. The outer
      // SubscriptionListSkeleton always renders 6 placeholder cards,
      // while the real list renders whatever the backend returns
      // (currently 20+ per page), so the outer wrappers can never
      // share a total height. Per-card parity is the signal that
      // actually matches real CLS: each placeholder must settle to the
      // same box the real card will occupy.
      const listSkeleton = page.getByTestId('subscription-list-skeleton');
      await listSkeleton.waitFor({ state: 'visible', timeout: 10_000 });

      const skeletonCard = page
        .getByTestId('subscription-card-skeleton')
        .first();
      await skeletonCard.waitFor({ state: 'visible', timeout: 10_000 });
      const skeletonCardHeight = await readStableHeight(
        page,
        '[data-testid="subscription-card-skeleton"]',
        'subscription-card-skeleton',
      );

      // Now let the navigation finish and the real grid render.
      await navigation;
      await listSkeleton.waitFor({ state: 'detached', timeout: 10_000 });
      await page.waitForLoadState('networkidle');

      // SubscriptionCard is rendered as `<Card as="article">`, so the
      // first <article> inside <main> is the first real card. This is
      // the structural twin of the skeleton card we just measured.
      const realCard = page.locator('main article').first();
      await realCard.waitFor({ state: 'visible', timeout: 10_000 });
      const realCardHeight = await readStableHeight(
        page,
        'main article',
        'subscription-card-real',
      );

      expectHeightParity('listings-card', skeletonCardHeight, realCardHeight);
    });
  });
});
