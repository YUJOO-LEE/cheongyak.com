import { NextResponse, type NextRequest } from 'next/server';
import {
  RateLimiter,
  isAllowedOrigin,
  isAllowedReferer,
} from '@/shared/lib/api-guard';

/**
 * Next 16 renamed the `middleware.ts` file convention to `proxy.ts`
 * with a matching `proxy()` export — same execution model, less
 * confusion vs. the unrelated `next/middleware` API surface. We
 * picked up the rename when the build flagged the deprecation.
 *
 * `/api/backend/*` is a public proxy to the upstream listings backend
 * (`next.config.ts` rewrites it server-side). Without a guard, anyone
 * can hit it directly with `curl` or a scraper, drive up our function
 * invocations + data-transfer bill, and re-publish our shaped output
 * under their own brand. This file adds two cheap, no-extra-cost
 * defenses:
 *
 *   1. Origin / Referer allowlist — blocks naïve cross-origin browser
 *      code and curl calls with no referer. Does NOT stop a determined
 *      attacker who forges headers; that's defense (2)'s job.
 *
 *   2. Per-IP fixed-window rate limit — caps any single IP at 60
 *      requests per minute. See `src/shared/lib/api-guard.ts` for the
 *      caveat on in-memory state under Fluid Compute.
 *
 * Trust note: Vercel strips and rewrites `X-Forwarded-For` at its edge
 * with the real client IP, so reading it here is safe.
 *
 * Server-side fetches (RSC, sitemap, ISR revalidation) call the backend
 * directly via `API_BACKEND_URL` and never traverse this proxy, so
 * SSR data flow is unaffected.
 */

const limiter = new RateLimiter({ windowMs: 60_000, limit: 60 });

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

export function proxy(req: NextRequest) {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  if (!isAllowedOrigin(origin) && !isAllowedReferer(referer)) {
    return NextResponse.json(
      { code: 'FORBIDDEN', message: '허용되지 않는 요청입니다.' },
      { status: 403 },
    );
  }

  const rl = limiter.check(getClientIp(req));
  if (!rl.ok) {
    return NextResponse.json(
      {
        code: 'RATE_LIMITED',
        message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rl.retryAfter ?? 60),
        },
      },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/backend/:path*',
};
