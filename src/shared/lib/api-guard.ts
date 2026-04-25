/**
 * Pure helpers backing the `/api/backend/*` middleware (`src/middleware.ts`).
 *
 * Split out so the allowlist + rate-limit logic stays unit-testable
 * without standing up a `NextRequest` mock. The middleware imports
 * these helpers and only adds the request-shape adapter on top.
 *
 * Defense layers (see middleware comment for the full rationale):
 *
 *   1. `isAllowedOrigin` / `isAllowedReferer` — accept requests whose
 *      `Origin` or `Referer` resolves to our production domain, a
 *      Vercel preview, or localhost. Forging these headers is cheap,
 *      so this is a first-pass filter, not a hard gate.
 *
 *   2. `RateLimiter` — fixed-window counter keyed on client IP.
 *      Counters live in instance memory; with Fluid Compute reusing
 *      instances the window is meaningful, but new instances start
 *      clean (so effective ceiling = `limit × instances`). Acceptable
 *      as a first line; swap the in-memory bucket for a shared store
 *      when traffic warrants it.
 */

const ALLOWED_ORIGINS = new Set([
  'https://cheongyak.com',
  'https://www.cheongyak.com',
]);

export function isAllowedOrigin(raw: string | null): boolean {
  if (!raw) return false;
  if (ALLOWED_ORIGINS.has(raw)) return true;
  try {
    const url = new URL(raw);
    if (url.hostname.endsWith('.vercel.app')) return true;
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return true;
  } catch {
    return false;
  }
  return false;
}

export function isAllowedReferer(raw: string | null): boolean {
  if (!raw) return false;
  try {
    return isAllowedOrigin(new URL(raw).origin);
  } catch {
    return false;
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets — populated only when `ok` is false. */
  retryAfter?: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimiterOptions {
  /** Window length in milliseconds. */
  windowMs: number;
  /** Max requests per window per key. */
  limit: number;
  /** Hard ceiling on tracked keys to bound memory. */
  maxKeys?: number;
  /** Time source — overridable for tests. */
  now?: () => number;
}

export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly windowMs: number;
  private readonly limit: number;
  private readonly maxKeys: number;
  private readonly now: () => number;

  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs;
    this.limit = options.limit;
    this.maxKeys = options.maxKeys ?? 10_000;
    this.now = options.now ?? Date.now;
  }

  check(key: string): RateLimitResult {
    const now = this.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      if (this.buckets.size >= this.maxKeys) {
        // Rough LRU: drop the oldest insertion. We don't need exact
        // LRU semantics for an approximate defense layer.
        const oldest = this.buckets.keys().next().value;
        if (oldest !== undefined) this.buckets.delete(oldest);
      }
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return { ok: true };
    }

    bucket.count += 1;
    if (bucket.count > this.limit) {
      return {
        ok: false,
        retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      };
    }
    return { ok: true };
  }

  reset(): void {
    this.buckets.clear();
  }
}
