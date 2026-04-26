import '@testing-library/jest-dom/vitest';

// Required by `src/shared/lib/seo.ts` — pin the canonical production URL so
// tests asserting on SITE_URL / canonical / sitemap shape are deterministic
// regardless of the developer's local `.env.local`.
process.env.NEXT_PUBLIC_SITE_URL ??= 'https://cheongyak.com';
