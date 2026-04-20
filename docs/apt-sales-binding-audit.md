# Phase 8 · apt-sales-binding Audit Report

> Branch: `feat/filters-nuqs` (94 commits ahead of `origin/master`)
> Audit date: 2026-04-20
> Auditor: Nolan (lead), pending Helen (accessibility)

This report closes Task #12 and documents the final state of the
`apt-sales-binding` team's work before merge.

---

## 1. Landed commits (chronological, within this branch)

```
3cabda0 chore(filters): drop unused FilterField.Text and FilterField.Range
fea72b6 feat(listings): bind page to /apt-sales with SSR prefetch + Suspense
879a406 fix(filters): restore slim listings filter UI
af6edfd refactor(filters): remove keyword search from listings
8cc5476 docs(filters): record lead decision — region redesign Option A
ed02a6d docs(filters): revise spec after user feedback — drop keyword, redesign region, slim chips
e6708fb docs(filters): align PAGES with bound filter set
622c8b3 feat(filters): add region and keyword fields with multi-select chips
c18c14b refactor(types): rename SubscriptionStatus.contracting to result_today
9cdad2b docs(filters): incorporate Chanel review and UX decisions into spec
1c811bb refactor(filters): introduce FilterField compound slot API
018c1cf refactor(filters): drop /filters/* endpoints in favor of OpenAPI enum
557b838 docs(filters): sync filter-ui-spec with committed sheet tokens
9e63c56 feat(mocks): add /apt-sales MSW handler and domain mapper
a39e972 fix(filters): restore sheet glassmorphism and meet close button touch target
ba396c0 docs(apt-sales): add binding plan and filter UI spec
c4f0fa1 feat(api): add orval codegen infra with api-client mutator adapter
aea1b5c chore(security): gitignore backend hostname reference and runtime lock
be1fa63 refactor(listings): migrate filter state from useState to nuqs URL state
```

## 2. Delivered scope

| Area | Delivered |
|---|---|
| **Infra** | orval 8.x codegen (`pnpm codegen` / `pnpm codegen:check`) with mutator routed through `apiClientMutator`. Zod validators generated alongside TS types. |
| **API surface** | `GET /apt-sales` bound end-to-end. `/api/filters/*` endpoints and MSW handlers removed (OpenAPI enum now single source of truth). |
| **State** | Filter state migrated from `useState` → nuqs URL state. Page reset centralized into one `useEffect`. |
| **Components** | `FilterBar` reduced to a 3-prop shell (`activeCount` / `onReset` / `children`). New `FilterField` compound API — `Inline`, `Stacked`, `Dropdown`. |
| **Design** | Sheet a11y fixed (44×44 close button, `bg-bg-page/80`, `--shadow-sheet-top`). Chip slim + hit-slop pattern (`--chip-hit-slop: 6px`, DESIGN.md §11.3.1). Region redesigned as grouped chip pool (수도권 / 광역시 / 도). |
| **Status enum** | `contracting` → `result_today` rename (Jobs's (a) decision, 7-step migration across types, labels, chip colors, mapper, fixtures, PAGES). |
| **Rendering** | `/listings` is now a Server Component that prefetches `/apt-sales` with `queryClient.prefetchQuery`, then hands a dehydrated cache to a Suspense-wrapped `useSuspenseQuery` on the client. Deep-link URLs are the source of truth for filters. |

## 3. Automated checks (ran at HEAD 3cabda0)

| Check | Result |
|---|---|
| `pnpm type-check` | ✅ clean |
| `pnpm test` | ✅ 104/104 |
| `pnpm lint` | ✅ clean |
| `pnpm build` | ✅ 13 prerendered pages |
| `pnpm audit:seo` | ✅ PASS — 13 prerendered pages cleared all SEO checks |
| `pnpm codegen:check` | ✅ no drift in `src/shared/api/generated/` |
| URL leak scan for backend hostname | ✅ 0 hits across `src/`, `docs/`, root markdown, `.env.example` |
| `pnpm format:check` | ⚠️ 79 files — **pre-existing** on `origin/master`; out of scope for this PR |

## 4. Cross-validation trigger matrix — verification

Per CLAUDE.md §14. Every trigger that fired in this branch has a
matching doc update in the same commit family:

| Trigger | Touched file | Doc updated |
|---|---|---|
| Add orval + rename codegen | `orval.config.ts`, `package.json` | `CLAUDE.md` §2, §10; `ARCHITECTURE.md` §1, §6 (+ ko) |
| Edit `src/shared/lib/api-client.ts` (mutator) | `api-client.ts` | `CLAUDE.md` §10 (+ ko) |
| Add Tailwind tokens (`--shadow-sheet-top`, `--chip-hit-slop`) | `src/styles/globals.css` | `DESIGN.md` §8, §11.3.1 (+ ko) |
| Rename `SubscriptionStatus` enum | `src/shared/types/api.ts` | `PAGES.md` Status Mapping (+ ko) |
| Change API endpoint set bound to `/listings` | `src/app/listings/page.tsx`, `apt-sales-query.ts`, `listings-search-params.ts` | `PAGES.md` §2, `ARCHITECTURE.md` §6 (+ ko) |
| Remove `/api/filters/*` routes | `src/app/api/filters/*`, mocks | `PAGES.md` §2, §2.1 (+ ko) |

EN/KO line counts after landing:

| Doc | EN | KO | Parity |
|---|---|---|---|
| `ARCHITECTURE.md` | 321 | 323 | ±2 (acceptable drift, KO adds clarifying bullets) |
| `CLAUDE.md` | 458 | 451 | ±7 (KO collapses compound lines) |
| `DESIGN.md` | 913 | 915 | ±2 |
| `PAGES.md` | 488 | 489 | ±1 |

All four files are structurally mirrored; line-count drift comes from
Korean line wrapping, not missing sections.

## 5. Accessibility judgments (Helen) — resolved

Helen audited the four items surfaced during Phase 6 reviews. Outcomes:

1. **Subheading contrast** — *fixed (`00a70d3`).* `text-text-tertiary`
   (~2.85:1) failed WCAG 2.2 AA / KWCAG 5.3.1 for a functional
   grouping label. Swapped to `text-text-secondary` (~7.5:1), which
   also matches DESIGN.md §7 semantics and the neighboring "지역
   전체" pseudo-row.
2. **Region trigger ARIA** — *fixed (`00a70d3`).* Trigger now carries
   `aria-haspopup="dialog"` + `aria-controls={panelId}`; the panel
   carries `id={panelId}` + `role="dialog"` + `aria-label="{label}
   선택"`. Desktop and Mobile variants each mint their own `useId`.
3. **Grouped chip pool keyboard flow** — *OK, no change.* The toggle
   buttons + `role="group"` + `aria-pressed` pattern is the correct
   idiom; arrow-key navigation would violate convention here. Only
   dependency was that the new `role="dialog"` Escape-to-close now
   works for both Desktop and the mobile expand path (previously
   Desktop-only).
4. **Sheet focus trap** — *fixed (`00a70d3`).* Sheet gained
   `role="dialog"` + `aria-modal="true"` + `aria-labelledby`, a Tab
   cycle trap with Escape-to-close, initial focus on the close
   button, and focus return to the trigger (via `triggerRef` on the
   shell context) after the 250ms close animation. A lighter-weight
   `inert`-based alternative is viable but was deferred — the
   JS-only trap has no runtime dependency and matches existing
   lifecycle timing.

Helen still owes a PR diff review on `00a70d3`. Once that lands as a
thumbs-up, §12 closes.

## 6. Manual smoke test suggestions

Not yet run (lead paused on `pnpm dev`). Before merge:

- [ ] `/listings?status=SUBSCRIPTION_ACTIVE&region=SEOUL` deep-link,
      hard refresh → filters reflected in UI, SSR seed matches
      client.
- [ ] Toggle region chip pool on mobile viewport → sheet closes on
      "닫기", URL updates each tap, no staged/apply delay.
- [ ] Keyboard only: Tab from page top → reach region trigger →
      Enter opens popover → Tab through chips → Esc closes and
      returns focus to the trigger.

## 7. Deferred work (Phase 9+ backlog)

| Item | Owner | Reason |
|---|---|---|
| `<Chip>` shared component promotion | Linus / Chanel | Three consumers exist; abstraction earns its keep once a fourth appears |
| Region Option B (tabbed) / Option C (map) | Jobs | Gated on district (구/군) backend parameter |
| Backend error-envelope (4xx/5xx) schema | Tesla (coordinating with infra) | OpenAPI currently only documents 200 |
| `.env.local` `OPENAPI_URL` CI secret | Lead → infra | Local codegen works; CI gate pending secret provisioning |
| Prettier `format --write` sweep | — | 79 pre-existing files fail `format:check`; separate cleanup PR |
| `text-text-tertiary` subheading contrast | Helen | Awaiting accessibility judgment (see §5.1) |

## 8. Not shipped in this PR (intentional)

- **`FilterField.Text`** and **`FilterField.Range`** were deleted
  (`3cabda0`) — the former had no consumer after keyword was removed,
  the latter was a placeholder primitive. They can be reintroduced
  from git history when a real consumer appears.
- **`/api/filters/regions`** and **`/api/filters/builders`**
  endpoints were removed (`018c1cf`). PAGES.md carries an explicit
  "obsolete, use OpenAPI enum" breadcrumb for 1–2 release cycles,
  after which it can also be removed.
- **SEO `SearchAction`** JSON-LD remains held back (per existing
  project policy in `CLAUDE.md` §11) because `/listings` does not
  bind a `q` parameter — this audit does not change that position.

---

Closing Task #12 once Helen signs off on §5.
