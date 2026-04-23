# Cheongyak.com — Project Guide

> Korean housing subscription (청약) information platform. Mobile-first, SEO-critical, fully public, admin-published content.

---

## 1. Project Overview

**What:** A polished, editorial-style web app that provides apartment subscription (청약) schedules, status, news, and market insights to Korean users aged 30–50.

**Key characteristics:**
- Fully public — no user login, no member system, no authentication
- Admin content management happens outside this web app (headless CMS or separate system)
- Mobile-first responsive design — majority of traffic is mobile web
- SEO-critical — housing info searches drive organic traffic
- Light theme only — no dark mode
- Author/editor info is never exposed to end users

**Reference documents:**
| Document | Purpose |
|---|---|
| `DESIGN.md` | Complete design system with token definitions |
| `ARCHITECTURE.md` | Tech stack, project structure, rendering strategy |
| `PAGES.md` | Page-by-page specifications and data requirements |

---

## 2. Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 (App Router) | Framework — SSR/SSG/ISR, file-based routing, Server Components |
| React | 19 | UI library — Server Components, concurrent features |
| TypeScript | 5.x (strict) | Language — `strict: true`, no implicit `any` |
| Tailwind CSS | 4.x | Styling — utility-first, maps to design token system |
| TanStack Query | 5.x | Server state — caching, background refetch, optimistic updates |
| Zustand | 5.x | Client state — UI state (modals, toasts) + `persist` for localStorage preferences |
| nuqs | 2.x | URL state — type-safe search params for filters/pagination |
| next-intl | 4.x | i18n — Korean-first, future-proofing for English expansion |
| Zod | 3.x | Validation — runtime API response validation |
| orval | 8.x | Codegen — OpenAPI → typed client + TanStack Query hooks + Zod validators |
| MSW | 2.x | Mocking — API mocks for development and testing |
| Vitest | 3.x | Unit/integration testing |
| Playwright | 1.x | E2E testing across browsers and mobile viewports |

**Not included:** No auth library (fully public site), no form library (public UI uses native elements + nuqs).

---

## 3. Architecture

### Rendering Strategy

| Route | Strategy | Revalidation |
|---|---|---|
| `/` (Home) | SSR + ISR | 60s |
| `/listings` (Listing) | SSR | Per-request |
| `/listings/[id]` (Detail) | SSG + ISR | 300s |
| `/news` (Feed) | SSR + ISR | 120s |
| `/news/[id]` (Article) | SSG + ISR | 600s |

**Default:** React Server Components. Use `"use client"` only where interactivity is required.

### Project Structure

```
src/
├── app/                    # Next.js App Router — flat, no route groups
│   ├── page.tsx            # / (Home)
│   ├── listings/           # /listings, /listings/:id
│   ├── news/               # /news, /news/:id
│   ├── layout.tsx          # Root layout
│   └── sitemap.ts
├── features/               # Feature modules (co-located logic)
│   ├── listings/           # components/, hooks/, types.ts, utils.ts
│   └── news/
├── shared/                 # Cross-cutting code
│   ├── components/         # Design system components (Button, Card, Chip...)
│   ├── hooks/              # Shared hooks
│   ├── stores/             # Zustand stores (ui, recent-views, filter-prefs)
│   ├── lib/                # Utilities, API client, constants
│   └── types/              # Global types, API types
├── styles/globals.css      # Tailwind directives + token overrides
├── mocks/                  # MSW handlers and fixtures
└── __tests__/              # E2E test specs
```

**Rules:**
- Features never import from other features — shared code goes in `shared/`
- Route files (`page.tsx`, `layout.tsx`) are thin wrappers composing feature components
- Co-locate unit tests next to source (`*.test.ts`); E2E in `__tests__/`
- No route groups — all pages are public, flat structure is simpler

### State Management

| Type | Solution | Example |
|---|---|---|
| Server state | TanStack Query | Listings, news articles, API data |
| URL state | nuqs | Filters, sort order, pagination |
| Client UI state | Zustand | Modal open/close, toast queue |
| Persisted preferences | Zustand + `persist` | Recent views (20 listings), last-used filter settings |

### Data Fetching

- **Server Components:** `fetch()` with `next.revalidate` for initial page data
- **Client Components:** Generated TanStack Query hooks from orval for interactive patterns
- **Prefetch:** `queryClient.prefetchQuery` on hover for detail page links
- **Stale time:** 60s default to reduce redundant requests

---

## 4. Pages

| Route | Page | Purpose |
|---|---|---|
| `/` | Home Dashboard | Weekly schedule, featured listing, market insights, top trades, recent views, latest news |
| `/listings` | Listings | Filterable/searchable list with 6 filter types, pagination |
| `/listings/[id]` | Listing Detail | Full info: overview, 7-phase timeline, supply breakdown, related news, official links |
| `/news` | News Feed | Category-tabbed article feed (정책/시장동향/분석/공지) |
| `/news/[id]` | News Article | Full article with related listings |

**Global Search:** Overlay triggered by navigation search icon or `⌘K` shortcut. Cross-content search (listings + news) with recent search history.

**Full specifications:** See `PAGES.md` for detailed sections, data requirements, mobile layouts, and acceptance criteria.

---

## 5. Design System

**Creative direction:** "The Editorial Architect" — premium, modern, community-app vibe with intentional asymmetry and tonal depth.

**Key constraints (non-negotiable):**
- Light theme only — no dark mode
- No 1px borders for sectioning — use background color shifts only
- No pure black (`#000000`) — use `color-text-primary` (`neutral-900`)
- Minimum `radius-md` (8px) on all interactive elements
- No color-only status indicators — always pair with icon or text

### Color Architecture

Colors are split into **Brand** (identity) and **Functional** (semantic meaning):

**Brand Colors (locked):**
| Token | Hex | Role |
|---|---|---|
| `brand-primary-500` | `#0356FF` | Core brand, CTAs, links, active states |
| `brand-secondary-500` | `#00FFC2` | Decorative accents, highlights (never as text on white) |
| `brand-tertiary-500` | `#FF7C4C` | Warm accent, promotional highlights |

**Functional Colors:**
| Token | Hex | Role |
|---|---|---|
| `success-500` | `#22C55E` | "접수중" (Accepting), positive states |
| `danger-500` | `#E11D48` | "마감" (Closed), errors |
| `warning-500` | `#F79009` | "마감임박" (Closing soon), caution |
| `info-500` | `#06B6D4` | "접수예정" (Upcoming), informational |

**Implementation rules:**
- Use semantic tokens (`color-bg-card`, `color-text-primary`) — never raw hex values
- Brand colors for identity, functional colors for status — never mix
- Tailwind config maps design tokens to utility classes
- `brand-secondary-500` has ~1.6:1 contrast on white — decorative only, never for text

**Token-first rule (mandatory):**
- All colors MUST use design token classes (e.g., `text-brand-primary-500`, `bg-bg-sunken`) — never raw hex, RGB, or Tailwind default palette (e.g., `bg-blue-500`, `text-gray-400`)
- All spacing MUST use token-mapped values (`gap-3`, `p-4`, `mb-6`) — never arbitrary values like `p-[13px]`
- All font sizes MUST use typography token classes (`text-body-md`, `text-headline-lg`) — never raw `text-sm`, `text-lg`
- All border-radius MUST use token values (`rounded-md`, `rounded-lg`) — never arbitrary values
- If no suitable token exists for a needed value, do NOT invent an arbitrary value. Instead, flag it as a design gap: add a `TODO: [DESIGN_TOKEN_NEEDED]` comment and note the missing token in the PR description so designers can review and extend the token system

**Full specification:** See `DESIGN.md` for complete token scales, typography, spacing, breakpoints, components, and accessibility specs.

---

## 6. Component Conventions

### Naming
- PascalCase for components: `SubscriptionCard`, `StatusChip`
- camelCase for hooks: `useSubscriptionFilters`
- kebab-case for files: `subscription-card.tsx`, `use-subscription-filters.ts`

### Structure
```
shared/components/
├── button/
│   ├── button.tsx          # Component implementation
│   ├── button.test.tsx     # Unit tests
│   └── index.ts            # Public export
```

### Props
- Max 5 props per component — split or use composition if exceeding
- Use TypeScript interfaces, not `type` aliases for component props
- Prefer composition (children, slots) over configuration (boolean props)
- Required props first, optional props second

---

## 7. Performance Budgets

### Core Web Vitals

| Metric | Target |
|---|---|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |

### Bundle Budgets

| Metric | Limit |
|---|---|
| Initial JS (gzip) | < 200 KB |
| Per-route JS (gzip) | < 50 KB |
| Total CSS (gzip) | < 30 KB |

### Image Rules
- All images via `next/image` — automatic WebP/AVIF, responsive srcSet, lazy loading
- Hero images: `priority` prop, AVIF format
- Thumbnails: max 400px width, quality 75
- Placeholder: `placeholder.svg` as blur placeholder

### Code Splitting
- Route-based splitting is automatic (App Router)
- Heavy components: `next/dynamic` with `ssr: false`
- Third-party scripts: `next/script` with `afterPretendardactive` or `lazyOnload`

---

## 8. Testing Strategy

### Testing Pyramid

| Level | Tool | What to Test |
|---|---|---|
| Unit | Vitest | Utilities, hooks, pure functions, Zod schemas |
| Component | Vitest + RTL | Component rendering, interactions, states |
| Integration | Vitest + MSW | Data fetching flows, API error handling |
| E2E | Playwright | Critical user flows, cross-browser, mobile viewports |
| Visual | Chromatic | Visual regression on component changes |

**Vitest environment:** `happy-dom` (set in `vitest.config.ts`). Tests that
must render in a pure Node context (e.g. SSR output assertions) opt out per
file with `// @vitest-environment node`. `jsdom` was dropped in favor of
`happy-dom` to avoid an `ERR_REQUIRE_ASYNC_MODULE` ESM interop failure on
vitest 3.

### Rules
- Test behavior, not implementation — test what users see and do
- Every bug fix gets a regression test
- Use realistic Korean test data, not Lorem Ipsum
- Flaky tests are P0 bugs — fix or remove immediately
- CI fails on test failure — no merging with broken tests
- **Skeleton parity RTL gate (Phase B-2a):** every route-level `loading.tsx`
  has a sibling `loading.test.tsx` that pins which `*.skeleton.tsx` components
  it renders and in what count. If you change the loader's shape, update the
  test in the same PR — dropping a sibling skeleton or reintroducing a phantom
  section must fail CI, not slip through review. Home (`/`) is the exception:
  it ships no `app/loading.tsx` — its section skeletons live as inline
  `<Suspense>` fallbacks inside `app/page.tsx` so they don't bleed through as
  the outer Suspense boundary of `/listings` or any other child route during
  streaming.
- **Skeleton parity Playwright gate (Phase B-2b):** `e2e/skeleton-parity.spec.ts`
  boots Chromium against `pnpm dev` (port 715), artificially delays the
  TanStack Query fetch for `/listings`, and asserts the first
  `SubscriptionCardSkeleton`'s rendered `offsetHeight` is within 10% of
  the first real `<article>` it replaces. Per-card parity is the right
  unit: the skeleton always renders 6 placeholder cards while the real
  list renders 20+, so outer-wrapper totals could never match, but each
  card must occupy the same box as its placeholder or users feel the
  shift. It is main-branch-only work — opt in via
  `pnpm test:e2e:skeleton-parity`; the default `pnpm test:e2e` skips it
  so PR latency stays low. CI wiring lives in
  `.github/workflows/skeleton-parity.yml`, which runs on `push` to
  `main` and `workflow_dispatch`; it requires an `API_BACKEND_URL` repo
  secret because the spec's `page.route` handler delays but does not
  stub real traffic. `/listings/[id]` is *not* covered: the detail page
  is a pure Server Component reading static fixtures, so on Next 16 +
  React 19 the concurrent router stages the new tree inside
  `<div hidden>` and atomically unwraps once ready — `loading.tsx`
  never actually renders visible, so there is no runtime CLS risk to
  measure. The RTL gate at
  `src/app/listings/[id]/loading.test.tsx` still pins the detail
  loader's composition as a correctness guard. Home (`/`) is also not
  yet covered: its API fetches run server-side, so `page.route` cannot
  lengthen the skeleton phase without an MSW browser worker or a
  dev-server latency flag — tracked in
  `docs/skeleton-parity-test-plan.md` as follow-up.

---

## 9. Accessibility

### Standards
- **WCAG 2.2 AA** compliance minimum
- **KWCAG** (Korean Web Content Accessibility Guidelines) compliance
- 장애인차별금지법 requires accessible public information services

### Requirements
- Contrast: 4.5:1 for normal text, 3:1 for large text and UI components
- Focus: 2px solid `brand-primary-500` ring with 2px offset, visible on `:focus-visible` only
- Touch targets: minimum 44×44px
- Keyboard: full navigation support, logical tab order, focus management on route changes
- Reduced motion: respect `prefers-reduced-motion` — disable non-essential animation
- Screen readers: semantic HTML, ARIA attributes where needed, descriptive alt text
- Color-blind safety: never use color alone — pair with icon or text label

---

## 10. API Integration

### Pattern
- Backend team publishes OpenAPI 3.1 spec. The URL lives in `.env.local` as `OPENAPI_URL` — never committed (see `.claude/api-docs.local.md`, gitignored).
- `pnpm codegen` runs `orval` through `dotenv-cli`, emitting TanStack Query hooks, fetch functions, and Zod validators to `src/shared/api/generated/`.
- Config: `orval.config.ts` at repo root. Mutator: generated fetch calls route through `apiClientMutator` in `src/shared/lib/api-client.ts` — single source for base URL, headers, and `ApiClientError` normalization.
- `pnpm codegen:check` (CI gate) runs codegen and fails if the generated files drift from committed.

### Error Handling
```typescript
interface ApiError {
  status: number;
  code: string;       // Machine-readable: "LISTING_NOT_FOUND"
  message: string;    // Human-readable Korean message
}
```
- 4xx → inline UI error messages or error boundaries
- 5xx → generic fallback UI + error reporting (Sentry)
- Network errors → TanStack Query retry (3 attempts, exponential backoff)

---

## 11. SEO & GEO

**Owner:** Dewey (`.claude/agents/dewey.md`). Bolt owns Core Web Vitals as a ranking signal.

### SEO (classical search)
- Every route uses `buildPageMetadata()` from `src/shared/lib/seo.ts` — enforces canonical, OG, Twitter, and Korean-language meta descriptions consistently
- Root layout sets `metadataBase`, default OG, and injects `OrganizationJsonLd` site-wide
- JSON-LD: `Organization` + `WebSite` site-wide, `RealEstateListing` + `BreadcrumbList` on listing detail (SearchAction is held back until `/listings` binds a `q` parameter — declaring it without a working endpoint disables Google Sitelinks Search Box)
- Dynamic OG images via `/og` edge route (`next/og` `ImageResponse`) — pass `?title=` and `?subtitle=` to customize
- Dynamic `sitemap.ts` with all public URLs (static + subscription detail); `/trades` included even during coming-soon phase
- `robots.ts` allows all paths (fully public site)

### GEO (AI-engine optimization)
- `public/llms.txt` summarizes site purpose, key routes, data sources, and citation guidance for LLM crawlers
- Content pattern: claim → evidence → source; prefer structured headings and concise definitions to be citation-worthy in AI Overviews/Perplexity

### Pointers
- Keyword strategy: `docs/seo-keyword-map.md`
- hreflang/i18n roadmap: `docs/seo-i18n-plan.md`

---

## 12. Deployment

- **Platform:** Vercel (zero-config Next.js, edge network, automatic ISR)
- **Production:** `main` branch → cheongyak.com
- **Preview:** Every PR gets a unique preview URL
- **CI/CD:** GitHub Actions → lint, type-check, test, build, bundle size check → Vercel deploy

### Environment Variables
| Variable | Scope | Purpose |
|---|---|---|
| `API_BACKEND_URL` | Server-only | Backend API origin. Browser never sees this — CSR calls hit `/api/backend/*`, which `next.config.ts` rewrites to this origin server-side. Deliberately no `NEXT_PUBLIC_` prefix. |
| `OPENAPI_URL` | Build-time | OpenAPI JSON URL consumed by `pnpm codegen`; read via `dotenv-cli` from `.env.local`. |

All secrets via Vercel dashboard — **never in code or commits**.

---

## 13. Security

**This is a public repository.** Never commit:
- API tokens, keys, or secrets
- URLs containing tokens or credentials
- Database connection strings
- Personally identifiable information

Use environment variables exclusively. Before every commit, verify no secrets are present.

---

## 14. Cross-Validation Rules (MANDATORY)

Every task that modifies code or documentation must include a cross-validation step before completion. This rule is permanent and applies to all future work.

**Mandate:** if a PR touches code that any trigger below covers, the same PR must update the listed docs. A commit that changes code AND the matching docs together is correct; a commit that only updates code with no doc touch is a defect.

### Doc-sync triggers (code → docs to update in the SAME PR)

| Trigger (code change) | Docs that must be updated |
|---|---|
| Add / remove / rename a route under `src/app/` | `PAGES.md`·`PAGES.ko.md` (route table, SEO requirements), `ARCHITECTURE.md`·`ko` §3 rendering table, `CLAUDE.md`·`ko` §4, `src/app/sitemap.ts` |
| Edit `src/shared/lib/seo.ts` (metadata helper) | `CLAUDE.md`·`ko` §11, `ARCHITECTURE.md`·`ko` §7 |
| Edit `src/shared/components/json-ld.tsx` (schema helpers) | `CLAUDE.md`·`ko` §11, `ARCHITECTURE.md`·`ko` §7 (schema table) |
| Edit `src/app/og/route.tsx` or any OG design constant | `DESIGN.md`·`ko` (token drift check), `ARCHITECTURE.md`·`ko` §7 |
| Edit `public/llms.txt` | `docs/seo-keyword-map.md`, trigger Kim Jeong-ho domain review |
| Edit `docs/seo-keyword-map.md` or per-page `keywords` arrays | `docs/seo-keyword-map.md` route table + `CLAUDE.md`·`ko` §11 if ownership shifts |
| Add / remove Tailwind token or tailwind.config change | `DESIGN.md`·`ko` (token tables), `PAGES.md`·`ko` (usage snippets) |
| Change API endpoint contracts or `src/shared/types/api.ts` | `PAGES.md`·`ko` data requirements, `ARCHITECTURE.md`·`ko` §6 API table |
| Add / change an agent under `.claude/agents/*.md` | `CLAUDE.md`·`ko` §2 (if role boundary shifts), cross-referenced agents' "Behavior in Discussions" |
| Change Next.js / React / Tailwind / Vitest major version in `package.json` | `CLAUDE.md`·`ko` §2 tech-stack table, `ARCHITECTURE.md`·`ko` §1 |
| Add a test strategy or CI gate (e.g. `scripts/audit-seo.mjs`) | `CLAUDE.md`·`ko` §8, `ARCHITECTURE.md`·`ko` §9 |
| Edit a real component that has a `*.skeleton.tsx` sibling, or add / modify / remove a route-level `loading.tsx` | Matching `*.skeleton.tsx` sibling (update DOM structure + approximate heights so Suspense/route fallback mirrors the final layout — preserves CLS per `ARCHITECTURE.md` §7 Performance) + matching `loading.test.tsx` sibling (update sibling-skeleton counts / `data-testid` assertions so the RTL gate stays green) |

### Document Sync (pairwise consistency)
- When modifying any `.md` file, its `.ko.md` counterpart must be updated in the same commit
- Tech stack versions must match exactly across `CLAUDE.md` and `ARCHITECTURE.md`
- Route paths must match exactly across `CLAUDE.md`, `ARCHITECTURE.md`, and `PAGES.md`
- Color token names and values must match exactly across `DESIGN.md` and `PAGES.md`
- Schema.org types in use must match across `src/shared/components/json-ld.tsx`, `CLAUDE.md` §11, `ARCHITECTURE.md` §7, `PAGES.md` SEO Requirements
- **Skeleton pairing:** every feature component with non-trivial layout SHOULD ship a sibling `*.skeleton.tsx` that renders the same outer shell and approximate dimensions. If the component changes shape (adds/removes a section, changes grid columns, shifts major heights), the sibling skeleton must be updated in the same PR. Route-level `loading.tsx` should compose these sibling skeletons rather than duplicate their DOM. Skeletons MUST use the shared `<Skeleton>` primitive — never raw `animate-pulse` — so `prefers-reduced-motion` stays honored. The primitive animates with a `skeleton-wave` gradient keyed off `--duration-shimmer` (defined in `globals.css`); never revive the old `skeleton-pulse` keyframe. Each sibling skeleton carries a stable `data-testid` (e.g. `subscription-card-skeleton`, `home-hero-skeleton`) so the sibling `loading.test.tsx` at the route level can pin its composition — renaming or removing those testids without updating the test is a CI failure.
- **App bootstrap splash vs route skeleton:** the brand logo splash (`<AppSplash />` + `<AppReadyMarker />` wired in `app/layout.tsx`, styled as `#app-splash` in `globals.css`) covers only the pre-hydration bootstrap frame. It hides on first `useEffect` via `body[data-app-ready="true"]` and stays hidden for the remainder of the session. Route-level `loading.tsx` files MUST remain page-shaped skeletons and MUST NOT be replaced with the splash — they handle in-app navigation and API loading, which run after the splash is gone.

### Translation Sync
- All `.ko.md` files must have identical section structure to their English counterparts
- Technical terms (Next.js, TypeScript, SSR, ISR, etc.) remain in English in Korean docs
- Design token names remain in English in Korean docs
- Hex codes and numeric values must be identical between language versions

### How to enforce (operational)
- **Before staging** code changes: run `git status` and identify which rows of the trigger table fire, then edit those docs and restage together
- **Before committing**: run `npm run audit:seo` when SEO-adjacent files changed; run `npm run type-check && npm test` always
- **If no doc change is needed** because the trigger is a pure refactor (behavior unchanged, no contract drift), call it out explicitly in the commit body: `Docs: no change required — refactor only`

### Verification Checklist (per task)
- [ ] Every applicable row of the trigger table fired and its docs are updated
- [ ] EN/KO translations in sync (identical section structure and numbers)
- [ ] Code and documentation aligned (no stale references)
- [ ] No hardcoded secrets or sensitive info
- [ ] `npm run audit:seo` passes when SEO/Metadata/JSON-LD files changed
- [ ] Status chip colors match DESIGN.md chip spec

---

## 15. Slack Integration

Agents communicate via Slack threads. Each task has its own thread per channel.

### Scripts (`~/.claude/scripts/`)

| Script | Usage |
|---|---|
| `slack-notify.sh` | `<channel> <message> [thread_ts]` — send/reply |
| `slack-read.sh` | `<channel> [--thread <ts>]` — read messages |
| `slack-react.sh` | `<channel> <timestamp> <emoji>` — add reaction |
| `task-state.sh` | `<file> get/set <field> [value]` — atomic state helper |

### Channels

| Channel | Purpose |
|---|---|
| `progress` | Activity log, milestones |
| `questions` | Questions, permission requests |
| `errors` | Build/test failures, security issues |
| `review` | Plan approval, result review (Korean) |
| `decisions` | Architecture, tech stack, design decisions |

### Workflow
1. Analyze request
2. Create plan (Korean) with `[NEED_APPROVAL]` tag
3. Wait for approval
4. Execute
5. Complete with `[TASK_COMPLETE]` tag

**If `$TASK_STATE_FILE` is not set, skip Slack reporting.**

---

## 16. Pre-Commit Checklist

- [ ] No hardcoded tokens, keys, or secrets
- [ ] `.env` and `settings.local.json` in `.gitignore`
- [ ] Sensitive config uses environment variables only
- [ ] TypeScript compiles with no errors
- [ ] All tests pass
- [ ] Bundle size within budget
- [ ] Cross-validation rules satisfied (Section 14)

---

## 17. Writing to `.claude/` Directory

The `.claude/` directory is protected. Standard `Write` and `Edit` tools will be denied.

**Use `mcp__filesystem__write_file` and `mcp__filesystem__edit_file` instead.**

---

## 18. Language Policy

| Context | Language |
|---|---|
| Code, comments, documentation | English |
| Slack `review` channel | Korean |
| User-facing UI content | Korean |
| Commit messages | English |
