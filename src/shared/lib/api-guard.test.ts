import { beforeEach, describe, expect, it } from 'vitest';
import {
  RateLimiter,
  isAllowedOrigin,
  isAllowedReferer,
} from './api-guard';

describe('isAllowedOrigin', () => {
  it('accepts the canonical production origin', () => {
    expect(isAllowedOrigin('https://cheongyak.com')).toBe(true);
    expect(isAllowedOrigin('https://www.cheongyak.com')).toBe(true);
  });

  it('accepts Vercel preview deployments', () => {
    expect(
      isAllowedOrigin('https://cheongyak-com-git-feat-x.vercel.app'),
    ).toBe(true);
  });

  it('accepts localhost for dev builds', () => {
    expect(isAllowedOrigin('http://localhost:715')).toBe(true);
    expect(isAllowedOrigin('http://localhost:3000')).toBe(true);
    expect(isAllowedOrigin('http://127.0.0.1:715')).toBe(true);
  });

  it('rejects unknown origins', () => {
    expect(isAllowedOrigin('https://evil.com')).toBe(false);
    expect(isAllowedOrigin('https://cheongyak.com.evil.com')).toBe(false);
  });

  it('rejects null / empty origin', () => {
    expect(isAllowedOrigin(null)).toBe(false);
    expect(isAllowedOrigin('')).toBe(false);
  });

  it('rejects malformed origin strings', () => {
    expect(isAllowedOrigin('not-a-url')).toBe(false);
    expect(isAllowedOrigin('javascript:alert(1)')).toBe(false);
  });
});

describe('isAllowedReferer', () => {
  it('accepts a referer whose origin matches the allowlist', () => {
    expect(isAllowedReferer('https://cheongyak.com/listings')).toBe(true);
    expect(
      isAllowedReferer('https://cheongyak-com-git-feat.vercel.app/listings?page=2'),
    ).toBe(true);
  });

  it('rejects a referer whose origin is not allowed', () => {
    expect(isAllowedReferer('https://evil.com/clone')).toBe(false);
  });

  it('rejects null / empty / malformed referers', () => {
    expect(isAllowedReferer(null)).toBe(false);
    expect(isAllowedReferer('')).toBe(false);
    expect(isAllowedReferer('not-a-url')).toBe(false);
  });
});

describe('RateLimiter', () => {
  let now: number;
  let limiter: RateLimiter;

  beforeEach(() => {
    now = 1_000_000;
    limiter = new RateLimiter({
      windowMs: 60_000,
      limit: 3,
      now: () => now,
    });
  });

  it('allows requests up to the per-window limit', () => {
    expect(limiter.check('1.2.3.4').ok).toBe(true);
    expect(limiter.check('1.2.3.4').ok).toBe(true);
    expect(limiter.check('1.2.3.4').ok).toBe(true);
  });

  it('blocks the request that exceeds the limit and reports retry-after', () => {
    limiter.check('1.2.3.4');
    limiter.check('1.2.3.4');
    limiter.check('1.2.3.4');
    const result = limiter.check('1.2.3.4');
    expect(result.ok).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
    expect(result.retryAfter).toBeLessThanOrEqual(60);
  });

  it('resets a key after the window elapses', () => {
    limiter.check('1.2.3.4');
    limiter.check('1.2.3.4');
    limiter.check('1.2.3.4');
    expect(limiter.check('1.2.3.4').ok).toBe(false);

    now += 60_001;
    expect(limiter.check('1.2.3.4').ok).toBe(true);
  });

  it('tracks separate counters per IP', () => {
    limiter.check('1.2.3.4');
    limiter.check('1.2.3.4');
    limiter.check('1.2.3.4');
    expect(limiter.check('1.2.3.4').ok).toBe(false);
    // A different client IP starts fresh.
    expect(limiter.check('5.6.7.8').ok).toBe(true);
  });

  it('bounds memory by evicting the oldest entry past `maxKeys`', () => {
    const tiny = new RateLimiter({
      windowMs: 60_000,
      limit: 5,
      maxKeys: 2,
      now: () => now,
    });
    tiny.check('a');
    tiny.check('b');
    // Inserting a third key should evict 'a' (the oldest insertion).
    tiny.check('c');
    // 'a' is gone, so it gets a fresh window — it's allowed all over
    // again. Asserting via behavior rather than peeking at internals.
    for (let i = 0; i < 5; i++) {
      expect(tiny.check('a').ok).toBe(true);
    }
  });
});
