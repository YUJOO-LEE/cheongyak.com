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

- Horizontal swipeable card carousel (mobile) / grid row (desktop)
- Each card: Apartment name, location summary, application date range, status chip
- Status chips use `success` for "접수중" (accepting), `warning` for "마감임박" (closing soon), `info` for "접수예정" (upcoming)
- Cards sorted by application start date ascending
- Empty state: "이번 주 예정된 청약이 없습니다" with link to full listing

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
| `GET /main/weekly-schedule` | Mon–Fri schedule with announcements per day |
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
- **Purpose:** Filterable, searchable list of all apartment subscriptions. The primary browse experience for users exploring available 청약 opportunities.

### Sections

#### 2.1 Sticky Filter Bar

- **Position:** Sticky below header (desktop) or below status bar (mobile)
- **Style:** `white` background with ambient bottom shadow
- **Filters:**

| Filter | Type | Options |
|---|---|---|
| Region (시/도) | Dropdown | All 17 시/도 regions |
| District (구/군) | Dependent dropdown | Populated based on selected 시/도 |
| Subscription type | Chip toggle | 공공 (public), 민간 (private) |
| Status | Chip toggle | 접수중, 접수예정, 마감 |
| Supply type | Chip toggle | 특별공급, 일반공급 |
| Builder | Searchable dropdown | All builders in database |

- Active filter count badge on mobile filter icon
- "Reset All" button when any filter is active

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
| `GET /api/subscriptions` | Paginated subscription list |
| **Query params** | `region`, `district`, `type`, `status`, `supply`, `builder`, `sort`, `page` |
| `GET /api/filters/regions` | Region hierarchy (시/도 → 구/군) |
| `GET /api/filters/builders` | Builder list for autocomplete |

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

- [ ] All 6 filter types work independently and in combination
- [ ] District dropdown updates when region changes
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
- Location with map pin icon
- Builder name and link to builder site (external)
- Key stats row: Total units, size range, estimated price range
- Status chip (large)
- No author or editor information displayed

#### 3.2 Schedule Timeline

- Visual vertical timeline showing all phases:
  1. 모집공고 (Announcement)
  2. 특별공급 접수 (Special supply application)
  3. 일반공급 1순위 (General supply 1st priority)
  4. 일반공급 2순위 (General supply 2nd priority)
  5. 당첨자 발표 (Winner announcement)
  6. 계약 기간 (Contract period)
  7. 입주 예정 (Expected move-in)
- Each phase shows date(s) and current/past/future state
- Current phase highlighted with `primary` accent
- Past phases use `text-low`, future phases use `text-mid`

#### 3.3 Supply Breakdown Table

- **Special Supply (특별공급):**
  - Categories: 기관추천 (institutional), 다자녀 (multi-child), 신혼부부 (newlywed), 생애최초 (first-time), 노부모부양 (elderly parent care)
  - Per category: Unit count, size options, income/asset limits if applicable
- **General Supply (일반공급):**
  - Priority tiers: 1순위, 2순위
  - Scoring criteria summary (가점제 vs 추첨제)
  - Per tier: Unit count by size
- Table style: No borders, use `surface` background for alternating rows

#### 3.4 Eligibility Quick-Check (Optional Enhancement)

- Collapsible section with key eligibility criteria
- Income limits, asset limits, residency requirements
- Not a calculator — informational reference only

#### 3.5 Related News

- Up to 5 news articles related to this subscription or its region
- Compact card format: title, date, category chip
- Link to full article at `/news/[id]`

#### 3.6 Official Links

- 청약홈 (applyhome.co.kr) direct link
- Builder official site
- 모집공고 PDF download (if available)
- Styled as secondary buttons in a horizontal row

### Data Requirements

| Endpoint | Data |
|---|---|
| `GET /api/subscriptions/[id]` | Full subscription detail object |
| `GET /api/subscriptions/[id]/supply` | Supply breakdown by type and tier |
| `GET /api/subscriptions/[id]/schedule` | Timeline phases with dates |
| `GET /api/news?subscription=[id]&limit=5` | Related news articles |

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
| `/listings` | Listings | Yes (SSR) | Public |
| `/listings/[id]` | Listing Detail | Yes (SSG + ISR) | Public |
| `/news` | News Feed | Yes (ISR) | Public |
| `/news/[id]` | News Article Detail | Yes (SSG + ISR) | Public |

**Global Search** is an overlay component (no route) — triggered by `⌘K` or search icon.

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
| 마감 | `closed` | `neutral-100` bg / `neutral-500` text | 마감 |

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
- Structured data (JSON-LD): site-wide `Organization` + `WebSite+SearchAction`; per-listing `RealEstateListing` + `BreadcrumbList` on detail pages
- GEO: `public/llms.txt` provides a citation-friendly summary for AI search engines
