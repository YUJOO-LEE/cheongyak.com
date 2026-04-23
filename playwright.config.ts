import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration.
 *
 * The project is split into two buckets:
 *
 *  - `default`: reserved for future PR-gate smoke specs (SEO, critical
 *    flows). Nothing lives here yet; `pnpm test:e2e` resolves to this
 *    project and is a safe no-op until we fill it in.
 *  - `skeleton-parity`: the Phase B-2b bounding-box gate. It is slow
 *    (opens a real Chromium, boots the Next dev server, simulates API
 *    latency) so we deliberately keep it out of the default run and wire
 *    it up via `pnpm test:e2e:skeleton-parity` — intended for a
 *    main-branch-only GitHub Actions workflow, not PRs.
 *
 * Dev server: we reuse `pnpm dev` (port 715 — see `package.json`). If a
 * dev server is already running locally we piggyback on it (`reuseExistingServer`
 * is on outside CI) to keep the feedback loop fast.
 */
const PORT = 715;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  // 2s artificial API delay + dev-server cold renders + multiple
  // readStableHeight polls can easily push a single skeleton-parity
  // case past the 30s default. 60s keeps headroom without hiding
  // genuine hangs.
  timeout: 60_000,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  projects: [
    {
      // Placeholder for future PR-gate specs (SEO smoke, etc.).
      name: 'default',
      testIgnore: /skeleton-parity\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Slow bounding-box gate — opt-in via `pnpm test:e2e:skeleton-parity`.
      name: 'skeleton-parity',
      testMatch: /skeleton-parity\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
