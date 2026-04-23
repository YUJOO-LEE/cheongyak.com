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
 * - `/listings` is covered because it is a Server Component that hydrates
 *   a client-side TanStack Query fetch for `/api/backend/apt-sales`. We
 *   delay that single request with `page.route`, which keeps the
 *   `<SubscriptionListSkeleton>` visible long enough to measure.
 * - `/listings/[id]` is covered via client-side navigation from
 *   `/listings`. Clicking a card triggers Next.js to fetch the RSC
 *   payload for the detail route; delaying that payload surfaces the
 *   route-level `loading.tsx` long enough to measure each detail card.
 * - `/` (home) is *not* covered here. The home page is a pure Server
 *   Component that does its API fetches server-side, before any
 *   browser-visible request exists for `page.route` to intercept. The
 *   RTL gate in `src/app/loading.test.tsx` still pins the home loader's
 *   composition; pairing height parity on the home route requires
 *   either an MSW browser worker or a dev-server latency flag, both
 *   tracked in `docs/skeleton-parity-test-plan.md` as follow-up.
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
 *   1. Temporarily reduce `SubscriptionCardSkeleton` height to ~80px
 *      (or swap the `h-*` class on one of the listing-detail skeletons).
 *   2. `pnpm test:e2e:skeleton-parity` should fail with a clear
 *      "height drift" assertion.
 *   3. Revert before committing. Do NOT keep the intentional break.
 */
import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Hard-coded so the test is reproducible; matches the first id in
 * `src/mocks/fixtures/subscriptions.ts` and is covered by
 * `generateStaticParams` on the detail route.
 */
const DETAIL_ID = 'sub-001';

/** Drift tolerance: 10% as agreed in the plan doc. */
const TOLERANCE = 0.1;

/** Artificial API latency window used to stretch the skeleton phase. */
const API_DELAY_MS = 2_000;

/**
 * Poll a locator's rendered height until two consecutive samples agree.
 * Returns the settled height. Bails with an informative message on
 * timeout so a dropped locator (selector typo) does not masquerade as a
 * flake.
 */
async function readStableHeight(locator: Locator, label: string): Promise<number> {
  const start = Date.now();
  let previous = -1;
  while (Date.now() - start < 5_000) {
    const current = await locator.evaluate((el) => (el as HTMLElement).offsetHeight);
    if (current === previous && current > 0) return current;
    previous = current;
    await locator.page().waitForTimeout(100);
  }
  throw new Error(`readStableHeight(${label}) did not settle within 5s`);
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
  test('/listings card grid matches subscription-list-skeleton', async ({
    page,
  }) => {
    await withApiDelay(page, '**/api/backend/apt-sales*', async () => {
      // Start the navigation; don't await its completion — we want the
      // skeleton phase to be alive when we measure.
      const navigation = page.goto('/listings');

      const skeleton = page.getByTestId('subscription-list-skeleton');
      await skeleton.waitFor({ state: 'visible', timeout: 10_000 });
      const skeletonHeight = await readStableHeight(
        skeleton,
        'subscription-list-skeleton',
      );

      // Now let the navigation finish and the real grid render.
      await navigation;
      await skeleton.waitFor({ state: 'detached', timeout: 10_000 });
      await page.waitForLoadState('networkidle');

      // The card grid has no explicit data-section hook — it is the live
      // replacement of the skeleton list, keyed off the card container
      // which subscription-list-client renders. We match on the same
      // container role the skeleton emulates: the top-level region.
      const realGrid = page.locator('[role="list"], main').first();
      const realHeight = await readStableHeight(realGrid, 'listings-real-grid');

      expectHeightParity('listings-grid', skeletonHeight, realHeight);
    });
  });

  test('/listings/[id] detail cards match loading.tsx skeletons', async ({
    page,
  }) => {
    // Land on /listings first so Next.js has the client router hydrated;
    // client-side navigation is what surfaces `loading.tsx` reliably.
    await page.goto('/listings');
    await page.waitForLoadState('networkidle');

    // Delay RSC payload fetches for /listings/[id]. Next emits requests
    // like `/listings/sub-001?_rsc=<hash>` for App Router client
    // navigation; the wildcard below matches both the payload and any
    // prefetch probe.
    await withApiDelay(page, `**/listings/${DETAIL_ID}*`, async () => {
      // Use an in-page link click so Next does a soft (client-side)
      // navigation and renders the route's loading.tsx. Fall back to a
      // direct `page.goto` if no Link matches — still exercises the
      // route, just without the streamed skeleton.
      const link = page.locator(`a[href="/listings/${DETAIL_ID}"]`).first();
      const hasLink = (await link.count()) > 0;
      const navigation = hasLink ? link.click() : page.goto(`/listings/${DETAIL_ID}`);

      // Measure each skeleton while the route transition is paused.
      const scheduleSkel = page.getByTestId('listing-detail-schedule-skeleton');
      const supplySkel = page.getByTestId('listing-detail-supply-skeleton');
      const linksSkel = page.getByTestId('listing-detail-links-skeleton');

      await scheduleSkel.waitFor({ state: 'visible', timeout: 10_000 });

      const scheduleSkelH = await readStableHeight(
        scheduleSkel,
        'listing-detail-schedule-skeleton',
      );
      const supplySkelH = await readStableHeight(
        supplySkel,
        'listing-detail-supply-skeleton',
      );
      const linksSkelH = await readStableHeight(
        linksSkel,
        'listing-detail-links-skeleton',
      );

      await navigation;
      await page.waitForLoadState('networkidle');

      // Real sections — matched by the data-section hooks added in the
      // sibling commit. Card wrappers (p-6 padding included) line up
      // with the skeletons' h-96 / h-80 / h-40 heights.
      const scheduleReal = page.locator('[data-section="listing-detail-schedule"]');
      const supplyReal = page.locator('[data-section="listing-detail-supply"]');
      const linksReal = page.locator('[data-section="listing-detail-links"]');

      await scheduleReal.waitFor({ state: 'visible', timeout: 10_000 });

      const scheduleRealH = await readStableHeight(
        scheduleReal,
        'listing-detail-schedule-real',
      );
      const supplyRealH = await readStableHeight(
        supplyReal,
        'listing-detail-supply-real',
      );
      const linksRealH = await readStableHeight(
        linksReal,
        'listing-detail-links-real',
      );

      expectHeightParity(
        'listing-detail-schedule',
        scheduleSkelH,
        scheduleRealH,
      );
      expectHeightParity('listing-detail-supply', supplySkelH, supplyRealH);
      expectHeightParity('listing-detail-links', linksSkelH, linksRealH);
    });
  });
});
