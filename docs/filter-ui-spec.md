# Filter UI Spec — `/listings` Fields

> Owner: Jobs (UX) · Reviewers: Chanel (tokens), Linus (implementation)
> Target: `src/features/listings/components/filter-bar/*`
> Paired doc: `docs/apt-sales-binding-plan.md`
> Revision: 2026-04-20 (post-user-feedback rework — keyword removed, region redesigned, chip slim)

This document is the **single source of truth** for how `/listings`
filter fields render, behave, and map to query parameters. It supersedes
the earlier "Phase 6 prep" revision after a round of user feedback (see
§10 Change log).

**Scope change — Keyword search is out of scope for /listings.** The
site already ships a global search overlay (`src/app/search-root.tsx`,
⌘K / nav search icon) that covers apartment name search across the
whole product. Adding a second keyword input inside the listings filter
duplicates that primitive, fragments user mental model, and multiplies
hydration edge cases. /listings keeps filter controls only; search
discovery stays in the global overlay.

---

## 0. House rules (must pass before merge)

- [ ] Token names only — no raw hex, no Tailwind default palette.
- [ ] No arbitrary Tailwind values (`p-[...]`, `bg-[#...]`, `shadow-[...]`).
- [ ] No token outside `src/styles/globals.css` (all tokens — including `shadow-sheet-top` — live there after commit a39e972).
- [ ] TypeChip palette stays neutral; selected chip never uses `brand-primary-*`.
- [ ] No nested cards — group separation via `bg-bg-sunken` tone shift only.
- [ ] Every interactive element meets 44×44 minimum touch target (`min-h-11` = 44px).
- [ ] `lg:` breakpoint divides desktop inline vs mobile sheet behavior.

---

## 1. Scope & priorities

| Field | Phase | API param | Query key | UI pattern |
|---|---|---|---|---|
| region multi-select | B1 | `regionCode` (array enum) | `region` | Region picker (see §3.1 — redesigned) |
| status multi-select | B1 | `status` (array enum) | `status` | Chip row (multi, slim) |
| type multi-select | B1 | `houseDetailType` (array enum) | `type` | Chip row (multi, slim) |
| ~~keyword search~~ | **out of scope** | — | — | Covered by global search overlay (⌘K). Do **not** add a text input inside `/listings`. |
| builder | Blocked (API missing) | — | — | Deferred |
| supply type (특별/일반) | Blocked (API missing) | — | — | Deferred |
| district (구/군) | Blocked (API missing) | — | — | Deferred |

PAGES.md §2.1 must mark the three API-missing filters as
"roadmap-dependent" and remove any keyword/search field references —
search belongs to the global overlay.

---

## 2. Layout overview

### 2.1 Desktop (`lg:` ≥1024px)

```
┌─ Sticky filter bar (bg-bg-card/80 backdrop-blur-glass rounded-lg shadow-sm) ──┐
│ [ 지역 ▾ ]  │ 상태: [chip][chip][chip]  │ 유형: [chip][chip]                 │ 초기화↺ │
│   ↑ region trigger     ↑ slim chip row        ↑ slim chip row                 ↑ right │
└───────────────────────────────────────────────────────────────────────────────────┘
```

Order (left → right): region trigger → divider → status chips → divider → type chips → reset.

### 2.2 Mobile (< `lg`)

```
Page top, above listing:
┌─ Filter trigger ────────────────────────────────────────────────┐
│ [⚙ 필터 (2)]                                                     │
└─────────────────────────────────────────────────────────────────┘

Bottom sheet on tap:
┌─ Filter sheet (bg-bg-page/80 backdrop-blur-glass rounded-t-xl) ─┐
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
│ [초기화]                     [닫기]                              │
└─────────────────────────────────────────────────────────────────┘
```

Search discovery is **not** part of this sheet — users who want to type
an apartment name tap the global search icon (or press ⌘K) in the
navigation bar, which routes them through `SearchOverlay`.

---

## 3. Field specs

> §3.1 (Keyword input) was **removed** in the 2026-04-20 revision.
> Search belongs to the global overlay (`src/app/search-root.tsx`).
> The section numbers below are renumbered accordingly; `FilterField.Text`
> component stays in the codebase (generic text field primitive) but is
> **not** mounted on `/listings`.

---

### 3.1 Region multi-select — **redesigned**

**Purpose:** 17 시/도 multi-select.

> User feedback (2026-04-20): "지역 필터 진짜 너무 못생겼어." The current
> implementation renders 17 시/도 as a plain vertical list of identical
> rows inside a 256px-wide Popover. Two things make it feel unfinished:
>
> 1. **No visual rhythm.** Every row has identical height, padding, and
>    weight; `bg-bg-sunken` has the same tone as the trigger, so the
>    user cannot see group boundaries at a glance.
> 2. **Single-column density.** 17 rows tall is a scrollbar-heavy layout
>    for content that should fit in one glance — Korean users already
>    carry a geographic mental map, and the list rendering fights it.
>
> Below are three alternative patterns ranked by feasibility. Nolan
> approves one, Linus implements only the approved one.

#### Shared behavior (all three options)

- Query key `region`, API `regionCode`, default label "지역 전체".
- Option ordering: 수도권 → 광역시 → 도 (no alphabetical sort).
- "지역 전체" pseudo-row (value=[]) lives at the top of every variant
  as the clear affordance; tapping it empties the selection.
- Summary label: 0 → `지역 전체`; 1 → `서울`; 2 → `서울, 경기`;
  ≥3 → `서울 외 +2`.
- Count badge: `bg-neutral-500 text-text-inverse rounded-full min-w-5
  h-5 px-1.5 text-caption` (decided 2026-04-20 — brand-primary stays
  reserved for CTA/link).
- Focus ring, touch target, and `aria-multiselectable="true"` rules
  from §6 apply to every option element regardless of layout.

#### Option A — Grouped chip pool *(recommended)*

Replace the single-column list with a **flowing chip cloud**, grouped
by 수도권 / 광역시 / 도 subheadings. Every 시/도 is its own chip (same
slim chip pattern as §3.2 status filter), and because chips wrap, the
Popover is wider and shorter instead of tall and thin.

```
┌─────────────────────────────────────────────────────────────────┐
│ 지역 전체                                                        │
│                                                                 │
│ 수도권                                                            │
│ [✓서울] [경기]  [인천]                                            │
│                                                                 │
│ 광역시                                                            │
│ [부산] [대구] [광주] [대전] [울산] [세종]                          │
│                                                                 │
│ 도                                                                │
│ [강원] [충북] [충남] [전북] [전남] [경북] [경남] [제주]              │
└─────────────────────────────────────────────────────────────────┘
```

**Why it works**
- Groups become **visually obvious** because chips line-break per
  group instead of all stacking the same way.
- Chip shape matches the rest of the filter bar (status/type chips) —
  one visual vocabulary across the page.
- Density high without feeling dense: ~60% less vertical space than
  the current list, no scrollbar required at the desktop default
  width.
- Multi-select affordance uses the exact same `Check` prefix pattern
  as §3.2 — zero new mental model for the user.

**Layout tokens**
- Popover: `bg-bg-elevated rounded-md shadow-md z-dropdown p-3
  overflow-hidden max-w-lg` (`max-w-lg = 32rem` — Tailwind built-in,
  no new token needed per Chanel's audit).
- Group block: `space-y-3` between groups.
- Subheading: `text-label-md text-text-tertiary mb-1.5`.
- Chip row inside each group: `flex flex-wrap gap-3` (**MUST ≥
  `gap-3`** — same rule as §3.2 to avoid hit-slop overlap).
- Pseudo-row "지역 전체": full-width button directly above the first
  group, `text-label-md text-text-secondary px-2 py-1.5 rounded-md
  hover:bg-bg-hover`, followed by `mt-3` spacing (no divider line).
- Chips reuse the §3.2 canonical markup **verbatim** — `relative h-8
  px-3 rounded-full ... chip-hit-slop`, selected state `bg-neutral-500
  text-text-inverse` with prepended `<Check size={14} />` icon. Neutral
  lock applies here identically to the status/type filter chips.

**Trigger (desktop + mobile)** — unchanged from current implementation;
it's already the cleanest part. `bg-bg-sunken h-9 px-3 rounded-md`
(height lowered from `h-11` to match chip slim; hit-slop gives 44×44).
Summary label + count badge + `ChevronDown` rotate-180 on open.

**Mobile behavior**
- Sheet variant still uses the same chip-pool layout inside the
  `bg-bg-sunken rounded-md p-4` group block — *not* a nested sheet.
- Use `max-h-[60vh] overflow-y-auto` when the content would exceed
  screen height (rare because chips wrap).

#### Option B — Two-pane tab (region → district)

Left pane: 3 tabs (수도권 / 광역시 / 도). Right pane: the chips for that
tab. Only one group visible at a time.

**Why it's tempting**
- Very clean visual per-tab.
- Natural future expansion when district (구/군) filter lands — the
  right pane could swap to "서울 → 선택된 구/군".

**Why it's deferred**
- User can't see selections outside the current tab without switching,
  which hides state from them. Breaks "one glance" principle.
- Twice the taps to pick "서울 + 부산" (tab 1 → pick → tab 2 → pick).
- Introduces new layout surface (tab + pane split) that nothing else
  on the page uses.
- Ship only after district (구/군) backend lands; until then there is
  no "right-pane content to paginate".

#### Option C — Map select

Clickable SVG of the Korean peninsula. Pretty, spatially accurate,
screenshot-ready for marketing.

**Why it's rejected (for now)**
- Accessibility cost: SVG picker needs custom keyboard nav, focus
  management, and speakable labels for every region polygon. KWCAG
  compliance is nontrivial.
- Implementation cost: new asset, new interaction model, new test
  surface, responsive sizing, pinch/pan consideration.
- Most users pick region by typing or by familiarity — not by
  geographic pointing. Low ROI for the complexity.
- Revisit in Phase 9+ as a secondary picker ("지도에서 고르기" button
  inside the Popover) once the list/chip experience is solid.

#### Decision

**Recommend Option A (grouped chip pool).** It reuses the existing
slim-chip vocabulary (§3.2), resolves both visual complaints (no
rhythm, single-column density), and needs zero new primitives.
Option B waits on district backend; Option C waits on a later polish
phase.

Lead decision goes into §10 Change log once Nolan picks.

**Accessibility**
- Popover: `role="dialog" aria-label="지역 선택"` (dialog, not listbox —
  chips are buttons, not listbox options).
- Each chip: `<button aria-pressed="{selected}" aria-label="{sido},
  {selected ? '선택됨' : '선택 안 됨'}">`.
- Pseudo-row "지역 전체": `aria-label="지역 필터 초기화"`.
- Focus on open lands on the "지역 전체" pseudo-row; Escape closes
  and returns focus to the trigger.
- Screen reader announces count change via an `aria-live="polite"`
  node tied to the trigger's summary label.

**Edge cases**
- Empty listing result → render empty state in the list body, not
  inside the Popover.
- Sheet variant wraps the entire chip pool in a single
  `bg-bg-sunken rounded-md p-4` block; no nested cards.

---

### 3.2 Status multi-select chip row — **slim**

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

#### Slim chip pattern (user feedback: "필터 버튼이 너무 뚱뚱해")

The current `min-h-11` padding inflates every chip to a 44px-tall
rectangle, which dominates the filter bar. WCAG 2.5.5 still demands a
44×44 touch target, so we slim the visible surface and recover the
target via a **hit-slop pseudo-element**.

Chanel owns this pattern and publishes it as `DESIGN.md §11.3.1 Chip —
hit-slop pattern`. This spec references the canonical token + utility;
**both land in the same PR as the field refactor** (no temporary
arbitrary `inset-[-6px]` allowed).

**Canonical token** (`src/styles/globals.css :root`):

```css
--chip-hit-slop: 6px;    /* 44 target = visual 32 (h-8) + 2 × 6 */
```

**Canonical utility** (`src/styles/globals.css`):

```css
.chip-hit-slop::before {
  content: '';
  position: absolute;
  inset: calc(var(--chip-hit-slop) * -1);
}
```

**Canonical markup** (status/type chips — identical across desktop
inline and mobile sheet):

```tsx
<button
  type="button"
  aria-pressed={selected}
  aria-label={`${label}, ${selected ? '선택됨' : '선택 안 됨'}`}
  className="
    relative                 /* MUST — ::before anchors to this */
    h-8 px-3
    rounded-full
    text-label-md
    bg-chip-bg text-text-secondary hover:bg-chip-bg-hover
    inline-flex items-center gap-1
    chip-hit-slop             /* invisible 44×44 target via ::before */
  "
>
  {label}
</button>
```

**Chip styling (neutral-locked per TypeChip rule)**

| State | Classes (additive) |
|---|---|
| default | `relative h-8 px-3 rounded-full text-label-md bg-chip-bg text-text-secondary inline-flex items-center gap-1 chip-hit-slop` |
| hover | `bg-chip-bg-hover` |
| selected | `bg-neutral-500 text-text-inverse shadow-sm` + prepended `<Check size={14} />` |
| focus-visible | 2px `brand-primary-500` outline with 2px offset on the **button element itself** (not the `::before`); use the global `:focus-visible` rule |
| disabled | `opacity-50 cursor-not-allowed` |

**Rules** (hard requirements — Chanel's §11.3.1)

1. **`relative` MUST** be on the button — `::before` anchors to it.
2. **Visual height `h-8` (32px)**; hit area ≥44×44 via `chip-hit-slop` utility.
3. **Inter-chip gap MUST ≥ `gap-3` (12px)** on the chip-row wrapper. Smaller gaps (`gap-2` / `gap-1.5`) produce hit-slop overlap and mis-taps. Enforce at the row level, never override per-chip.
4. **iOS Safari** — `-webkit-tap-highlight-color: transparent` should be set globally; Chanel to confirm `src/styles/globals.css` already declares it (otherwise add under `button` reset in the same PR).
5. **`aria-pressed` stays on the real button** — the `::before` pseudo is invisible to DOM/AT; zero accessibility impact.
6. **Unify both field components** — `filter-field-inline.tsx` and `filter-field-stacked.tsx` emit the exact same class string. Stacked currently diverges at `min-h-11 px-4`; collapse to the canonical markup above. No sheet-specific padding overrides.
7. **Selecting the same chip toggles it off** (multi mode, not single-select).
8. **Reset ("초기화")** clears status + type + region together.
9. **Never** apply `bg-brand-primary-*` to selected chips — the TypeChip neutral-lock is a documented design-memory rule.

**When NOT to use `chip-hit-slop`**

Standalone CTAs, primary action buttons, and controls without siblings
should use full-size touch targets (e.g. `h-11 px-4`) instead. Hit-slop
is a density optimization for chip rows where a slim visual is required
*and* multiple targets sit side by side. A lone button doesn't need it.

**Accessibility**
- Each chip: `<button aria-pressed="{selected}" aria-label="{label}, {selected ? '선택됨' : '선택 안 됨'}">`
- Chip row wrapper: `role="group" aria-label="청약 상태 필터"` with `flex flex-wrap gap-3` (per rule 3).
- Keyboard: Tab between chips, Space/Enter toggles.
- Screen reader announces the new `aria-pressed` state after toggle.
- `::before` pseudo has no `content` visible to AT.

**Chip component promotion (deferred)**

Chanel proposed promoting a shared `<Chip>` primitive once this pattern
is reused in ≥3 places. This revision keeps the pattern inlined in the
two field components and tracks extraction as a **Phase 8 / separate
refactor Task** — don't bundle it into the current sizing fix.

---

### 3.3 Type multi-select chip row

Mirrors §3.2 slim-chip styling and behavior exactly (same hit-slop
pattern, same neutral-lock rule, same focus ring).

| value | label | API enum |
|---|---|---|
| `public` | 공공 | `NATIONAL` |
| `private` | 민간 | `PRIVATE` |

The mapper (feature-local or orval mutator) translates `public ↔ NATIONAL`
and `private ↔ PRIVATE` so the URL query key `type=public` stays
human-readable.

**Accessibility**
- Chip row wrapper: `role="group" aria-label="공급 유형 필터"`
- Same chip-level aria-pressed behavior as §3.2

---

## 4. Shared behavior

### 4.1 URL binding (nuqs)

Use `useQueryStates` with a single parser bundle:

```ts
const [filters, setFilters] = useQueryStates({
  region: parseAsArrayOf(parseAsStringEnum(REGION_CODES)).withDefault([]),
  status: parseAsArrayOf(parseAsStringEnum(STATUS_VALUES)).withDefault([]),
  type: parseAsArrayOf(parseAsStringEnum(TYPE_VALUES)).withDefault([]),
  page: parseAsInteger.withDefault(1),
});
```

No `q` parser — `/listings` does not own keyword search. If the global
`SearchOverlay` wants to deep-link a selected region (`?region=SEOUL`),
it does so through the `region` parser above; it does **not** push a
keyword into `/listings`.

Any filter change resets `page` to `1` to avoid pagination drift.

SSR first paint reads the query from the request URL; client-side
updates push to the URL via `setFilters` (not `router.push`).

**Scroll behavior on filter change**: `setFilters` uses `{ shallow: true, scroll: false }` so filter-driven URL updates do not scroll the page. Pagination changes DO scroll to top (matches existing `subscription-list-client.tsx` behavior).

**SSR hydration — no debounce on first paint**: Initial render must mount with the URL's `q` value already applied — the 300ms debounce timer runs only for user-initiated changes, not on the hydration pass. Concretely: initialize the input's `useState` from `filters.q` directly and start the debounce timer inside an `onChange` handler, not inside a `useEffect` that fires on mount. Confirm the generated hook's `initialData` path with Tesla during Phase 6 implementation.

### 4.2 Reset

- "초기화" button is visible only when `activeCount > 0`.
- Clicking reset: `setFilters({ region: null, status: null, type: null, page: null })`.
- Desktop: inline right-aligned; mobile: inside the sheet footer, left of "닫기".

### 4.3 Close button (mobile)

- Filters update URL immediately on change — the mobile sheet's primary
  right-aligned button is therefore labeled **"닫기"** (not "적용").
  "적용" implies staged apply, which we don't do; keeping the label
  "적용" misleads users into thinking changes are pending.
- Button action: dismiss the sheet. State is already reflected in the URL.
- Left slot remains "초기화" visible only when `activeCount > 0`.

### 4.4 Active count

Single number shown on the mobile filter trigger badge:

```
count = region.length + status.length + type.length
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
| Keyboard shortcuts | `⌘K` / `Ctrl+K` remains reserved for the global search overlay (`src/app/search-root.tsx`). `/listings` has no keyword input, so no filter-scoped shortcut is bound. |
| Escape | Closes Popover or sheet, returns focus to trigger |
| Touch targets | 44×44 minimum. Region trigger and region option rows use `h-11` directly; status/type chips use the §3.2 slim pattern (visible `h-8` + `::before` hit-slop of `-6px`). |
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
- [ ] `shadow-sheet-top` token merged (a39e972) and referenced directly
- [ ] No TypeChip color violation (neutral lock)
- [ ] No arbitrary Tailwind values
- [ ] No nested card pattern
- [ ] No raw hex codes anywhere
- [ ] Breakpoint annotations on every §3 sub-section header
- [ ] aria-label samples concrete enough for Linus to copy

---

## 9. Resolved decisions

Audit trail of locked-in UX calls.

1. **⌘K shortcut** — reserved for the global search overlay.
   `/listings` no longer carries any keyword input (see §10 change log
   2026-04-20), so the earlier "filter keyword shortcut" question is
   moot.
2. **Count badge color** — `neutral-500` everywhere (mobile filter
   trigger + region trigger). Brand-primary stays reserved for
   interactive primary (CTA, link); count is numeric info, not a state.
3. **Status enum `RESULT_TODAY ↔ contracting`** — rename `contracting`
   → `result_today`, UI label "발표일", `warning` token (see §5).
4. **Mobile sheet footer label** — "닫기" (not "적용"). Filters apply
   immediately on change; "적용" was a staged-apply lie.
5. **Keyword input on /listings** — removed. Global `SearchOverlay`
   owns apartment-name search site-wide; duplicating it inside
   `/listings` fragments the user model and multiplies hydration edge
   cases.
6. **Region picker layout** — Option A (grouped chip pool, §3.1)
   recommended. Options B (tabbed) and C (map) deferred; see §3.1 for
   per-option reasoning.
7. **Chip slim + hit-slop** — chips shrink visibly to `h-8 px-3` and
   keep 44×44 tap area via `.chip-hit-slop` utility backed by a new
   `--chip-hit-slop: 6px` token. Token + utility + `DESIGN.md §11.3.1`
   subsection land **in the same PR as the chip refactor** (Chanel's
   call; no temporary arbitrary value). Inter-chip `gap-3` is a hard
   requirement — smaller gaps cause hit-slop overlap.

---

## 10. Change log

### 2026-04-20 — post-user-feedback rework

User feedback triggered three revisions to the previously-shipped
`#10 (B3)` implementation:

1. **Keyword input removed** — the global `SearchOverlay` already owns
   apartment-name search. `/listings` keyword input duplicated that
   primitive. Spec §1 scope table, §2 ASCII diagrams, the former §3.1
   "Keyword input" field, and §4.1 nuqs parsers were updated to drop
   the `q` key. The `FilterField.Text` component stays in the codebase
   as a generic primitive but is not mounted on `/listings`.
2. **Region picker redesigned** — the existing Popover/list felt
   dense and rhythm-less. §3.1 now offers three alternative patterns
   (A grouped chip pool, B tabbed, C map) with recommendation.
   **Lead decision: Option A (grouped chip pool)** adopted — reuses
   the slim-chip vocabulary from §3.2, resolves the density complaint
   with zero new primitives, and keeps Options B / C as future
   upgrades gated on backend (district) or polish bandwidth.
3. **Chip slimmed** — `min-h-11` inflated status/type chips into
   44px-tall rectangles that dominated the bar. §3.2/§3.3 switch to a
   visible `h-8` chip with a `.chip-hit-slop` pseudo-element backed
   by the new `--chip-hit-slop: 6px` token; 44×44 WCAG compliance is
   preserved while the visual bulk disappears. Region pool (§3.1)
   reuses the same chip markup verbatim. Chanel's audit tightened two
   values: inter-chip `gap-3` is a hard minimum (not `gap-1.5`); the
   Popover width uses the built-in `max-w-lg` (= 32rem) rather than
   an arbitrary `max-w-[32rem]`.

Earlier decisions (RESULT_TODAY rename, neutral-500 badges, sheet
"닫기" label, nested-card avoidance) remain locked.
