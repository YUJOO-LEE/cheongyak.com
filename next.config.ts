import type { NextConfig } from 'next';

/**
 * Backend origin is intentionally kept server-only (no `NEXT_PUBLIC_`
 * prefix) so the host never ships in the browser bundle. All browser
 * fetches go through `/api/backend/*`, which Next rewrites to this
 * origin server-side — making every CSR call same-origin and immune
 * to CORS. Server Components and prefetches read `API_BACKEND_URL`
 * directly via `src/shared/lib/api-client.ts` to skip the proxy hop.
 */
const BACKEND_URL = process.env.API_BACKEND_URL;

/**
 * Standard security headers applied to every response. Picked
 * conservatively so we don't accidentally break Vercel Analytics /
 * Speed Insights / OG image generation:
 *
 * - `X-Content-Type-Options: nosniff` — stops the browser from
 *   second-guessing our `Content-Type` (defends MIME-sniffing XSS).
 * - `X-Frame-Options: SAMEORIGIN` — refuse to render in third-party
 *   iframes (clickjacking defense).
 * - `Referrer-Policy: strict-origin-when-cross-origin` — leak only
 *   the origin (not the path) when navigating off-site.
 * - `Permissions-Policy: …` — explicitly opt out of powerful browser
 *   APIs we never use, plus FLoC (`interest-cohort`).
 * - `Strict-Transport-Security` — pin HTTPS for 2 years on this
 *   hostname and subdomains; `preload` qualifies us for the
 *   browser-shipped HSTS preload list once we submit.
 *
 * Deliberately not adding a Content-Security-Policy yet: Vercel
 * Analytics + Speed Insights inject their own scripts/connect
 * endpoints, and a too-strict CSP would silently break them. CSP
 * lands as its own task with a `report-only` rollout first.
 */
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    if (!BACKEND_URL) {
      throw new Error(
        'API_BACKEND_URL is required for /api/backend/* rewrites. ' +
          'Set it in .env.local (dev) or the deploy environment (prod).',
      );
    }
    return [
      // Friendly client-facing alias for the apt-sales autocomplete endpoint
      // so the browser URL stays `/api/search?q=...` instead of leaking the
      // backend's resource grouping (`/apt-sales/search`).
      {
        source: '/api/search',
        destination: `${BACKEND_URL}/apt-sales/search`,
      },
      {
        source: '/api/backend/:path*',
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
