# Plan · `/apt-sales` API Binding + Filter Expansion + orval Adoption

> **Team**: `apt-sales-binding` — Nolan(lead), Tesla(API), Jobs(UX), Chanel(style), Linus(components).  
> **Status**: Phase 0 complete. Ready to break into Phase 1+ tasks.  
> **Out of scope**: `/main/*` endpoints (SSR fetch kept as-is), news/trades routes, auth/member system.

---

## 0. Background

The `/listings` page currently renders a static fixture imported from
`src/mocks/fixtures/subscriptions` and ships only two client-side filters
(status, type) with single-select toggles and no URL binding. The backend
has published a new `GET /apt-sales` endpoint (spec URL kept out of the
repo per project policy — see `.claude/api-docs.local.md` for the
internal reference) with richer query surface (multi-select + keyword +
region), and `package.json` declares but does not use `orval` and
`nuqs` — two infrastructure gaps we are closing in this initiative.

---

## 1. Phase 0 findings (consolidated)

### 1.1 API surface (`GET /apt-sales`, verified)

| param | type | enum | notes |
|---|---|---|---|
| `status` | `string[]` | `SUBSCRIPTION_SCHEDULED`, `SUBSCRIPTION_ACTIVE`, `RESULT_PENDING`, `RESULT_TODAY`, `SUBSCRIPTION_COMPLETED` | multi-select, OR |
| `houseDetailType` | `string[]` | `PRIVATE`, `NATIONAL` | multi-select |
| `regionCode` | `string[]` | 17 시도 (`SEOUL` … `JEJU`) | multi-select |
| `keyword` | `string` | — | ≤50 chars, 단지명 부분 일치 |
| `page` | `integer` | — | **0-indexed**, default 0 |
| `size` | `integer` | — | 1–100, default 20 |

Response envelope: `{ data: { totalCount, page, size, items: Item[] } }`.
Item fields listed in `.claude/api-docs.local.md` and Tesla's Phase 0
report. **4xx/5xx schema absent from OpenAPI — client keeps existing
`ApiError` normalization.**

### 1.2 Filter gap (Jobs)

- **Current UI**: `status`, `type` only — both single-select, no URL binding, no keyword input.
- **P0 additions**: `regionCode` (multi-select dropdown, 17 시도), `keyword` (debounced text input), multi-select conversion of `status` / `houseDetailType`.
- **P1/P2**: 구/군 (district), 공급유형 (special/general), 건설사 — **API does not support**. PAGES.md §2.1 promises them → **PAGES.md requires edit** to mark them as "backend roadmap".

### 1.3 Component architecture (Linus)

- Current `FilterBar` already has 6 props → violates CLAUDE.md §6 cap of 5. Adding more filters drill would push `FilterBarSheet` to 19 props.
- Strategy **(C) nuqs + slot compound**, split into **B1 / B2 / B3**.

### 1.4 Design tokens (Chanel)

- All neutral chip colors available; TypeChip stays neutral (memory rule).
- 3 Sheet fixes required: `bg-bg-page/80` (restore), Close button 44×44, Sheet shadow → new token `--shadow-sheet-top`.
- Nested-card avoidance: use `bg-bg-sunken` tone shift instead of internal cards for sheet section grouping.

### 1.5 Client/API enum mismatch

Client (`src/shared/types/api.ts`) uses `upcoming`, `accepting`, `pending`, `contracting`, `closed`. API uses the five `SUBSCRIPTION_*`/`RESULT_*` codes above. **Not 1:1.** A translation layer is required (see §5 Enum Policy).

---

## 2. Decisions locked by team-lead (Nolan)

1. **orval adoption**: full — `/apt-sales` is the first binding, `/main/*` migrates later.
2. **State management for filters**: nuqs URL state (already in `package.json`).
3. **Component strategy**: Linus's (C) with Phase B1/B2/B3.
4. **Sheet visual fixes**: separate small PR after B2 to preserve Tidy First (structural vs behavioral split).
5. **`/filters/*` MSW**: **deprecate** — options come from generated enum.
6. **PAGES.md**: split into "bound now" (4 filters) and "backend roadmap" (3 filters, dependent).
7. **Enum mapping**: lives in `src/features/listings/lib/map-apt-sales.ts`. Client domain enum stays stable.
8. **OpenAPI URL**: stays in `.claude/api-docs.local.md` (gitignored) + `.env.local` `OPENAPI_URL` env var. **Never committed.**
9. **Cross-validation**: every PR below updates its matching doc rows in the same commit (CLAUDE.md §14).

---

## 3. Phase breakdown (PR plan)

Each phase = one PR unless noted. PRs are ordered by dependency, but
P3 (nuqs migration) and P4 (slot refactor) do not depend on orval and
can start in parallel to P1.

### Phase 1 — orval infra (Tesla)
**Branch**: `feat/orval-setup` · **Type**: structural · **Size**: ~200 LOC added, 0 removed.

- Add devDeps: `orval`, `dotenv-cli`.
- Add `orval.config.ts` at repo root (input = `process.env.OPENAPI_URL`, output = `src/shared/api/generated/`, mutator = `src/shared/lib/api-client.ts`, Zod on, tags-split).
- Extend `api-client.ts` with mutator-shape adapter `apiClient({ url, method, params, data })` while keeping the existing `.get` / `.post` API (no call-site churn).
- Scripts: `"codegen": "dotenv -e .env.local -- orval"`, `"codegen:check": "npm run codegen && git diff --exit-code src/shared/api/generated"`.
- CI: add `codegen:check` to existing GitHub Actions lint job (requires `OPENAPI_URL` secret — Nolan coordinates with infra).
- First generation produces `/apt-sales` + any other endpoints the spec exposes. Review diff carefully before committing.
- **Docs**: `CLAUDE.md` §2 (orval now real), `ARCHITECTURE.md` §1 & §6, `.env.example` placeholder.

### Phase 2 — MSW handler + enum mapper (Tesla)
**Branch**: `feat/apt-sales-mocks` · **Type**: structural+behavioral (new module, no UI change yet).

- Add `src/mocks/fixtures/apt-sales.ts` (~30 rows derived from existing `subscriptions` fixture).
- Add MSW handler `GET /apt-sales` honouring `status`/`houseDetailType`/`regionCode` arrays, `keyword` substring, `page`/`size`.
- Remove obsolete `/filters/regions` and `/filters/builders` handlers after confirming no caller references (Jobs + Linus sign-off).
- Add `src/features/listings/lib/map-apt-sales.ts` with two pure functions: `mapItemToSubscription(item)` and `mapApiStatusToDomain(apiStatus)` (see §5).
- **Docs**: none beyond code comments (no exposed surface change).

### Phase 3 — nuqs migration "B1" (Linus)
**Branch**: `feat/filters-nuqs` · **Type**: structural.

- Wrap `src/app/layout.tsx` `QueryProvider` in `NuqsAdapter`.
- Replace `useState` trio in `subscription-list-client.tsx` (L16–18) with three `useQueryState` hooks (`status`, `type`, `page`). Keep props shape of `FilterBar` unchanged in this PR.
- Centralize page reset: a single `useEffect` on filter values resets `page=1` (remove duplicated `setCurrentPage(1)` from change handlers).
- Testing: add `NuqsTestingAdapter` wrapper utility in `src/test/render.tsx`; update `subscription-list-client.test.tsx` & `filter-bar.test.tsx` render calls.
- Clean up stale test comments on L170–215 of `subscription-list-client.test.tsx` (suite title rename, drop "will FAIL / buggy" wording — code is already correct; see Phase 0 verification).
- **Docs**: `ARCHITECTURE.md` §3 state table (nuqs now realized for `/listings`).

### Phase 4 — FilterBar slot compound "B2" (Linus + Chanel)
**Branch**: `feat/filters-slot-api` · **Type**: structural.

- Convert `FilterBar` to a shell: `{ activeCount, onReset, children }` — 3 props.
- Introduce `FilterField.Inline`, `FilterField.Stacked`, `FilterField.Range` in `src/features/listings/components/filter-bar/fields/`.
- Move existing `status`/`type` chips into `<FilterField.Inline>` (used by both desktop + sheet).
- Chanel: audit tokens on the new field components, ensure no 1px border is introduced for section dividers — use `flex-wrap gap-x-4 gap-y-3`.
- **Docs**: no external contract change; add 1 short block to `ARCHITECTURE.md` §4 on the slot API.

### Phase 5 — Sheet visual fixes (Chanel)
**Branch**: `fix/sheet-visual-consistency` · **Type**: behavioral (visual).

- Restore `bg-bg-page/80` on sheet (from arbitrary `/55`).
- Close button padding `p-3` → 44×44 touch target.
- Add `--shadow-sheet-top` token in `DESIGN.md` + `src/styles/globals.css`; replace arbitrary shadow in `filter-bar-sheet.tsx:38`.
- **Docs**: `DESIGN.md` (token table).

### Phase 6 — New fields "B3" (Linus + Jobs)
**Branch**: `feat/filters-region-keyword` · **Type**: behavioral.

- `<FilterField.Dropdown regionCode />` — multi-select, 17 시도, label pattern "서울 외 +2". Popover on desktop, in-sheet list on mobile.
- `<FilterField.Text keyword />` — debounce 300ms, max 50 chars, clear button, 44×44 touch target.
- Convert `status`/`type` chips to multi-select (Check icon prefix on selected).
- nuqs: widen parsers to `parseAsArrayOf(parseAsStringEnum(...))`.
- **Docs**: `PAGES.md` §2.1 filter table — mark 지역/상태/유형/키워드 as "bound" and 구/군/공급유형/건설사 as "backend roadmap"; mirror in `PAGES.ko.md`.

### Phase 7 — `/listings` API binding (Tesla + Linus)
**Branch**: `feat/listings-api-wiring` · **Type**: behavioral.

- `src/app/listings/page.tsx`: stop importing `subscriptions` fixture. Use orval's generated server-side fetch (prefetch in the Server Component) + `useGetAptSalesList` on the client.
- `subscription-list-client.tsx`: accept data from query hook, not props. Surface loading / empty / error states (existing `EmptyState`, new skeleton TBD in Phase 4 if needed).
- Map API items → `Subscription` domain type via `mapItemToSubscription`.
- Pagination: convert 1-indexed UI → 0-indexed API in hook params; `totalPages = Math.ceil(totalCount / size)`.
- **Docs**: `PAGES.md` §2 data requirements + `ARCHITECTURE.md` §6 API table.

### Phase 8 — Audit & sync (lead-driven)
- `npm run audit:seo`, `npm test`, `npm run type-check`, Playwright smoke on `/listings`.
- Helen (a11y) invited for final pass — focus order, keyboard traps on new Popover/Sheet, announcements on filter change.
- Verify `CLAUDE.md` §14 rows all fire green.

> **2026-04-23 follow-up:** the server-side `prefetchQuery` + `HydrationBoundary` from Phase 7 was removed in a later PR. Awaiting the backend round-trip in the Server Component made every home → `/listings` soft-navigation hold `loading.tsx` for the full API wait, while `apiClientMutator` had no `next.revalidate` to short-circuit it. The route file is now a bare Server Component shell; `SubscriptionListClient` (already built on `useQuery` + `keepPreviousData` + `staleTime: 60_000`) owns the first fetch too. Canonical description lives in `ARCHITECTURE.md` §6 "Client Data Flow" and `PAGES.md` §2 `GET /apt-sales` row.

---

## 4. Parallelization map (revised 2026-04-19 — 3-PR reshuffle)

```
P1 (orval) ─────────────────┐
  → P2 (mocks + mapper) ────┤
P3 (nuqs B1) ───────────────┤
P5 (sheet a11y fixes) ──────┤→ P4 (slot B2) → P6 (new fields B3) ─┐
                                                                  │
                                              P7 (API binding) ←──┤
                                                            → P8 (audit)
```

**Reshuffle rationale** (proposed by Linus + Chanel, lead approved):
- P5 Sheet fixes (Close button 44×44, opacity, shadow token) resolves a current a11y violation and should not wait behind structural refactors.
- Running P5 before P4 keeps `filter-bar-sheet.tsx` merge-conflict-free — P4 slot refactor will rewrite large sections of that file.
- The new `--shadow-sheet-top` token registered in P5 is reusable by the P4 Range slider handle styling.

**Dependency rules after reshuffle**:
- **P1 / P3 / P5 open in parallel** (no shared files — P1 touches build tooling, P3 touches layout + list client, P5 touches sheet component only).
- P2 depends on P1 (mutator shape confirmed).
- P4 depends on **both P3 and P5** (needs clean nuqs state + clean sheet).
- P6 depends on P4 (needs slot API to mount new fields into) and indirectly on P3 (state path).
- P7 depends on P1 + P2 + P6 (needs generated hook + mapper + field set bound to state).
- **P6 prep** (Task #13, `docs/filter-ui-spec.md`) runs independently during P1–P5 so that P6 has a validated UX spec on day one.

---

## 5. Enum mapping policy

**Policy**: client domain enum (`SubscriptionStatus`) stays stable; the
mapper absorbs API renames. Mapping table (Tesla's Phase 2 implementation):

| API status | Client status | Korean label |
|---|---|---|
| `SUBSCRIPTION_SCHEDULED` | `upcoming` | 접수예정 |
| `SUBSCRIPTION_ACTIVE` | `accepting` | 접수중 |
| `RESULT_PENDING` | `pending` | 결과대기 |
| `RESULT_TODAY` | `contracting` | 발표일 (※ label drift — see below) |
| `SUBSCRIPTION_COMPLETED` | `closed` | 마감 |

> **Open question**: the client's `contracting` label in current UI is
> "계약중". API's `RESULT_TODAY` means "발표일 당일". Labels diverge in
> meaning. Two options: (a) rename client `contracting` → `result_today`
> and update UI copy (behavioral), or (b) keep client `contracting` but
> map API `RESULT_TODAY` → `pending` (collapse two API states into one
> client state). Decision deferred to Phase 6 based on Jobs's UX call.

`houseDetailType`: `PRIVATE` ↔ `private`, `NATIONAL` ↔ `public`.
`regionCode` ↔ client does not currently hold region; add
`RegionCodeSchema = z.enum([...17])` alongside `SubscriptionStatusSchema`.

---

## 6. Cross-validation trigger matrix (CLAUDE.md §14)

| Phase | Files touched | Docs to update in same PR |
|---|---|---|
| P1 | `package.json`, `orval.config.ts`, `.env.example`, `src/shared/lib/api-client.ts` | `CLAUDE.md` §2, §10; `ARCHITECTURE.md` §1, §6; `ARCHITECTURE.ko.md` mirror |
| P2 | `src/mocks/*`, `src/features/listings/lib/map-apt-sales.ts` | (none — internal) |
| P3 | `src/app/layout.tsx`, `subscription-list-client.tsx`, tests | `ARCHITECTURE.md`·`ko` §3 |
| P4 | `src/features/listings/components/filter-bar/**` | `ARCHITECTURE.md`·`ko` §4 (slot API note) |
| P5 | `DESIGN.md`, `src/styles/globals.css`, `filter-bar-sheet.tsx` | `DESIGN.md`·`ko` token table |
| P6 | new field components, `filter-bar.options.ts` | `PAGES.md`·`ko` §2.1 filter table, `docs/seo-keyword-map.md` if keywords shift |
| P7 | `src/app/listings/page.tsx`, binding | `PAGES.md`·`ko` §2 data, `ARCHITECTURE.md`·`ko` §6 |

---

## 7. Risk register

| Risk | Mitigation |
|---|---|
| OpenAPI endpoint changes between codegen runs, breaking build | `codegen:check` CI gate fails PR if `git diff` non-empty |
| nuqs SSR hydration mismatch on `/listings` | Pass `searchParams` from Server Component into client hook as hydration seed |
| Sheet "staged vs immediate apply" UX conflict with nuqs | Per Jobs: immediate apply (no staging) — matches PAGES.md "results update immediately" |
| `OPENAPI_URL` leak in committed files | `.claude/api-docs.local.md` in `.gitignore`; PR checklist item "search diff for backend hostname substring (see gitignored file)" |
| Region dropdown keyboard focus trap | Helen (a11y) review in Phase 8 |
| Enum label drift (`RESULT_TODAY`↔`contracting`) | Decision captured in Phase 6 TaskCreate description |

---

## 8. Assumptions the lead made without explicit confirmation

Flagging so reviewers can reject:

1. `/filters/*` MSW handlers removed — assumed no production caller. Will `grep` before deletion.
2. `OPENAPI_URL` GitHub Actions secret — Nolan will request from infra; P1 can ship without CI gate if secret is pending.
3. Pagination UI stays 1-indexed (current behavior). Only the hook param converts to 0-indexed at the boundary.
4. Sheet "immediate apply" (vs "apply button") — matches PAGES.md but diverges from current "apply/reset" sheet footer. Sheet footer buttons will be removed in P6.

---

## 9. Task ownership after plan approval (post-reshuffle)

| Task | Owner | BlockedBy | Blocks |
|---|---|---|---|
| #5 · Phase 1 — orval infra | tesla | — | #6, #11 |
| #6 · Phase 2 — MSW + mapper | tesla | #5 | #11 |
| #7 · Phase 3 — nuqs migration (B1) | linus | — | #8, #10 |
| #9 · Phase 5 — Sheet a11y + token (**selected for early PR**) | chanel | — | #8 |
| #8 · Phase 4 — FilterBar slot (B2) | linus (+ chanel review) | #7, #9 | #10 |
| #13 · Phase 6 prep — filter-ui-spec.md | jobs | — | — |
| #10 · Phase 6 — region / keyword fields (B3) | linus (+ jobs) | #7, #8 | #11 |
| #11 · Phase 7 — /listings binding | tesla (+ linus) | #5, #6, #10 | #12 |
| #12 · Phase 8 — Audit & a11y pass | team-lead (+ helen) | #11 | — |

Initial parallel front: **#5 (tesla)**, **#7 (linus)**, **#9 (chanel)**, **#13 (jobs)**.

— End of plan.

---

## 10. Phase 9 — `/apt-sales/{id}` 상세 바인딩 (delivered)

배포 완료. 상세 엔드포인트가 5개 섹션 응답(`announcement` + `schedule` + `regulations`, `models`, `competitions`, `winnerScores`, `specialSupplies`)으로 내려와 기존 `SubscriptionDetail` 도메인 모델을 확장했습니다.

### 10.1 도메인 타입

- 기존 `SupplyItemSchema` / `SupplyBreakdownSchema` 제거 — 평형별 `models[]` 가 더 정밀해 카테고리 합산 테이블은 정보 손실을 초래.
- 신규: `RegulationFlagSchema`, `ModelSupplySchema`, `CompetitionRowSchema`, `WinnerScoreRowSchema`, `SpecialSupplyStatusRowSchema`, `SpecialSupplyBreakdownItemSchema`.
- `SubscriptionDetailSchema` 에 schedule / regulations / models / competitions / winnerScores / specialSupplyStatus + 부가정보(supplyAddress, businessEntityName, inquiryPhone, moveInMonth) 필드 추가.

### 10.2 매퍼 (`src/features/listings/lib/map-apt-sales-detail.ts`)

- `deriveSchedulePhases(schedule, moveInMonth, today)` — 7단계 phase, 날짜 null 제외, 오늘 대비 past/current/future 판정.
- `pickActiveRegulations(regs)` — truthy 플래그만 안정적 순서로.
- `parseSupplyAddress(supplyAddress, sido)` — `AnnouncementSection` 에 시군구/동이 분리돼 있지 않아 원문에서 토큰 파싱. 2-token 시군구(`수원시 영통구`) 대응.
- `formatPriceManWon(manWon)` — 150000 → "15억", 162500 → "16억 2,500만".
- 엔트리: `mapAptSalesDetailToSubscription(response, today?)`.

### 10.3 라우트 / 사이트맵

- `src/app/listings/[id]/page.tsx` — `generateStaticParams` 제거, `export const revalidate = 300` on-demand ISR. 서버 컴포넌트가 `fetchAptSalesDetailSSR(numericId)` 호출 후 매퍼 경유. `ApiClientError.status===404` 감지 시 `notFound()`.
- 섹션: Header → (규제 칩) → 일정 → 공급(평형별 카드) → 경쟁률 → 당첨가점 → 특공 신청현황 → (사이드바) 공식 링크. 뒤 3개는 배열이 비면 섹션 자체 미렌더.
- `src/app/sitemap.ts` — 레거시 픽스처 대신 `fetchAptSalesList({ page: 0, size: 100 })` 결과로 subscriptionRoutes 생성 (try/catch 로 폴백).

### 10.4 컴포넌트 (전부 sibling skeleton 포함)

- `RegulationChips` / `regulation-chips.skeleton.tsx`
- `ModelSupplyCards` / `model-supply-cards.skeleton.tsx`
- `CompetitionTable` / `competition-table.skeleton.tsx`
- `WinnerScoreTable` / `winner-score-table.skeleton.tsx`
- `SpecialSupplyStatusTable` / `special-supply-status-table.skeleton.tsx`
- 삭제: `supply-breakdown.tsx`, `collapsible-section.tsx`.
- `loading.tsx` 는 위 skeleton 5종 + 헤더/일정/링크 = 9개 testid 를 pin. `loading.test.tsx` 에 canonical order 회귀 테스트 추가.

### 10.5 MSW

- `src/mocks/fixtures/apt-sales-detail.ts` — id 1(Active), 2(Scheduled), 3(Pending with aggregates) 세 레코드.
- `handlers.ts` 에 `GET /apt-sales/:id` 핸들러 추가. 모르는 id 는 `{ status: 404, code: "LISTING_NOT_FOUND" }` 로 거부.

### 10.6 문서 동기화

- `PAGES.md` / `PAGES.ko.md` §3 — 3.2 스케줄 매핑, 3.3 평형별 카드, 3.4/3.5 deferred, 3.6 링크 출처, 신규 3.7 경쟁률 / 3.8 당첨가점 / 3.9 특별공급 신청현황.
- `ARCHITECTURE.md` / `ko` §3 Rendering 전략 — "SSG + ISR" → "ISR (revalidate 300s)" 교정.
