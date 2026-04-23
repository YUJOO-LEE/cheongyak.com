/**
 * Next.js instrumentation hook — runs once per server process on boot.
 *
 * Only used today for the Phase B-2b skeleton-parity Playwright gate
 * (see `e2e/skeleton-parity.spec.ts`). The home route is a pure Server
 * Component that fetches `/main/*` server-side, so the browser-level
 * `page.route` trick the other tests rely on cannot reach those
 * requests. Instead, the test webServer boots with
 * `SKELETON_PARITY_DELAY_MS=<ms>` set, and this hook monkey-patches
 * `globalThis.fetch` to both (a) stall `/main/*` for that many
 * milliseconds so the home Suspense fallbacks stay rendered long enough
 * to measure AND (b) respond with the same deterministic fixture data
 * our Vitest suite already relies on. Real backend state (which can
 * change between runs and legitimately be empty) would make the height
 * parity assertion non-deterministic, so we serve from fixtures.
 *
 * Guard rails:
 * - `process.env.NODE_ENV !== 'development'` short-circuits everything
 *   so the production bundle never reads the env var or touches fetch.
 *   Next does not bundle `instrumentation.ts` into client code, so the
 *   fixture imports never ship to the browser.
 * - Empty / non-numeric `SKELETON_PARITY_DELAY_MS` is a no-op.
 * - Only requests whose URL contains `/main/` are delayed / faked; HMR
 *   pings, RSC payload fetches, and everything else pass through
 *   untouched.
 * - The patch is installed once at startup; dev-server restarts
 *   reinstall it naturally.
 */
export async function register(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return;
  const raw = process.env.SKELETON_PARITY_DELAY_MS;
  if (!raw) return;
  const delayMs = Number(raw);
  if (!Number.isFinite(delayMs) || delayMs <= 0) return;

  // Fixtures are imported lazily so a dev server without the env set
  // doesn't pay the import cost.
  const [
    { mainFeatured },
    { mainStats },
    { mainWeeklySchedule },
    { mainTopTrades },
  ] = await Promise.all([
    import('./mocks/fixtures/main/featured'),
    import('./mocks/fixtures/main/stats'),
    import('./mocks/fixtures/main/weekly-schedule'),
    import('./mocks/fixtures/main/top-trades'),
  ]);

  /**
   * URL suffix → JSON body (already wrapped in the `{ data: ... }`
   * envelope that `createEnvelopeParser` in `src/shared/types/main-api.ts`
   * expects). We match on suffix so the base URL (prod vs staging vs
   * localhost proxy) doesn't need to be hard-coded here.
   */
  const fixtureResponses: Record<string, () => unknown> = {
    '/main/featured': () => ({ data: mainFeatured }),
    '/main/stats': () => ({ data: mainStats }),
    '/main/weekly-schedule': () => ({ data: mainWeeklySchedule }),
    '/main/top-trades': () => ({ data: mainTopTrades }),
  };

  const matchFixture = (url: string): (() => unknown) | null => {
    for (const [suffix, build] of Object.entries(fixtureResponses)) {
      // Strip query string before matching so `revalidate`-tagged requests
      // (which Next may append cache-key hints to) still hit the fixture.
      const base = url.split('?')[0];
      if (base.endsWith(suffix)) return build;
    }
    return null;
  };

  const original = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    const fixture = url.includes('/main/') ? matchFixture(url) : null;
    if (fixture) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return new Response(JSON.stringify(fixture()), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return original(input, init);
  };

  // Dev-console breadcrumb so a test run makes it obvious the shim is
  // active. Suppressed outside dev by the guard above.
  // eslint-disable-next-line no-console
  console.log(
    `[skeleton-parity] fetch shim active — /main/* fixtured + delayed ${delayMs}ms`,
  );
}
