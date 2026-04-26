# Pages & Routes

Comprehensive page-by-page specification for cheongyak.com. Each page defines its purpose, data requirements, layout, interactions, and acceptance criteria.

---

## Global Elements

### Bottom Navigation Bar (Mobile)

- **Position:** Fixed bottom, glassmorphism surface (`color-bg-page` @ 80% + `backdrop-blur: 20px`)
- **Items:** Home (`/`), Listings (`/listings`), News (`/news`), Search (overlay)
- **Active state:** `brand-primary-500` icon + label; inactive uses `neutral-400`
- **Height:** 64px + device bottom inset (safe area)

### Top Header (Desktop, ≥1024px)

- **Position:** Fixed top, glassmorphism surface
- **Layout:** Logo (left) | Nav links (center) | Search icon (right)
- **Nav links:** Home, Listings, News
- **Logo:** Use `logo.svg` from project root

### Global Search (Overlay)

> **Status:** Deferred for beta. UI hidden, code preserved. Restoration tracked in `docs/beta-launch-deferred-features.md#search`.

- **Trigger:** Navigation search icon click or `⌘K` (`Ctrl+K`) keyboard shortcut
- **Scope:** Searches across listings (name, location, builder) and news (title, body)
- **UI:** Full-screen modal overlay with backdrop, centered panel (max 640px)
- **Results:** Grouped by type (Listings, News) with max 5 preview results per group
- **Recent searches:** Persisted in localStorage, max 10 items
- **Keyboard:** `Escape` to close, auto-focus on input when opened

### Footer

- **Style:** Minimal, `surface` background
- **Links:** About, Terms of Service, Privacy Policy
- **Content:** Copyright notice, logo mark

---

## Page 1: Home Dashboard

- **Route:** `/`
- **Purpose:** Weekly subscription schedule and market insights at a glance. The entry point that answers "what's happening in 청약 this week?"

### Sections

#### 1.1 Hero / Featured Subscription

- Full-width card highlighting the most notable upcoming subscription
- Content: Apartment name, location, key dates, unit count, builder name
- Background: Subtle gradient overlay on `white` card
- CTA: "View Details" button linking to `/listings/[id]`

#### 1.2 This Week's Schedule Timeline

- Horizontal swipeable card carousel (mobile) / 5-column grid (desktop)
- Day column labels come from the server response (`days[].date`, `days[].dayOfWeek`); the client only derives the "오늘" marker by comparing the server date with the user's current date
- Each card: Apartment name, location summary, application date range, **phase chips**
- Phase chips use the announcement's `status` for color/icon (`accepting` 초록 / `upcoming` 인포 / `pending` 워닝 …) but the **label is the phase string** from `phases[]` (`'특별공급' | '일반공급 1순위' | '일반공급 2순위' | '당첨자 발표'`). When `phases.length > 1`, render one chip per phase.
- Listed announcements are exactly what the server returns per day — no client-side status filter (server already restricts the day's items to the active set)
- Mobile day selector shows `N건` per day; days with `0건` keep the same card background as other days but the count text is greyed out
- Empty state: "예정된 청약이 없어요" with link to full listing when the entire week is empty

#### 1.3 Market Insight Cards

- 2-column grid (mobile) / 3-column grid (desktop)
- Each card: Metric label, value, trend indicator (up/down arrow with percentage)
- Metrics: Average competition rate, total units this month, trending regions
- Background: `white` cards on `surface` page background

#### 1.4 National Top Trades (실거래가 TOP 5)

- Ranked row list of the top 5 recent apartment trades by deal amount (last 2 days)
- Each row: Rank (1–5, 1–3 brand accent / 4–5 muted), apartment name, region (시군구 + 동), supply area with pyeong (`85㎡ (34평)`), floor, deal date, deal amount (우측 강조)
- Header subline: "최근 2일 거래 · 거래금액 상위 · 출처: 국토교통부"
- Hidden entirely when the array is empty or the upstream request fails
- No link target yet (follow-up ticket once a detail/search page exists for real-estate trades)
- Size unit clarification: 청약 리스팅은 공급면적(`minSupplyArea`/`maxSupplyArea`)을 노출, 실거래는 전용면적(`exclusiveArea`) — 서로 다른 축이므로 라벨 혼동 주의

#### 1.5 Latest News Preview

- 3 most recent news articles as compact cards
- Each card: Category chip, title (2-line clamp), date
- "View All" link to `/news`

### Data Requirements

| Endpoint | Data |
|---|---|
| `GET /main/featured` | Single featured subscription object (공급면적 기준) |
| `GET /main/weekly-schedule` | Mon–Fri schedule with announcements per day. Each announcement carries `phases: WeeklyPhase[]` (`'특별공급' | '일반공급 1순위' | '일반공급 2순위' | '당첨자 발표'`) — at least one entry per the spec. |
| `GET /main/stats` | Monthly competition/supply stats + popular region |
| `GET /main/top-trades` | Top 5 recent apartment trades by deal amount (전용면적 기준) |
| `GET /api/news/latest?limit=3` | Latest 3 news articles |

### Mobile Layout

- Vertical stack: Hero → Schedule carousel → Top Trades list → News preview
- Schedule section uses horizontal scroll with snap points
- Pull-to-refresh triggers data reload

### Key Interactions

- Tap subscription card → navigate to `/listings/[id]`
- Tap news card → navigate to `/news/[id]`
- Swipe schedule carousel horizontally
- Pull down to refresh all dashboard data

### Acceptance Criteria

- [ ] Hero section renders featured subscription with all required fields
- [ ] Weekly schedule displays correct subscriptions for the current week
- [ ] Status chips use correct color tokens per subscription state
- [ ] Market insight cards show trend direction with percentage
- [ ] Top trades list renders ranks 1–5 with deal amount, region, area (with pyeong), floor, and date; section hides when empty
- [ ] Page loads in under 2 seconds on 4G mobile connection (LCP < 2s)

---

## Page 2: Subscription Listing

- **Route:** `/listings`
- **Purpose:** Filterable list of all apartment subscriptions. The primary browse experience for users exploring available 청약 opportunities.

### Sections

#### 2.1 Sticky Filter Bar

- **Position:** Sticky below header (desktop) or below status bar (mobile)
- **Style:** `white` background with ambient bottom shadow
- **Filters (bound to `/apt-sales` as of Phase 6):**

| Filter | Type | Options | Query key |
|---|---|---|---|
| Region (시/도) | Multi-select dropdown, grouped chip pool (수도권/광역시/도) | 17 시/도 | `region` |
| Status | Multi-select chip | 접수예정, 접수중, 발표대기, 발표일, 청약완료 | `status` |
| Subscription type | Multi-select chip | 공공 (public), 민간 (private) | `type` |

- Region dropdown renders grouped slim chips inside the popover/sheet
- Multi-select chips prepend a `Check` icon when active (color-only rule)
- Status/type chips use the slim `h-8` surface + `chip-hit-slop` utility for a 44×44 target without visual bulk
- Active filter count badge on mobile filter icon
- Mobile sheet footer uses "닫기" because filters apply immediately
- "초기화" button clears every filter (status + type + region)

**Roadmap (backend-dependent, not implemented):**

| Filter | Blocker |
|---|---|
| District (구/군) | `regionCode` only granular to 시/도 |
| Supply type (특별/일반) | No query param; supply breakdown ships on detail endpoint only |
| Builder | No query param; `constructorName` exposed on items but not filterable |

#### 2.2 Sort Controls

- **Options:** Date (newest first, default), Date (oldest first), Popularity (view count)
- **Style:** Inline dropdown, right-aligned above results

#### 2.3 Subscription Cards

- **Layout:** Full-width stacked cards (mobile) / 2-column grid (desktop)
- **Card content:**
  - Apartment name (headline)
  - Location (시/도 + 구/군 + 동)
  - Schedule: Application period (start–end dates)
  - Status chip (접수중 / 접수예정 / 마감)
  - Builder name
  - Unit count and size range (e.g., "84㎡ ~ 114㎡")
- **Card style:** `white` background, `8px` radius, no borders (per design system)
- **Interactive state:** Background shifts to `surface` on hover/press

#### 2.4 Pagination

- Page-based navigation (not infinite scroll) for SEO
- Shows: Previous / page numbers / Next
- URL reflects current page: `/listings?page=2`
- 20 items per page

### Data Requirements

| Endpoint | Data |
|---|---|
| `GET /apt-sales` | Paginated subscription list. The route file is a bare Server Component shell; `SubscriptionListClient` owns the fetch via `useQuery(aptSalesQueryOptions(request))` with `keepPreviousData` and a 60s `staleTime` for same-session repeat navigations. |
| **Query params (bound)** | `status[]`, `houseDetailType[]`, `regionCode[]`, `page`, `size` |
| **Query params (roadmap)** | `district` (구/군), `supply` (공급유형), `builder` — no backend support yet; UI omitted until API lands |

Region options come from the `ItemRegionCode` enum generated by orval —
no separate `/filters/*` endpoint. Any `/api/filters/regions` or
`/api/filters/builders` reference in older docs is obsolete.

### Mobile Layout

- Filter bar collapses to a single row with filter icon + active count badge
- Tapping filter icon opens full-screen filter sheet (bottom drawer)
- Cards are full-width, separated by 16px vertical spacing
- Sticky filter bar remains visible while scrolling

### Key Interactions

- Select filter → results update immediately (no submit button)
- Tap card → navigate to `/listings/[id]`
- Change page → scroll to top, URL updates
- Filter state persisted in URL query parameters for shareability

### Acceptance Criteria

- [ ] All 3 filter types work independently and in combination
- [ ] URL reflects all active filters and current page
- [ ] Cards display all required fields with correct status chip colors
- [ ] Empty state shown when no subscriptions match filters

---

## Page 3: Subscription Detail

- **Route:** `/listings/[id]`
- **Purpose:** Complete information about a single subscription. The decision-making page where users determine eligibility and next steps.

### Sections

#### 3.1 Unit Overview Header

- Apartment name (display heading)
- Location (sido/gugun/dong); when `supplyAddress` is present it renders
  as a tertiary subline under the location pair
- Builder (`constructorName`); when `businessEntityName` differs from
  builder it renders as a `사업주체 …` subline
- Key stats row: Total units, size range, estimated price range,
  접수기간, and 입주예정 (when `moveInMonth` is present, formatted
  as `YYYY년 M월`)
- Status chip (large)
- No author or editor information displayed

#### 3.2 Schedule Timeline

- Visual vertical timeline with up to 7 phases. The mapper in
  `map-apt-sales-detail.ts` folds the backend's `ScheduleSection` +
  `moveInMonth` into this order, dropping any phase whose date is null
  so the rail stays dense:
  1. 모집공고 (`schedule.announcementDate`)
  2. 특별공급 접수 (`schedule.specialSupply`)
  3. 일반공급 1순위 (`schedule.firstRankLocal` — `firstRankGyeonggi`/`Other` ignored for the primary bar)
  4. 일반공급 2순위 (`schedule.secondRankLocal`)
  5. 당첨자 발표 (`schedule.winnerAnnouncementDate`)
  6. 계약 기간 (`schedule.contract`)
  7. 입주 예정 (`announcement.moveInMonth` expanded to `yyyy-MM-01`)
- Each phase shows date(s) and current/past/future state (today-based)
- Current phase highlighted with `primary` accent
- Past phases use `text-low`, future phases use `text-mid`
- The vertical connector between dots draws from `top-3` to `-bottom-0.5`
  on each non-last item so the line reaches the next dot exactly (no
  hanging gap below the dot, no overflow past the last dot)
- Section is wrapped in a `bg-bg-card rounded-lg p-6` card surface so
  the timeline reads as a single primary block; the per-평형 / 경쟁률 /
  당첨가점 / 특공 sections stay flat on the page canvas (their own
  internal containers — cards or `rounded-lg` table — already provide
  sufficient surface)

#### 3.3 Supply Breakdown — Per-평형 Cards

- Grid of cards, one per `models[]` entry (평형 단위)
- Each card header shows the 주택형 normalized via `formatHouseType`
  (`059.9400A → 59A`) — internal `modelNo` is no longer surfaced as a
  user-facing label
- Each card shows 공급면적(㎡), 일반공급 세대수, 특별공급 세대수, 특공 세분
  유형별 세대수(다자녀/신혼부부/생애최초/노부모부양/기관추천/기타/이전기관/청년/신생아 중 값이 있는 것만), 최고 분양가(억/만 포맷)
- Layout: `bg-bg-card` (white) card directly on the page's `bg-bg-page`
  canvas — surface tier shift only, no ambient shadow (DESIGN.md §8
  reserves ambient shadows for floating elements). 2-column grid on
  sm+, single column on mobile
- Inner 특공 세분 chips use `bg-bg-sunken` (defined inset on a card
  surface)
- Aggregated size + price range (min ~ max across models) surfaces in
  `SubscriptionHeader` so users see overall scope without scrolling

#### 3.4 Eligibility Quick-Check *(deferred)*

- Collapsible eligibility reference — backend endpoint not defined yet.
  Revisit once the API exposes income/asset/residency rules per listing.

#### 3.5 Related News

- Sits at the end of the main column (after §3.9 특별공급 신청현황) at
  every breakpoint — sidebar is reserved for action-oriented blocks
  (Official Links / ShareActions); news is supplementary reading and
  belongs in the content flow.
- Each row exposes only the trust-critical fields: `outlet` (언론사),
  `title`, optional `publishedAt` (rendered via `formatRelativeDate` —
  "2일 전"), and `url`. No thumbnail, summary, or category chip — the
  section stays low-noise so it doesn't compete with primary content.
- Row anatomy: meta line `outlet · relativeDate` (`text-caption`,
  `text-text-tertiary`) above the title (`text-body-md`,
  `text-text-primary`, `line-clamp-2`). The right side carries an
  `ExternalLink` icon (16px, `text-text-tertiary` → `brand-primary-500`
  on hover) that is **hidden by default** (`opacity-0`) and reveals on
  `group-hover` / `group-focus-visible` only — keeps the static row
  noise-free, surfaces the external-navigation signal exactly when the
  user is interacting. On touch devices (`pointer: coarse`) where
  `:hover` never fires, a smaller 12px `ExternalLink` is rendered
  inline next to the outlet name in the meta line — one tone smaller
  than the meta-line text, so the external-nav cue is visible at rest
  without the heavy presence of a 16px right-side icon. The two
  placements are mutually exclusive (`pointer-coarse:hidden` vs
  `hidden pointer-coarse:inline-block`) so each input modality reads
  the appropriate position. No persistent left-side icon (categorical
  `Newspaper` indicator was tried and dropped — it competed with the
  outlet text without adding meaning). Hover shifts the row's
  background to `bg-bg-sunken` (no translate / no border — the row
  sits inside `bg-bg-card rounded-lg p-3 md:p-4`, so card-in-card
  nesting and 1px sectioning lines are both avoided per DESIGN.md §11.5).
  Container padding is symmetric (top/bottom = left/right) so the
  hover-area inset reads even on each side. Active (press) state: row
  background steps to `bg-bg-active` (`neutral-200` — the global
  active token was retuned one tone lighter so card-in-card list-row
  presses don't read as visual noise; buttons that need a heavier
  press use the new `bg-button-secondary-active` token) plus a
  `scale-[0.99]` micro press. Translation lift is intentionally
  avoided since the row sits inside another card.
- External links open in a new tab with `target="_blank" rel="noopener
  noreferrer"`, single `aria-label` packs `${outlet} – ${title} (새 창에서 열림)`
  for screen readers. Section uses `<section aria-labelledby>` so it
  surfaces as a landmark heading.
- Empty/error: when the items array is empty (no data, 4xx, planned
  endpoint not yet wired) the section renders nothing — no placeholder
  card or "no news" copy. 5xx propagates to the route ErrorBoundary.
- The list returns whatever the backend serves; pagination / "load
  more" deliberately deferred until the volume justifies it.
- Sibling skeleton (`related-news.skeleton.tsx`) renders 3 rows inside
  the same `bg-bg-card rounded-lg p-4 md:p-6` container so the
  Suspense fallback approximates the final layout (CLS guard).

#### 3.6 Official Links

- 모집공고 link ← `announcement.announcementUrl` (the API field is the
  announcement document URL — earlier code mis-mapped it to 청약홈)
- Builder official site ← `announcement.homepageUrl`
- 청약홈 신청 link ← *(deferred)* the API has no dedicated 청약홈 deep
  link field; `applyHomeUrl` stays `undefined` until a deeplink rule
  ships
- 문의 전화 ← `announcement.inquiryPhone` rendered as a `tel:` link card
  (label includes the displayed number)
- Order is fixed: **모집공고** sits in slot 1 (top of the sidebar) at
  all times. Slot 2 = 청약홈 신청 (when available), slot 3 = 시행사,
  slot 4 = 문의. Visual primary follows availability: while
  `applyHomeUrl` is undefined the slot-1 모집공고 link is the primary
  (brand-primary) button. When a 청약홈 deeplink rule ships,
  applyHomeUrl renders in slot 2 and takes over the primary color;
  모집공고 stays in slot 1 as secondary. The §11.2 "one primary per
  view" rule is preserved — only one button is brand-primary at a
  time.

#### 3.7 경쟁률 (Competitions)

- Table of `competitions[]` rows: 주택형 × 순위 × 거주지역
- Columns: 주택형, 순위, 거주지역, 공급세대, 접수건수, 경쟁률
- 주택형 displayed via `formatHouseType` (e.g. `059.9400A → 59A`) and
  same-주택형 consecutive rows merge into one `rowSpan` cell so the
  table reads as 평형별 그룹
- Row striping uses **group-level zebra**: every row inside the same
  주택형 group shares one fill (`bg-bg-card` or `bg-bg-page`), and the
  fill alternates between groups. This makes the 평형 boundary
  legible without adding any divider lines (zebra is the only visual
  cue, per DESIGN.md §11.5 No-Line). The table rounds with
  `rounded-lg overflow-hidden` and the header keeps `bg-bg-sunken`.
- `rateDisplay` surfaces server-formatted values (`"15.00"`, `"(N세대 부족)"`, `"미달"`); `isShortage` true rows highlight with `warning-600`
- Section hidden entirely when `competitions[]` is empty (집계 전)

#### 3.8 당첨가점 (Winner Scores)

- Table of `winnerScores[]` rows: 주택형 × 거주지역
- Columns: 주택형, 거주지역, 최저/평균/최고 (uses server-provided `*Display` strings, `-` fallback)
- Same shape as §3.7: `formatHouseType` + 평형별 `rowSpan` grouping +
  zebra row striping + `rounded-lg` outer wrap
- Section hidden when `winnerScores[]` is empty

#### 3.9 특별공급 신청현황 (Special Supply Status)

- Table of `specialSupplies[].categories[]` flattened per (주택형 × 유형)
- Columns: 주택형, 유형, 배정, 해당지역, 기타경기, 기타지역, 합계
- Same shape as §3.7 (formatHouseType + rowSpan + zebra) plus: the
  주택형 column is `position: sticky left-0 z-10` and inherits the row
  zebra fill so horizontal scroll on mobile keeps row identity visible
- 기관추천/이전기관 row 들은 지역 컬럼이 `-` (API 보장)
- Section hidden when `specialSupplyStatus[]` is empty

### Data Requirements

| Endpoint | Data |
|---|---|
| `GET /apt-sales/{id}` | Full 5-section detail: `announcement` (공고 본체 + `schedule` + `regulations`), `models[]` (평형 기본정보), `competitions[]`, `winnerScores[]`, `specialSupplies[]`. Server-side fetch via `fetchAptSalesDetailSSR(numericId)` with `next.revalidate=300`. 404 flows through `ApiClientError` → `notFound()`. |
| `GET /apt-sales/{id}/related-news` | `RelatedNewsItem[]` envelope (`{ outlet, title, url, publishedAt? }`). The detail page does **not** await this fetch — `<RelatedNewsSection>` is wrapped in `<Suspense>` so the apartment data paints first and news streams in afterwards (skeleton holds the slot). ISR 300s aligned with the parent page. **Endpoint path is provisional** — backend confirmation pending; MSW serves a fixture for dev preview today. 4xx → empty list (section hides). |

### Mobile Layout

- Sections stacked vertically with accordion collapse for supply tables
- Timeline rendered as a vertical stepper (left-aligned)
- Official links as full-width buttons stacked vertically
- Sticky bottom bar with primary CTA: "청약홈에서 신청하기" (Apply on 청약홈)

### Key Interactions

- Expand/collapse supply breakdown sections
- Tap timeline phase for detailed date info
- Tap related news → navigate to `/news/[id]`
- Tap official link → open in new tab
- Share button → copy URL or native share sheet

### Acceptance Criteria

- [ ] All 7 timeline phases render with correct date and state styling
- [ ] Supply breakdown shows both special and general supply data
- [ ] No author or editor information is visible anywhere on the page
- [ ] Official links open in new tabs
- [ ] Page is server-side rendered for SEO (subscription name in meta title)

---

## Page 4: News Feed

- **Route:** `/news`
- **Purpose:** Policy changes, market trends, and analysis articles. Keeps users informed about the broader 청약 landscape.

### Sections

#### 4.1 Category Tabs

- **Position:** Sticky below header
- **Categories:**
  - 전체 (All) — default
  - 정책 (Policy)
  - 시장동향 (Market Trends)
  - 분석 (Analysis)
  - 공지 (Announcements)
- **Style:** Horizontal scroll on mobile, underline indicator using `primary`
- Active indicator using `brand-primary-500`
- Active category reflected in URL: `/news?category=policy`

#### 4.2 News Cards

- **Layout:** Single-column feed (mobile and desktop, max-width 720px centered)
- **Card content:**
  - Thumbnail image (16:9 aspect ratio, `placeholder.svg` as fallback)
  - Category chip
  - Title (headline, 2-line clamp)
  - Excerpt (body text, 3-line clamp)
  - Published date (relative format: "2일 전", "1주 전")
- **Card style:** `white` background, `8px` radius, 32px vertical spacing between cards
- No author name or byline displayed

#### 4.3 Pagination

- Same pattern as subscription listing
- 15 items per page
- URL: `/news?category=policy&page=2`

### Data Requirements

| Endpoint | Data |
|---|---|
| `GET /api/news` | Paginated news article list |
| **Query params** | `category`, `page` |
| `GET /api/news/categories` | Available categories with article counts |

### Mobile Layout

- Category tabs as horizontal scrollable chips at top
- Single-column card feed, full-width
- Thumbnail spans full card width
- Pull-to-refresh for latest articles

### Key Interactions

- Tap category tab → filter articles, URL updates
- Tap card → navigate to `/news/[id]`
- Pull to refresh (mobile)

### Acceptance Criteria

- [ ] Category filtering works and reflects in URL
- [ ] News cards show thumbnail, category, title, excerpt, and date
- [ ] No author information is displayed on cards
- [ ] Pagination works correctly with category filter preserved
- [ ] Placeholder image shown when thumbnail is unavailable

---

## Page 5: News Article Detail

- **Route:** `/news/[id]`
- **Purpose:** Full article reading experience.

### Sections

#### 5.1 Article Header

- Category chip
- Title (display heading)
- Published date
- No author name or byline

#### 5.2 Article Body

- Rich text content (HTML rendered from CMS)
- Supported elements: headings, paragraphs, images, blockquotes, lists, tables
- Images: Full-width with optional caption
- Max content width: 720px, centered

#### 5.3 Related Subscriptions

- If article references specific subscriptions, show linked subscription cards
- Compact format: name, location, status chip
- Link to `/listings/[id]`

#### 5.4 More Articles

- 3 articles from the same category
- Compact card format matching news feed cards

### Data Requirements

| Endpoint | Data |
|---|---|
| `GET /api/news/[id]` | Full article object with body HTML |
| `GET /api/news/[id]/related-subscriptions` | Linked subscription summaries |
| `GET /api/news?category=[cat]&exclude=[id]&limit=3` | More articles in same category |

### Mobile Layout

- Full-width reading experience
- Sticky top bar with back arrow and share button
- Related content sections stacked below article body

### Key Interactions

- Back button → return to news feed (preserve scroll position)
- Share button → native share sheet or copy URL
- Tap related subscription → navigate to `/listings/[id]`
- Tap more article → navigate to `/news/[id]`

### Acceptance Criteria

- [ ] Article body renders all rich text elements correctly
- [ ] No author information displayed anywhere
- [ ] Related subscriptions link correctly to detail pages
- [ ] Page is server-side rendered for SEO (article title in meta title and og:title)
- [ ] Reading experience is comfortable on mobile (appropriate font size, line height, margins)

---

## Route Summary

| Route | Page | SSR | Auth |
|---|---|---|---|
| `/` | Home Dashboard | Yes (ISR) | Public |
| `/listings` | Listings | Yes (SSR + ISR 60s) | Public |
| `/listings/[id]` | Listing Detail | Yes (SSG + ISR) | Public |
| `/news` | News Feed | Yes (ISR) | Public |
| `/news/[id]` | News Article Detail | Yes (SSG + ISR) | Public |
| `/about` | About | Yes (SSG, static) | Public |
| `/terms` | Terms of Service | Yes (SSG, static) | Public |

**Global Search** is an overlay component (no route) — triggered by `⌘K` or search icon. _UI deferred for beta — see `docs/beta-launch-deferred-features.md#search`._

- **ISR:** Incremental Static Regeneration (revalidation intervals vary per route — see ARCHITECTURE.md)
- **SSR:** Server-Side Rendering (real-time data)
- **Auth:** All pages are public. Admin routes for content management are out of scope for this document.

---

## Shared Data Patterns

### Status Mapping

| Korean | English Key | Color Token | Chip Label |
|---|---|---|---|
| 접수중 | `accepting` | `success-50` bg / `success-700` text | 접수중 |
| 접수예정 | `upcoming` | `info-50` bg / `info-700` text | 접수예정 |
| 마감임박 | `closing_soon` | `warning-50` bg / `warning-700` text | 마감임박 |
| 발표대기 | `pending` | `warning-100` bg / `warning-700` text | 발표대기 |
| 발표일 | `result_today` | `warning-50` bg / `warning-700` text | 발표일 |
| 청약완료 | `closed` | `neutral-100` bg / `neutral-500` text | 청약완료 |

### Date Formatting

- Absolute dates: `YYYY.MM.DD` format (e.g., `2026.04.15`)
- Relative dates (news): `N일 전`, `N주 전`, `N개월 전`
- Date ranges: `2026.04.15 ~ 2026.04.17`

### Image Handling

- All images use `placeholder.svg` as fallback
- Lazy loading for below-fold images
- WebP format preferred with JPEG fallback

### SEO Requirements

- Every page has a unique `<title>` and `<meta description>` via `buildPageMetadata()`
- Subscription detail: `{아파트명} 청약 일정 및 정보 | 청약닷컴`
- Coming-soon `/trades`: `실거래가 | 청약닷컴` (remains indexable to capture brand queries)
- Open Graph and Twitter Card meta tags on all pages; default OG image rendered by `/og` edge route and overridable per page via `?title=`/`?subtitle=`
- Structured data (JSON-LD): site-wide `Organization` + `WebSite`; `/listings` ships an `ItemList` of `RealEstateListing` (`ListingsItemListJsonLd`); detail pages add `RealEstateListing` + `BreadcrumbList`. (SearchAction is held back until listings binds `?q=`.)
- GEO: `public/llms.txt` provides a citation-friendly summary for AI search engines
