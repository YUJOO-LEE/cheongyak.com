# Architecture Document

## 1. Tech Stack

| Technology | Version | Rationale |
|---|---|---|
| **Next.js** | 15 (App Router) | SSR/SSG/ISR flexibility, file-based routing, React Server Components — natural fit for SEO-critical content site |
| **React** | 19 | Server Components, concurrent features, improved hydration |
| **TypeScript** | 5.x (strict mode) | Catch errors at compile time; strict mode eliminates implicit `any` |
| **Tailwind CSS** | 4.x | Utility-first matches the design system's token-based approach; purges unused CSS for minimal bundles |
| **TanStack Query** | 5.x | Server-state caching, background refetch, optimistic updates for listing filters |
| **Zustand** | 5.x | Lightweight client state (UI toggles, modal state) + `persist` middleware for localStorage preferences |
| **nuqs** | 2.x | Type-safe URL search params for filter/sort state that survives navigation and sharing |
| **next-intl** | 4.x | Future-proofing for i18n; Korean-first with potential English expansion |
| **Zod** | 3.x | Runtime validation of API responses at the boundary; pairs with TypeScript for end-to-end type safety |
| **orval** | 7.x | OpenAPI → typed TypeScript client + TanStack Query hooks auto-generation |
| **MSW** | 2.x | API mocking for development and testing without backend dependency |
| **Vitest** | 3.x | Fast unit/integration tests with native ESM and TypeScript support |
| **Playwright** | 1.x | Cross-browser E2E tests including mobile viewports |

**Not included (by design):**
- No auth library — this is a fully public information platform with no user login
- No form library — public UI uses native form elements with nuqs for URL state; no complex forms exist

---

## 2. Project Structure

```
src/
├── app/                        # Next.js App Router (routes + layouts)
│   ├── page.tsx                # Home Dashboard (/)
│   ├── subscriptions/
│   │   ├── page.tsx            # Subscription Listing (/subscriptions)
│   │   └── [id]/
│   │       └── page.tsx        # Subscription Detail (/subscriptions/:id)
│   ├── news/
│   │   ├── page.tsx            # News Feed (/news)
│   │   └── [id]/
│   │       └── page.tsx        # News Article (/news/:id)
│   ├── search/
│   │   └── page.tsx            # Global Search (/search)
│   ├── layout.tsx              # Root layout (fonts, metadata, providers)
│   ├── not-found.tsx
│   ├── error.tsx
│   └── sitemap.ts
├── features/                   # Feature modules (co-located logic)
│   ├── subscriptions/
│   │   ├── components/         # Feature-specific UI
│   │   ├── hooks/              # Feature-specific hooks
│   │   ├── types.ts            # Feature types
│   │   └── utils.ts
│   └── news/
├── shared/                     # Cross-cutting shared code
│   ├── components/             # Design system components (Button, Card, Chip, etc.)
│   ├── hooks/                  # Shared hooks (useMediaQuery, useDebounce)
│   ├── stores/                 # Zustand stores
│   │   ├── use-ui-store.ts           # Transient UI state (modals, toasts)
│   │   ├── use-recent-views-store.ts # localStorage persisted (last 20 viewed listings)
│   │   └── use-filter-prefs-store.ts # localStorage persisted (last-used filters)
│   ├── lib/                    # Utilities (api-client, date formatting, constants)
│   └── types/                  # Global types, API response types
├── styles/
│   └── globals.css             # Tailwind directives + design token overrides
├── mocks/                      # MSW handlers and fixtures
└── __tests__/                  # E2E test specs
```

**Rules:**
- Features never import from other features — shared code goes in `shared/`.
- Route files (`page.tsx`, `layout.tsx`) are thin wrappers that compose feature components.
- Co-locate tests next to source files (`*.test.ts`) for unit/integration; E2E in `__tests__/`.
- No route groups needed — all pages are public, flat structure is simpler.

---

## 3. Rendering Strategy

| Page | Strategy | Rationale |
|---|---|---|
| **Home Dashboard** | SSR + ISR (60s) | Shows latest listings and news; must be fresh but cacheable |
| **Subscription Listing** | SSR | Filter/sort params make each request unique; server rendering ensures SEO for filtered views |
| **Subscription Detail** | SSG + ISR (300s) | Individual listing content changes infrequently; pre-render known IDs, ISR for long tail |
| **News Feed** | SSR + ISR (120s) | Frequently updated feed; ISR balances freshness with performance |
| **News Article** | SSG + ISR (600s) | Published articles are near-static; ISR handles edits |
| **Search** | CSR | Interactive query UI; no SEO value for search results page |

All pages use React Server Components by default. Client Components (`"use client"`) only where interactivity is required (filters, modals, search input).

---

## 4. State Management

| State Type | Solution | Scope |
|---|---|---|
| **Server state** | TanStack Query | API data caching, background refetch, pagination, optimistic updates |
| **URL state** | nuqs | Filters, sort order, pagination params — shareable and bookmarkable |
| **Client UI state** | Zustand | Modal open/close, toast queue — minimal, transient |
| **Persisted preferences** | Zustand + `persist` | Recent views (last 20 listing IDs), last-used filter settings — stored in localStorage |
| **Server Component data** | `async` components + `fetch` | Initial page data loaded in Server Components, no client state needed |

**Principle:** Prefer server-side data fetching in Server Components. Use TanStack Query only for client-interactive patterns (filter updates, polling). Keep Zustand stores small and feature-scoped. Three stores maximum.

### localStorage Features (No-Auth Personalization)

| Feature | Store | Data | Limit |
|---|---|---|---|
| Recent Views | `use-recent-views-store` | Last 20 viewed listing IDs + timestamps | Shown on Home Dashboard |
| Filter Preferences | `use-filter-prefs-store` | Last-used region, type, sort order | Auto-applied on return visits |

**Explicitly not implemented:** Favorites/bookmarks (vanish on browser clear — worse UX than not having them). Instead, a "공유" (Share) button on detail pages using Web Share API.

---

## 5. Data Fetching

### Server Components (Initial Load)
```
Server Component → fetch() with Next.js cache → API Server
```
- Use Next.js `fetch` with `next.revalidate` for ISR control.
- Data flows as props to client components — no waterfall.

### Client Components (Interactive)
```
Client Component → TanStack Query hook → Typed API Client → API Server
```
- Generated query hooks from orval ensure type safety end-to-end.
- `staleTime: 60_000` default to reduce redundant requests.
- Prefetch on hover for detail page links (`queryClient.prefetchQuery`).

### API Client
- Single typed API client generated from OpenAPI spec via orval.
- Base URL from environment variable (`NEXT_PUBLIC_API_URL`).
- Request/response interceptors for error normalization.
- All API types auto-generated — never hand-write API interfaces.

---

## 6. API Contract

### Contract-Driven Development
1. Backend publishes OpenAPI 3.1 spec (JSON) at a known URL or checked into repo.
2. `orval` generates typed fetch client + TanStack Query hooks on `npm run codegen`.
3. CI fails if generated code is stale (spec changed but codegen not re-run).

### Error Handling Pattern
```typescript
// API errors normalized to a consistent shape
interface ApiError {
  status: number;
  code: string;       // Machine-readable: "LISTING_NOT_FOUND"
  message: string;    // Human-readable Korean message
}
```
- 4xx errors surfaced to UI via error boundaries or inline messages.
- 5xx errors trigger generic fallback UI + error reporting.
- Network errors handled with TanStack Query retry (3 attempts, exponential backoff).

### Development Mocking (MSW)
- MSW handlers mirror the OpenAPI spec for frontend-independent development.
- Fixtures use realistic Korean housing data for visual testing.
- MSW active in development and Storybook; disabled in production builds.

---

## 7. SEO Strategy

### Metadata API
- Each route exports `generateMetadata()` for dynamic title, description, and Open Graph tags.
- Korean-language meta descriptions with target keywords (청약, 아파트 분양, 청약 일정).
- Canonical URLs set explicitly to prevent duplicate content.

### Structured Data (JSON-LD)
| Page | Schema Type | Key Properties |
|---|---|---|
| Home | `WebSite` + `SearchAction` | Site name, search URL template |
| Listing | `RealEstateListing` | Name, location, price range, datePosted |
| Detail | `RealEstateListing` + `BreadcrumbList` | Full property details, navigation path |
| News | `NewsArticle` | Headline, datePublished |

### Technical SEO
- `sitemap.ts` generates dynamic XML sitemap with all listing and news URLs.
- `robots.ts` allows all paths (all pages are public).
- `next/image` with descriptive `alt` text for all images.
- Internal linking structure: breadcrumbs on detail pages, related listings.

---

## 8. Performance Architecture

### Core Web Vitals Targets
| Metric | Target | Strategy |
|---|---|---|
| **LCP** | < 2.5s | Server-render above-fold content; preload hero images; avoid client-side data fetching for initial view |
| **INP** | < 200ms | Minimize main-thread work; use `startTransition` for non-urgent updates; debounce filter inputs |
| **CLS** | < 0.1 | Explicit `width`/`height` on all images; skeleton placeholders match final layout; no layout-shifting font swap |

### Bundle Budget
| Budget | Target |
|---|---|
| Initial JS (First Load) | < 200 KB (gzip) |
| Per-route JS | < 50 KB (gzip) |
| Total CSS | < 30 KB (gzip, Tailwind purged) |

### Image Optimization
- All images served through `next/image` — automatic WebP/AVIF, responsive `srcSet`, lazy loading.
- Listing thumbnails: max 400px width, quality 75.
- Hero images: preloaded with `priority` prop, served as AVIF.
- `placeholder.svg` used as blur placeholder during load.

### Code Splitting
- Route-based splitting is automatic via App Router.
- Heavy client components (map views, charts) loaded with `next/dynamic` + `ssr: false`.
- Third-party scripts (analytics) loaded with `next/script` strategy `afterInteractive` or `lazyOnload`.

---

## 9. Error Handling

### Error Boundary Hierarchy
```
app/error.tsx              → Global fallback (500-level)
app/not-found.tsx          → 404 page
features/*/ErrorFallback   → Feature-level inline errors
```

### Fallback UI Rules
- Error boundaries show a friendly Korean message + retry button.
- Never expose stack traces or API error details to end users.
- 404 pages suggest navigation to Home or Subscriptions.

### Error Reporting
- Client errors captured via `window.onerror` and `onunhandledrejection`.
- Server errors logged with structured JSON (timestamp, route, error code).
- Integration with external error tracking (Sentry) for production monitoring.

---

## 10. Deployment

### Platform: Vercel
- **Rationale:** Zero-config Next.js deployment, edge network, automatic ISR, preview deploys.
- Production branch: `main`.
- Preview deploys: every PR gets a unique URL for review.

### Environment Management
| Environment | Branch | Purpose |
|---|---|---|
| Production | `main` | Live site at cheongyak.com |
| Preview | PR branches | Per-PR deploy for review |
| Development | Local | `next dev` with MSW mocking |

### Environment Variables
- `NEXT_PUBLIC_API_URL` — Backend API base URL (varies per environment).
- All secrets managed via Vercel environment variables dashboard — never in code.

---

## 11. CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# Triggered on: push to main, pull_request
jobs:
  quality:
    steps:
      - Checkout
      - Install (pnpm, cached)
      - Lint (ESLint + Prettier check)
      - Type check (tsc --noEmit)
      - Unit tests (Vitest)
      - Build (next build)
      - Bundle size check (fail if initial JS > 200KB gzip)

  e2e:
    needs: quality
    steps:
      - Playwright tests against preview deploy

  deploy:
    needs: [quality, e2e]
    if: github.ref == 'refs/heads/main'
    steps:
      - Vercel production deploy (automatic via Vercel GitHub integration)
```

### Quality Gates (PR merge requirements)
- All lint, type-check, and test jobs pass.
- Bundle size within budget.
- At least one approval from reviewer.
- Preview deploy accessible and functional.

### Codegen Freshness Check
- CI runs `npm run codegen` and fails if the output differs from committed files.
- Ensures API client types are always in sync with the OpenAPI spec.
