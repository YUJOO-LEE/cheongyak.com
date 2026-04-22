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
      {
        source: '/api/backend/:path*',
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
