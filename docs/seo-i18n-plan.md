# i18n & hreflang Strategy — cheongyak.com

**Owner:** Dewey (`.claude/agents/dewey.md`)
**Architecture partner:** Gaudi (`.claude/agents/gaudi.md`)
**Status:** Planning only — no routing code changes yet.
**Last updated:** 2026-04-18

This document captures how cheongyak.com will handle international search exposure **before** an English surface actually ships. The goal is to make the eventual switch additive (no breaking URL changes for Korean users).

## Why this document exists now

- The codebase already depends on `next-intl@4` (per `package.json`) but no translation files or locale-scoped routing are wired up.
- Current `<html lang="ko">` in `src/app/layout.tsx` is correct while Korean is the only locale — but the moment a second locale appears, every canonical URL and sitemap entry must change shape.
- Landing on the wrong shape later (e.g. `/en/listings` vs `/listings?lang=en` vs subdomain) causes either duplicate-content penalties or manual 301 backfill across hundreds of listing URLs.

## Decision: path-based locale prefix

- Korean (default): `https://cheongyak.com/...` — **remains prefix-free** even after English ships (preserves existing ranking, no redirects required).
- English (future): `https://cheongyak.com/en/...` — under a `[locale]` segment opted-in via `next-intl`'s routing.

Rejected alternatives:
- Subdomain (`en.cheongyak.com`) — splits link equity, complicates analytics, adds DNS overhead.
- Query string (`?lang=en`) — poorly indexed, hostile to canonical resolution.
- Locale cookie only — invisible to crawlers; search engines cannot index the English version at all.

## Required when English launches

### Routing
- Adopt `next-intl` middleware with `localePrefix: 'as-needed'` so the default locale (ko) stays prefix-free.
- All app routes move under `src/app/[locale]/...` in a future refactor — Gaudi to own the migration PR.

### Metadata
- Extend `buildPageMetadata()` in `src/shared/lib/seo.ts` to accept `locale` and output `alternates.languages`:
  ```ts
  alternates: {
    canonical,
    languages: {
      'ko-KR': `${SITE_URL}${canonicalPath}`,
      'en-US': `${SITE_URL}/en${canonicalPath}`,
      'x-default': `${SITE_URL}${canonicalPath}`,
    },
  }
  ```
- `<html lang>` becomes dynamic from the `[locale]` segment.

### Sitemap
- Emit `xhtml:link rel="alternate"` entries per locale. Next.js supports this via the `alternates` field on each sitemap entry from Next 14+.

### Schema
- `inLanguage` on `WebSite`/`NewsArticle` switches based on locale.
- `Organization` schema remains single-source (bilingual name acceptable via `alternateName`).

### Content
- Do **not** machine-translate 청약 regulatory terminology. Kim Jeong-ho must review the English glossary (e.g. "청약" → "housing subscription", never "contract").
- Mirror the `llms.txt` into `public/llms.en.txt` for LLM crawlers targeting English answers, served at `/en/llms.txt` via a thin route handler.

## What NOT to do now

- Do not add `<link rel="alternate" hreflang="…">` tags today — there is no English surface, and pointing at untranslated pages actively hurts SEO.
- Do not introduce `[locale]` segment prematurely — it bloats every per-route edit until an actual English copy exists.
- Do not register `x-default` without a real default — Google treats dangling `x-default` as a signal of neglect.
- Do not set a `Content-Language` HTTP header opportunistically. Search engines prefer inline `<html lang>` and hreflang tags; sending a divergent header creates conflicting signals.
- Do not switch `<html lang>` based on `Accept-Language` until the `[locale]` segment actually exists. Serving `<html lang="en">` on otherwise-Korean pages tells crawlers the content is English, which demotes Korean rankings.

## Pre-flight checklist (when English launch is scheduled)

- [ ] Product/Nolan: confirm target launch date + initial route coverage (home + listings first, detail later is fine)
- [ ] Kim Jeong-ho: sign off on 청약 terminology glossary in English
- [ ] Gaudi: plan the `[locale]` migration in one PR (routing + layout)
- [ ] Dewey: update `buildPageMetadata()` for `alternates.languages`, extend sitemap alternates, add `en/llms.txt`
- [ ] Bolt: verify no CWV regressions from middleware locale detection
- [ ] Sherlock: E2E on both locales (Korean golden path, English smoke)
- [ ] Chanel: RTL/LTR — no RTL needed for en, but confirm no hardcoded widths break with longer English copy
- [ ] Helen: screen reader announces the language switcher correctly

## Related docs

- SEO ownership: `CLAUDE.md` §11
- Architecture: `ARCHITECTURE.md` §7
- Keyword strategy (currently Korean-only): `docs/seo-keyword-map.md`
