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
| orval | 7.x | Codegen — OpenAPI → typed client + TanStack Query hooks |
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

### Rules
- Test behavior, not implementation — test what users see and do
- Every bug fix gets a regression test
- Use realistic Korean test data, not Lorem Ipsum
- Flaky tests are P0 bugs — fix or remove immediately
- CI fails on test failure — no merging with broken tests

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
- Backend team publishes OpenAPI 3.1 spec
- `orval` generates typed fetch client + TanStack Query hooks (`npm run codegen`)
- CI enforces codegen freshness — fails if spec changed but codegen not re-run

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
| `NEXT_PUBLIC_API_URL` | All | Backend API base URL |

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

### Document Sync
- When modifying any `.md` file, verify its `.ko.md` counterpart is updated with the same changes
- When modifying `CLAUDE.md`, verify referenced specs in `DESIGN.md`, `ARCHITECTURE.md`, `PAGES.md` are consistent
- Tech stack versions must match exactly across `CLAUDE.md` and `ARCHITECTURE.md`
- Route paths must match exactly across `CLAUDE.md`, `ARCHITECTURE.md`, and `PAGES.md`
- Color token names and values must match exactly across `DESIGN.md` and `PAGES.md`

### Code-Document Sync
- When modifying component code, verify `DESIGN.md` component specs are still accurate
- When adding/removing routes, update `PAGES.md`, `ARCHITECTURE.md`, and `CLAUDE.md`
- When changing API endpoints, update `PAGES.md` data requirements tables
- When modifying design tokens in code (Tailwind config), verify `DESIGN.md` matches

### Translation Sync
- All `.ko.md` files must have identical section structure to their English counterparts
- Technical terms (Next.js, TypeScript, SSR, ISR, etc.) remain in English in Korean docs
- Design token names remain in English in Korean docs
- Hex codes and numeric values must be identical between language versions

### Verification Checklist (per task)
- [ ] No contradictions between modified documents
- [ ] EN/KO translations in sync
- [ ] Code and documentation aligned
- [ ] No hardcoded secrets or sensitive info
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
