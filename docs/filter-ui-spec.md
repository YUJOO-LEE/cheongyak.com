# Filter UI Spec — `/listings` New Fields (Phase 6 prep)

> Owner: Jobs (UX) · Reviewers: Chanel (tokens), Linus (implementation)
> Target: `src/features/listings/components/filter-bar/*`
> Paired doc: `docs/apt-sales-binding-plan.md`

This document is the **single source of truth** for how the new filter
fields (region, keyword, multi-select status/type) render, behave, and
map to query parameters. Linus implements against this spec in Phase 6
(Task #10). Chanel pre-reviews tokens before implementation starts.

---

## 0. House rules (must pass before merge)

- [ ] Token names only — no raw hex, no Tailwind default palette.
- [ ] No arbitrary Tailwind values (`p-[...]`, `bg-[#...]`, `shadow-[...]`).
- [ ] No token outside `src/styles/globals.css` except `shadow-sheet-top` (lead-approved addition).
- [ ] TypeChip palette stays neutral; selected chip never uses `brand-primary-*`.
- [ ] No nested cards — group separation via `bg-bg-sunken` tone shift only.
- [ ] Every interactive element meets 44×44 minimum touch target (`min-h-11` = 44px).
- [ ] `lg:` breakpoint divides desktop inline vs mobile sheet behavior.

---

## 1. Scope & priorities

| Field | Phase | API param | Query key | UI pattern |
|---|---|---|---|---|
| keyword search | B1 | `keyword` (string, ≤50) | `q` | Text input with clear button |
| region multi-select | B1 | `regionCode` (array enum) | `region` | Dropdown (Popover/Sheet-list) |
| status multi-select | B1 | `status` (array enum) | `status` | Chip row (multi) |
| type multi-select | B1 | `houseDetailType` (array enum) | `type` | Chip row (multi) |
| builder | B2 (blocked, API missing) | — | — | Deferred |
| supply type (특별/일반) | B2 (blocked, API missing) | — | — | Deferred |
| district (구/군) | B2 (blocked, API missing) | — | — | Deferred |

PAGES.md §2.1 currently lists 6 filters; three of them have no matching
API parameter and are marked "roadmap-dependent" in the §14
cross-validation update that ships with Phase 6.

---

## 2. Layout overview

### 2.1 Desktop (`lg:` ≥1024px)

```
┌─ Sticky filter bar (bg-bg-card/80 backdrop-blur-glass rounded-lg shadow-sm) ──┐
│ [🔍 keyword input]  [ 지역 ▾ ]  │ 상태: [chip][chip][chip]  │ 유형: [chip][chip] │ 초기화↺ │
│   ← flex-1, max-w-sm →           ↑ fixed 176px              ↑ chip row          ↑ right │
└───────────────────────────────────────────────────────────────────────────────────┘
```

Order (left → right): keyword → region trigger → divider → status chips → divider → type chips → reset.

### 2.2 Mobile (< `lg`)

```
Page top, above listing:
┌─ Sticky search row (bg-bg-page/80 backdrop-blur-glass) ─────────┐
│ [🔍 keyword input                                   X]           │
└─────────────────────────────────────────────────────────────────┘
┌─ Filter trigger ────────────────────────────────────────────────┐
│ [⚙ 필터 (3)]                                                     │
└─────────────────────────────────────────────────────────────────┘

Bottom sheet on tap:
┌─ Filter sheet (bg-bg-page/55 backdrop-blur-glass rounded-t-xl) ─┐
│ [필터]                                                      [✕]  │
│                                                                 │
│ ┌─ 지역 (bg-bg-sunken rounded-md p-4) ───────────────────────┐   │
│ │ ▾ 지역 전체 / 서울 외 +2                                    │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─ 상태 (bg-bg-sunken rounded-md p-4) ───────────────────────┐   │
│ │ [접수예정] [✓접수중] [발표대기] [발표일] [청약완료]          │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─ 유형 (bg-bg-sunken rounded-md p-4) ───────────────────────┐   │
│ │ [✓공공] [민간]                                               │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                 │
│ [초기화]                     [적용]                              │
└─────────────────────────────────────────────────────────────────┘
```

Keyword stays **outside** the sheet (primary mobile discovery
action — hiding it behind "필터" violates the 3-tap rule).

---

## 3. Field specs

### 3.1 Keyword input

**Purpose:** Partial match on apartment complex name.

| Property | Value |
|---|---|
| Query key | `q` |
| API mapping | `keyword` |
| Max length | 50 (API limit) |
| Min length | 1 (empty clears the filter) |
| Debounce | 300ms |
| Component | `<input type="search">` + `Search` icon left, `X` clear button right |
| Height | `h-11` (44px) |
| Background | `bg-bg-sunken` |
| Radius | `rounded-md` |
| Padding | `px-3` (icons + input) |
| Typography | `text-body-md` |
| Focus indicator | 2px bottom border `brand-primary-500` (DESIGN.md §11.6) |

**Copy**
- placeholder: `단지명 검색`
- clear button `aria-label`: `검색어 지우기`

**States**
| State | Visual |
|---|---|
| default | `bg-bg-sunken`, placeholder visible |
| hover | `bg-bg-sunken` (no change — hover lives on clear button) |
| focus | `outline-none`, bottom `brand-primary-500` 2px indicator |
| filled | clear `X` icon appears on the right |
| disabled | `opacity-50`, `cursor-not-allowed` |

**Accessibility**
- `aria-label="단지명 검색"` on the input
- `role="search"` on the surrounding wrapper
- clear button is a real `<button>` with `aria-label="검색어 지우기"`
- on clear, keep focus inside the input (do not return focus to the body)
- Screen-reader update on results count: `aria-live="polite"` region near the results count ("검색 결과 N건")

**Edge cases**
- Paste > 50 chars → truncate silently to 50, flash toast "최대 50자까지 입력할 수 있어요." once per session
- Composition (IME Korean input) → do not fire query update mid-composition (`onCompositionEnd` then flush)

---

### 3.2 Region multi-select

**Purpose:** 17 시/도 multi-select.

| Property | Value |
|---|---|
| Query key | `region` (comma-separated enum codes) |
| API mapping | `regionCode` |
| Component (desktop) | Popover anchored below trigger button |
| Component (mobile) | Inline list inside the sheet group (no nested sub-sheet) |
| Default label | `지역 전체` |

**Option ordering (fixed, not alphabetical)**

Rationale: Korean users locate regions by "수도권 → 광역시 → 도" mental model, not alphabetically.

1. 수도권: SEOUL (서울), GYEONGGI (경기), INCHEON (인천)
2. 광역시: BUSAN (부산), DAEGU (대구), GWANGJU (광주), DAEJEON (대전), ULSAN (울산), SEJONG (세종)
3. 도: GANGWON (강원), CHUNGBUK (충북), CHUNGNAM (충남), JEONBUK (전북), JEONNAM (전남), GYEONGBUK (경북), GYEONGNAM (경남), JEJU (제주)

Add a visible subheading per group using `text-label-md text-text-tertiary px-3 py-1.5`.

**Summary label pattern**

| Selected count | Trigger label |
|---|---|
| 0 | `지역 전체` |
| 1 | `서울` (or whichever single region) |
| 2 | `서울, 경기` |
| ≥3 | `서울 외 +2` |

**Trigger button (desktop + mobile)**
- `bg-bg-sunken h-11 px-3 rounded-md flex items-center justify-between gap-2`
- Left: label text (`text-body-md`, truncated with ellipsis if overflow)
- Right: `ChevronDown` icon (`icon-sm`)
- Count badge (when ≥1 selected): circular neutral badge `bg-neutral-500 text-text-inverse rounded-full min-w-5 h-5 text-caption px-1.5`
  - NOTE: Count badge uses neutral (not brand-primary) to align with TypeChip neutral-lock rule.

**Popover (desktop)**
- Anchor: below trigger, 4px gap
- Width: matches trigger (`w-full`) or `min-w-64`
- `bg-bg-elevated rounded-md shadow-md z-dropdown overflow-hidden`
- Max height: `max-h-80 overflow-y-auto`
- No divider lines between groups — use `py-2` spacing + section subheadings

**Sheet (mobile)**
- Region group is **expandable inline** via `<details>` / `<summary>`
  inside the `bg-bg-sunken rounded-md p-4` block. Do **not** open a
  nested sheet (nested card rule).
- Max height before internal scroll: `max-h-[60vh]`

**Option row**
- `flex items-center gap-2 min-h-11 px-3 py-2.5 rounded-md cursor-pointer`
- hover: `bg-bg-hover` (desktop only)
- selected: prepend `Check` icon (`icon-xs`, `text-brand-primary-500`)
- text: `text-body-md text-text-primary`
- focus-visible: 2px `brand-primary-500` outline

**States**
| State | Trigger | Popover row |
|---|---|---|
| default | trigger closed, label "지역 전체" | — |
| open | `ChevronUp` icon, popover visible | — |
| filled | trigger shows summary label + count badge | — |
| row default | — | no Check icon |
| row hover | — | `bg-bg-hover` |
| row selected | — | `Check` icon prefix + bold `text-text-primary` |
| row focus-visible | — | 2px brand-primary-500 outline |

**Accessibility**
- Trigger: `<button aria-haspopup="listbox" aria-expanded="{open}" aria-label="지역 선택, N개 선택됨">`
- Popover: `role="listbox" aria-multiselectable="true" aria-label="지역"`
- Each option: `role="option" aria-selected="{checked}"`
- Keyboard: Arrow Up/Down navigates, Space/Enter toggles, Escape closes trigger refocuses
- Screen reader announces: "서울 선택됨, 1 of 17" via `aria-selected`
- When popover closes, focus returns to trigger button
- Count badge: `aria-label="선택된 지역 3개"` (element is otherwise decorative)

**Edge cases**
- Empty result list (0 apartments match selected regions) → render empty state in the listing body, not inside the popover
- Clearing within popover: "지역 전체" pseudo-row at top that clears selection when tapped

---

### 3.3 Status multi-select chip row

**Purpose:** Filter by subscription phase (multiple allowed).

| Property | Value |
|---|---|
| Query key | `status` (comma-separated enum values) |
| API mapping | `status` |
| Component | Chip group, multi-select |

**Options** (decision in §5 RESULT_TODAY section confirms rename → `result_today`)

| value | label |
|---|---|
| `upcoming` | 접수예정 |
| `accepting` | 접수중 |
| `pending` | 발표대기 |
| `result_today` | 발표일 |
| `closed` | 청약완료 |

**Chip styling (neutral-locked per TypeChip rule)**

| State | Classes |
|---|---|
| default | `bg-chip-bg text-text-secondary px-3.5 py-1.5 rounded-full text-label-md min-h-11 flex items-center gap-1.5` |
| hover | `bg-chip-bg-hover` |
| selected | `bg-neutral-500 text-text-inverse shadow-sm` + prepended `<Check icon-xs />` |
| focus-visible | 2px `brand-primary-500` outline with 2px offset |
| disabled | `opacity-50 cursor-not-allowed` |

**Rules**
- Selecting the same chip again toggles it off (multi toggle, not single-select).
- Reset ("초기화") clears status + type + region + keyword together.
- **Never** apply `bg-brand-primary-*` to selected chips — the neutral lock is a documented design-memory rule.

**Accessibility**
- Each chip: `<button aria-pressed="{selected}" aria-label="{label}, {selected ? '선택됨' : '선택 안 됨'}">`
- Chip row wrapper: `role="group" aria-label="청약 상태 필터"`
- Keyboard: Tab between chips, Space/Enter toggles
- Screen reader announces the new aria-pressed state after toggle

---

### 3.4 Type multi-select chip row

Mirrors §3.3 styling and behavior exactly.

| value | label | API enum |
|---|---|---|
| `public` | 공공 | `NATIONAL` |
| `private` | 민간 | `PRIVATE` |

The mapper (feature-local or orval mutator) translates `public ↔ NATIONAL`
and `private ↔ PRIVATE` so the URL query key `type=public` stays
human-readable.

**Accessibility**
- Chip row wrapper: `role="group" aria-label="공급 유형 필터"`
- Same chip-level aria-pressed behavior as §3.3

---

## 4. Shared behavior

### 4.1 URL binding (nuqs)

Use `useQueryStates` with a single parser bundle:

```ts
const [filters, setFilters] = useQueryStates({
  q: parseAsString.withDefault(''),
  region: parseAsArrayOf(parseAsStringEnum(REGION_CODES)).withDefault([]),
  status: parseAsArrayOf(parseAsStringEnum(STATUS_VALUES)).withDefault([]),
  type: parseAsArrayOf(parseAsStringEnum(TYPE_VALUES)).withDefault([]),
  page: parseAsInteger.withDefault(1),
});
```

Any filter change resets `page` to `1` to avoid pagination drift.

SSR first paint reads the query from the request URL; client-side
updates push to the URL via `setFilters` (not `router.push`).

### 4.2 Reset

- "초기화" button is visible only when `activeCount > 0`.
- Clicking reset: `setFilters({ q: null, region: null, status: null, type: null, page: null })`.
- Desktop: inline right-aligned; mobile: inside the sheet footer, left of "적용".

### 4.3 Apply button (mobile)

- Filters update URL immediately on change (not on apply). "적용" simply
  dismisses the sheet. This matches PAGES.md §2.1 "select filter →
  results update immediately."

### 4.4 Active count

Single number shown on the mobile filter trigger badge:

```
count = (q ? 1 : 0) + region.length + status.length + type.length
```

Use `neutral-500` background on the badge (not brand-primary).

---

## 5. Status enum drift — decision

**Issue:** API exposes `RESULT_TODAY` ("발표일 당일"); client enum has `contracting` ("계약중").

**Decision:** Option (a) rename — `contracting` → `result_today`, UI
label "발표일".

**Rationale (persona-based)**
1. 30–50대 first-time 청약 applicants track **당첨자 발표일** as the
   decision pivot of the entire journey. "오늘 발표인 단지"는 single
   highest-intent filter state after `accepting`.
2. Collapsing `RESULT_TODAY` into `pending` loses the ability to filter
   same-day announcements — a regression against API capability.
3. Current `contracting` label ("계약중") only makes sense for winners
   in a post-announcement phase, not for browsers. It's a pre-existing
   mislabel; renaming is a correction, not a breaking change.

**Chip color**
- `result_today` → `warning` token (time-sensitive "today" signal).
- No conflict with `마감임박` (warning) since `result_today` applies in
  a different phase of the life cycle.
- PAGES.md §Shared Data Patterns `Status Mapping` table gets a new row:

| Korean | English Key | Color Token | Chip Label |
|---|---|---|---|
| 발표일 | `result_today` | `warning-50` bg / `warning-700` text | 발표일 |

Phase-6 migration touchpoints:
- `src/shared/types/api.ts` — `SubscriptionStatusSchema`
- `src/shared/lib/constants.ts` — `STATUS_LABELS`
- `src/shared/components/chip/status-chip.tsx` — config entry
- mapper (feature-local `map-main-api.ts` or orval mutator) for `RESULT_TODAY ↔ result_today`
- `PAGES.md` §2.1 table + §Status Mapping table (+ `PAGES.ko.md`)

Empty state copy when the selected filter yields 0 results:

> 오늘 발표 예정인 단지가 없어요.

---

## 6. Accessibility summary

| Concern | Handling |
|---|---|
| Dropdown focus return | On Popover close, move focus back to the trigger button |
| Screen reader updates | `aria-live="polite"` region announcing `"검색 결과 N건"` after filter change |
| Keyboard shortcuts | `⌘K` / `Ctrl+K` focuses the keyword input on desktop (optional, nice-to-have) |
| Escape | Closes Popover or sheet, returns focus to trigger |
| Touch targets | All interactive rows meet 44×44 via `min-h-11` |
| Color-only status | Every status chip pairs label with `Check` icon when selected; status-chip colors always pair with a Korean label |
| Focus ring | 2px `brand-primary-500` with 2px offset, visible on `:focus-visible` only |
| Reduced motion | Sheet slide and popover fade respect `prefers-reduced-motion` (fall back to instant open/close) |

---

## 7. Deferred work (B2 — blocked on backend)

For PAGES.md §14 cross-validation: three filters from the original
PAGES.md §2.1 table have no matching `/apt-sales` query parameter. Keep
the entries in PAGES.md under a **"Roadmap (backend-dependent)"**
callout so the UI contract stays truthful.

| PAGES.md filter | Reason blocked |
|---|---|
| District (구/군) | API only accepts `regionCode` at 시/도 granularity |
| Supply type (특별/일반) | No query param; response exposes supply breakdown only in detail endpoint |
| Builder | No query param; response includes `constructorName` but no filter |

When backend ships these, append the spec under this section — do not
retrofit into the B1 fields.

---

## 8. Review checklist (for Chanel pre-review)

- [ ] All tokens referenced in this doc exist in `src/styles/globals.css`
- [ ] `shadow-sheet-top` noted as lead-approved addition, not yet merged
- [ ] No TypeChip color violation (neutral lock)
- [ ] No arbitrary Tailwind values
- [ ] No nested card pattern
- [ ] No raw hex codes anywhere
- [ ] Breakpoint annotations on every §3 sub-section header
- [ ] aria-label samples concrete enough for Linus to copy

---

## 9. Open questions for the team

1. **⌘K shortcut**: does the existing global search overlay already own this? If yes, drop from §6. — Jobs to confirm with Nolan.
2. **Active count badge color**: spec says neutral-500 for consistency with chip neutral lock, but Chanel's audit mentioned `brand-primary-500` for the region count badge. Reconcile: **neutral-500 everywhere** to avoid split identity unless Chanel confirms the region-specific override.
3. **Keyword debounce on SSR**: first paint from URL param should not fire a second debounced request. Jobs to document the expected SSR-hydration path with Tesla.

Resolve before Phase 6 PR opens.
