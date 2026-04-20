# Architecture Document

## 1. Tech Stack

| Technology | Version | Rationale |
|---|---|---|
| **Next.js** | 16 (App Router) | SSR/SSG/ISR flexibility, file-based routing, React Server Components — natural fit for SEO-critical content site |
| **React** | 19 | Server Components, concurrent features, improved hydration |
| **TypeScript** | 5.x (strict mode) | Catch errors at compile time; strict mode eliminates implicit `any` |
| **Tailwind CSS** | 4.x | Utility-first matches the design system's token-based approach; purges unused CSS for minimal bundles |
| **TanStack Query** | 5.x | Server-state caching, background refetch, optimistic updates for listing filters |
| **Zustand** | 5.x | Lightweight client state (UI toggles, modal state) + `persist` middleware for localStorage preferences |
| **nuqs** | 2.x | Type-safe URL search params for filter/sort state that survives navigation and sharing |
| **next-intl** | 4.x | Future-proofing for i18n; Korean-first with potential English expansion |
| **Zod** | 3.x | Runtime validation of API responses at the boundary; pairs with TypeScript for end-to-end type safety |
| **orval** | 8.x | OpenAPI → typed TypeScript client + TanStack Query hooks + Zod validators auto-generation |
| **MSW** | 2.x | API mocking for development and testing without backend dependency |
| **Vitest** | 3.x | Fast unit/integration tests with native ESM and TypeScript support. DOM environment: `happy-dom` 20.x |
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
│   ├── listings/
│   │   ├── page.tsx            # Listings (/listings)
│   │   └── [id]/
│   │       └── page.tsx        # Listing Detail (/listings/:id)
│   ├── news/
│   │   ├── page.tsx            # News Feed (/news)
│   │   └── [id]/
│   │       └── page.tsx        # News Article (/news/:id)
│   ├── layout.tsx              # Root layout (fonts, metadata, providers)
│   ├── not-found.tsx
│   ├── error.tsx
│   └── sitemap.ts
├── features/                   # Feature modules (co-located logic)
│   ├── listings/
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
| **Listings** | SSR | Filter/sort params make each request unique; server rendering ensures SEO for filtered views |
| **Listing Detail** | SSG + ISR (300s) | Individual listing content changes infrequently; pre-render known IDs, ISR for long tail |
| **News Feed** | SSR + ISR (120s) | Frequently updated feed; ISR balances freshness with performance |
| **News Article** | SSG + ISR (600s) | Published articles are near-static; ISR handles edits |

**Global Search:** Overlay component (no dedicated route) triggered by navigation icon or `⌘K`. CSR within the overlay.

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

**nuqs integration:** `NuqsAdapter` is mounted in `src/app/layout.tsx` around `QueryProvider`. `/listings` filters (`status`, `type`, `page`) are bound to URL query params via `useQueryState`, so navigation, reload, and link-sharing preserve the filtered view. Changing any filter resets `page` to 1 via a single centralized effect — change handlers do not touch pagination directly.

**FilterBar slot API:** `FilterBar` in `src/features/listings/components/filter-bar/` is a shell with three props (`activeCount`, `onReset`, `children`) plus two compound slots (`FilterBar.DesktopBar`, `FilterBar.Sheet`). Each slot accepts any `FilterField.*` composition — `Inline` (desktop chip row), `Stacked` (sheet vertical group), and `Range` (Phase 6 slider). Adding a new filter means adding a `FilterField` instance inside each slot; the shell itself does not change. This keeps the shell under the 5-prop cap from §6 Component Conventions even as the filter surface grows.

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
1. Backend publishes OpenAPI 3.1 spec (JSON). The URL is kept in `.env.local` as `OPENAPI_URL` — never committed (see `.claude/api-docs.local.md`, gitignored).
2. `pnpm codegen` runs `orval` through `dotenv-cli`, emitting to `src/shared/api/generated/`:
   - `endpoints.ts` — TanStack Query hooks + fetch functions
   - `endpoints.zod.ts` — runtime Zod validators
   - `schemas/` — per-DTO TypeScript types
3. Generated fetch functions route through `apiClientMutator` in `src/shared/lib/api-client.ts`, centralizing base URL, headers, and `ApiClientError` normalization.
4. CI runs `pnpm codegen:check` — fails if the spec changed but the generated files weren't re-committed.

### SSR Data Flow (e.g. `/listings` → `/apt-sales`)
1. Server Component resolves `searchParams`, runs `parseListingsSearchParams` → `toAptSalesRequest` to build a wire request.
2. `getQueryClient()` creates a per-request `QueryClient`. `queryClient.prefetchQuery(aptSalesQueryOptions(request))` seeds the cache.
3. `<HydrationBoundary state={dehydrate(queryClient)}>` ships the seed to the client. A Suspense boundary with a skeleton fallback guards the client subtree.
4. The client component calls `useSuspenseQuery(aptSalesQueryOptions(request))` — same key, same request → no refetch on hydration. nuqs mutations then trigger background refetches.
5. Feature-local wrappers (`src/features/listings/lib/apt-sales-query.ts`) exist because orval's generated param shape is `{ request: AptSalesListRequest }`; the wrapper owns URL serialization (flat `status[]`, `regionCode[]`) so the generated types stay the source of truth without fighting the serializer.

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

## 7. SEO & GEO Strategy

### Metadata API
- All routes use `buildPageMetadata()` in `src/shared/lib/seo.ts` — centralizes canonical, OG, Twitter, and Korean-language meta descriptions.
- Root layout sets `metadataBase` and default OG/Twitter; per-page helpers override per route.
- Canonical URLs set explicitly on every route to prevent duplicate content via query strings.

### Structured Data (JSON-LD)
| Page | Schema Type | Key Properties |
|---|---|---|
| Site-wide | `Organization` | Name, URL, logo, description (injected in root layout) |
| Home | `WebSite` | Site name + inLanguage. SearchAction is deferred until `/listings` binds `?q=` |
| Listings | `RealEstateListing` (per item, future) | Name, location, price range, datePosted |
| Listing detail | `RealEstateListing` + `BreadcrumbList` | Full property details, navigation path |
| Trades | `Dataset` + `Place` (planned when data lands) | Aggregate trade statistics by region |

### Technical SEO
- `sitemap.ts` generates a dynamic XML sitemap for all public URLs (static routes + subscription details + `/trades`).
- `robots.ts` allows all paths (all pages are public).
- Dynamic OG images served from `/og` (edge runtime, `next/og` `ImageResponse`) — 1200×630 with brand tokens.
- `next/image` with descriptive `alt` text for all images.
- Internal linking structure: breadcrumbs on detail pages, related listings, home→detail prefetch on hover.

### GEO (Generative Engine Optimization)
- `public/llms.txt` exposes a canonical site summary to LLM crawlers — glossary, key routes, data sources, citation guidance.
- Content structure targets LLM extractability: short definitions, bulleted facts, explicit source attribution.

### Reference docs
- Keyword strategy: `docs/seo-keyword-map.md`
- i18n/hreflang plan: `docs/seo-i18n-plan.md`

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
