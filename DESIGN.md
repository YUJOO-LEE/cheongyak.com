# Design System — cheongyak.com

> **Version:** 4.0 · **Theme:** Light only · **Typeface:** Pretendard · **Base unit:** 4px

---

## 1. Overview & Creative North Star

**"The Editorial Architect"**

This design system moves away from the utilitarian, spreadsheet-like density of traditional real estate portals. It adopts the persona of a high-end digital curator — blending the authority of an architectural journal with the fluidity of a modern fintech app.

**Core principles:**

- **Community-App vibe** — premium, intentional, and trustworthy for the 30–50 demographic
- **Intentional Asymmetry** — break the template look through editorial-grade layout tension
- **Tonal Depth** — breathing room (white space) as a luxury feature
- **Mobile-first** — designed for phones, scaled up for tablets and desktops
- **Light theme only** — optimized for a high-clarity, daylight-editorial experience
- **Two-tier design** — editorial treatment for Home/News pages, utilitarian-premium for Listings/Detail pages

### Design Tiers

| Tier | Pages | Approach |
|:---|:---|:---|
| **Editorial** | Home Dashboard, News Feed, News Article | Magazine-style layouts, gradient mesh heroes, stagger animations, section decorators, full-bleed moments |
| **Utilitarian-Premium** | Subscription Listing, Subscription Detail, Search | Information-dense, uniform card grids, instant rendering, data table optimization, minimal animation |

This distinction exists because our users are **repeat visitors seeking efficiency** on data pages, but **first-time discoverers** on editorial pages. Design for the 50th visit on Listings, the 1st visit on Home.

---

## 2. Color System

Colors are organized into two layers: **Brand Colors** (identity) and **Functional Colors** (semantic meaning). Implementations must use semantic tokens (Section 2.7), never raw hex values.

### 2.1 Brand Primary Scale

Base: `#0356FF` — the core brand identity. Used for CTAs, active states, links, and primary UI elements.

| Token | Hex | Usage |
|:---|:---|:---|
| `brand-primary-50` | `#EEF4FF` | Tinted backgrounds, selected row highlight |
| `brand-primary-100` | `#D9E5FF` | Hover backgrounds, subtle fills |
| `brand-primary-200` | `#B3CCFF` | Light accents, progress track |
| `brand-primary-300` | `#80ABFF` | Decorative borders |
| `brand-primary-400` | `#4D7FFF` | Secondary icons |
| `brand-primary-500` | `#0356FF` | **Core brand — buttons, links, active states** |
| `brand-primary-600` | `#0248D9` | Hover state for primary buttons |
| `brand-primary-700` | `#0239B0` | Active/pressed state |
| `brand-primary-800` | `#022D8A` | High-contrast text on light backgrounds |
| `brand-primary-900` | `#011F63` | Deep accent |
| `brand-primary-950` | `#011442` | Darkest primary — rare, extreme contrast |

### 2.2 Brand Secondary Scale

Base: `#00FFC2` — energetic cyan/mint accent. Used for highlights, badges, decorative elements, and secondary CTAs. **Never use for text on white** (fails contrast).

| Token | Hex | Usage |
|:---|:---|:---|
| `brand-secondary-50` | `#EDFFF9` | Subtle highlight background |
| `brand-secondary-100` | `#D1FFF0` | Light accent fill |
| `brand-secondary-200` | `#A3FFE1` | Badge backgrounds, decorative fills |
| `brand-secondary-300` | `#66FFD1` | Illustrations, progress bars |
| `brand-secondary-400` | `#33FFCA` | Prominent decorative accents |
| `brand-secondary-500` | `#00FFC2` | **Core secondary accent** |
| `brand-secondary-600` | `#00D9A5` | Hover state |
| `brand-secondary-700` | `#00B388` | Active/pressed state, text on secondary-50 bg |
| `brand-secondary-800` | `#008C6B` | High-contrast text on light secondary backgrounds |
| `brand-secondary-900` | `#00664E` | Deep accent |
| `brand-secondary-950` | `#004033` | Darkest secondary |

**Accessibility rule:** Secondary 500 has ~1.6:1 contrast on white — use only as decorative background, never as text. Use 700+ for text on secondary-tinted backgrounds.

### 2.3 Brand Tertiary Scale

Base: `#FF7C4C` — warm coral/orange. Used for energy, attention-grabbing elements, promotional highlights, and tertiary CTAs.

| Token | Hex | Usage |
|:---|:---|:---|
| `brand-tertiary-50` | `#FFF4F0` | Warm tinted background |
| `brand-tertiary-100` | `#FFE4DA` | Light warm accent |
| `brand-tertiary-200` | `#FFC9B5` | Badge backgrounds |
| `brand-tertiary-300` | `#FFAB8A` | Decorative elements |
| `brand-tertiary-400` | `#FF9468` | Prominent warm accents |
| `brand-tertiary-500` | `#FF7C4C` | **Core tertiary — promotional highlights** |
| `brand-tertiary-600` | `#E06236` | Hover state |
| `brand-tertiary-700` | `#BA4C27` | Active/pressed state |
| `brand-tertiary-800` | `#93391C` | High-contrast warm text |
| `brand-tertiary-900` | `#6B2913` | Deep warm accent |
| `brand-tertiary-950` | `#451A0C` | Darkest tertiary |

**Accessibility rule:** Tertiary 500 has ~3.3:1 contrast on white — passes for large text/UI components only. Use 700+ for normal text.

### 2.4 Neutral Scale (Slate)

Base neutral: `#F8F9FA` — the page canvas.

| Token | Hex | Usage |
|:---|:---|:---|
| `neutral-0` | `#FFFFFF` | Card background, modal background |
| `neutral-50` | `#F8F9FA` | **Page background (canvas)** |
| `neutral-100` | `#F1F5F9` | Subtle section differentiation |
| `neutral-200` | `#E2E8F0` | Borders, dividers |
| `neutral-300` | `#CBD5E1` | Disabled borders, subtle separators |
| `neutral-400` | `#94A3B8` | Placeholder text, disabled text, captions |
| `neutral-500` | `#64748B` | Secondary icons |
| `neutral-600` | `#475569` | Subheadings, descriptions, body icons |
| `neutral-700` | `#334155` | Strong secondary text |
| `neutral-800` | `#1E293B` | High-emphasis text |
| `neutral-900` | `#0F172A` | Primary headings, maximum contrast text |
| `neutral-950` | `#020617` | Near-black — use sparingly |

### 2.5 Functional Colors

Functional colors convey semantic meaning independent of brand. They are chosen to harmonize with brand colors while remaining visually distinct.

#### Success Scale

Base: `#22C55E` (green, hue 142°) — positive states, completed actions, open applications.

| Token | Hex | Usage |
|:---|:---|:---|
| `success-50` | `#F0FDF4` | Success banner background |
| `success-100` | `#DCFCE7` | Subtle success highlight |
| `success-200` | `#BBF7D0` | Light success fill |
| `success-300` | `#86EFAC` | Decorative success elements |
| `success-400` | `#4ADE80` | Secondary success icon |
| `success-500` | `#22C55E` | **Core success — "접수중" chip** |
| `success-600` | `#16A34A` | Hover state |
| `success-700` | `#15803D` | Active/pressed, chip text on success-50 |
| `success-800` | `#166534` | High-contrast success text |
| `success-900` | `#14532D` | Deep success accent |
| `success-950` | `#052E16` | Darkest success |

#### Danger Scale

Base: `#E11D48` (rose-crimson, hue 347°) — errors, closed status, destructive actions.

| Token | Hex | Usage |
|:---|:---|:---|
| `danger-50` | `#FFF1F2` | Error banner background |
| `danger-100` | `#FFE4E6` | Subtle error highlight |
| `danger-200` | `#FECDD3` | Light error fill |
| `danger-300` | `#FDA4AF` | Decorative danger elements |
| `danger-400` | `#FB7185` | Secondary danger icon |
| `danger-500` | `#E11D48` | **Core danger — "마감", errors** |
| `danger-600` | `#BE123C` | Hover state |
| `danger-700` | `#9F1239` | Active/pressed, chip text on danger-50 |
| `danger-800` | `#881337` | High-contrast danger text |
| `danger-900` | `#4C0519` | Deep danger accent |
| `danger-950` | `#2D0310` | Darkest danger |

#### Warning Scale

Base: `#F79009` (amber, hue 34°) — caution states, approaching deadlines, important notices.

| Token | Hex | Usage |
|:---|:---|:---|
| `warning-50` | `#FFFBEB` | Warning banner background |
| `warning-100` | `#FEF3C7` | Subtle warning highlight |
| `warning-200` | `#FDE68A` | Light warning fill |
| `warning-300` | `#FCD34D` | Decorative warning elements |
| `warning-400` | `#FBBF24` | Secondary warning icon |
| `warning-500` | `#F79009` | **Core warning — "마감임박" chip** |
| `warning-600` | `#D97706` | Hover state |
| `warning-700` | `#B45309` | Active/pressed, chip text on warning-50 |
| `warning-800` | `#92400E` | High-contrast warning text |
| `warning-900` | `#78350F` | Deep warning accent |
| `warning-950` | `#451A03` | Darkest warning |

#### Info Scale

Base: `#06B6D4` (cyan, hue 189°) — informational states, upcoming events, neutral notices.

| Token | Hex | Usage |
|:---|:---|:---|
| `info-50` | `#ECFEFF` | Info banner background |
| `info-100` | `#CFFAFE` | Subtle info highlight |
| `info-200` | `#A5F3FC` | Light info fill |
| `info-300` | `#67E8F9` | Decorative info elements |
| `info-400` | `#22D3EE` | Secondary info icon |
| `info-500` | `#06B6D4` | **Core info — "접수예정" chip** |
| `info-600` | `#0891B2` | Hover state |
| `info-700` | `#0E7490` | Active/pressed, chip text on info-50 |
| `info-800` | `#155E75` | High-contrast info text |
| `info-900` | `#164E63` | Deep info accent |
| `info-950` | `#083344` | Darkest info |

### 2.6 Color Usage Rules

| Category | Where to use | Where NOT to use |
|:---|:---|:---|
| Brand Primary | CTAs, links, active nav, focus rings | Status indicators |
| Brand Secondary | Decorative accents, badges, highlights | Text on white bg, status indicators |
| Brand Tertiary | Promotional highlights, energy accents | Text on white bg (unless 700+), status |
| Success | "접수중" status, positive confirmations | Brand identity elements |
| Danger | "마감" status, errors, destructive actions | Brand identity elements |
| Warning | "마감임박" status, caution notices | Brand identity elements |
| Info | "접수예정" status, informational tags | Brand identity elements |

### 2.7 Semantic Color Tokens

All implementations must reference semantic tokens, not raw scales.

#### Backgrounds

| Token | Value | Purpose |
|:---|:---|:---|
| `color-bg-page` | `neutral-50` | Root page canvas |
| `color-bg-card` | `neutral-0` | Card / modal surface |
| `color-bg-elevated` | `neutral-0` | Floating elements (popover, dropdown) |
| `color-bg-sunken` | `neutral-100` | Inset areas, input fills |
| `color-bg-overlay` | `neutral-900` at 50% opacity | Scrim behind modals |

#### Text

| Token | Value | Purpose |
|:---|:---|:---|
| `color-text-primary` | `neutral-900` | Headings, primary body |
| `color-text-secondary` | `neutral-600` | Subheadings, descriptions |
| `color-text-tertiary` | `neutral-400` | Captions, timestamps |
| `color-text-disabled` | `neutral-300` | Disabled labels |
| `color-text-inverse` | `neutral-0` | Text on dark / primary backgrounds |

#### Borders

| Token | Value | Purpose |
|:---|:---|:---|
| `color-border-default` | `neutral-200` | Standard borders (ghost-level only) |
| `color-border-subtle` | `neutral-200` at 20% opacity | Ghost borders per No-Line rule |
| `color-border-strong` | `neutral-300` | Emphasis borders (rare) |

#### Interactive

| Token | Value | Purpose |
|:---|:---|:---|
| `color-interactive-default` | `brand-primary-500` | Links, primary buttons |
| `color-interactive-hover` | `brand-primary-600` | Hover state |
| `color-interactive-active` | `brand-primary-700` | Pressed state |
| `color-interactive-disabled` | `neutral-300` | Disabled interactive elements |
| `color-button-secondary` | `neutral-200` | Secondary button surface (sits on `bg-page` and needs higher contrast than `bg-sunken` to read as a tappable affordance) |
| `color-button-secondary-hover` | `neutral-300` | Secondary button hover state |
| `color-button-secondary-active` | `neutral-400` | Secondary button press state — kept one tone darker than `bg-active` so the press affordance still reads on a dense surface like `bg-page` |
| `color-bg-hover` | `neutral-200` | Generic hover surface for non-button rows |
| `color-bg-active` | `neutral-200` | Generic press surface for card-in-card list rows (kept light so a tap inside a card doesn't read as visual noise — buttons that need a heavier press use `color-button-secondary-active`) |

#### Status

| Token | Value | Purpose |
|:---|:---|:---|
| `color-status-success` | `success-500` | Positive states |
| `color-status-danger` | `danger-500` | Errors, closed status |
| `color-status-warning` | `warning-500` | Caution, approaching deadline |
| `color-status-info` | `info-500` | Informational |

#### Focus

| Token | Value | Purpose |
|:---|:---|:---|
| `color-focus-ring` | `brand-primary-500` | Keyboard focus indicator |

---

## 3. Surface Architecture

### The "No-Line" Rule

**Explicit instruction:** Do not use 1px solid borders for sectioning or containment. Boundaries must be defined through:

1. **Background color shifts** — placing a `color-bg-card` section against `color-bg-page`, or vice versa
2. **Tonal transitions** — subtle shifts between surface levels to imply structure

### Surface Hierarchy

| Level | Token | Usage |
|:---|:---|:---|
| **Canvas** | `color-bg-page` | The root background |
| **Low elevation** | `color-bg-sunken` | Secondary content areas |
| **High elevation** | `color-bg-card` | Primary interaction cards |
| **Floating** | `color-bg-elevated` | Dropdowns, popovers, tooltips |

### The "Glass & Gradient" Rule

- **Glassmorphism:** For floating elements (sticky nav bar). Apply `color-bg-page` at 80% opacity with `backdrop-blur: 20px`
- **Signature gradients:** Primary CTAs use a linear gradient from `brand-primary-500` to `brand-primary-400` at 135°
- **Never** use glassmorphism and gradient simultaneously on the same element

### The "Ghost Border" Fallback

When accessibility requires a visible border, use `color-border-subtle` (neutral-200 at 20% opacity). 100% opaque borders are forbidden under normal conditions. Cards should also use `shadow-sm` as a supplementary boundary cue.

**Exception:** Under `@media (prefers-contrast: more)`, render solid 1px `color-border-default` borders to ensure visible boundaries for users who need enhanced contrast.

---

## 4. Typography Scale

**Primary typeface:** Pretendard (Korean-first, includes Latin glyphs)

Pretendard replaces Inter as the sole typeface. It was purpose-built for Korean digital interfaces with superior 한글 legibility, consistent weight across all glyphs, and excellent Latin compatibility. Display sizes use weight 800 (ExtraBold) with tight tracking for editorial headline contrast.

### Font Stack (Tailwind config)

```
fontFamily: {
  sans: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
}
```

### Type Scale

| Token | Size | Line Height | Weight | Letter Spacing | Usage |
|:---|:---|:---|:---|:---|:---|
| `display-lg` | 36px | 44px | 800 | -0.03em | Hero statements, landing headings |
| `display-sm` | 30px | 38px | 800 | -0.03em | Major section titles |
| `headline-lg` | 24px | 32px | 700 | -0.02em | Page titles, card group headings |
| `headline-sm` | 20px | 28px | 700 | -0.02em | Card titles, dialog titles |
| `body-lg` | 16px | 24px | 400 | 0 | Primary body text, news content |
| `body-md` | 14px | 20px | 400 | 0 | Secondary body, list items |
| `body-sm` | 12px | 16px | 400 | 0.01em | Footnotes, supplementary info |
| `label-lg` | 14px | 20px | 600 | 0.01em | Button text, form labels |
| `label-md` | 12px | 16px | 600 | 0.01em | Chip text, small labels |
| `caption` | 11px | 14px | 400 | 0.02em | Timestamps, metadata |

### Typography Rules

- **Headline impact:** `display-lg` and `display-sm` use weight 800 + tight tracking (-0.03em) for editorial gravitas without needing a second typeface
- **Hierarchy as identity:** Use `color-text-secondary` for labels. Reserve `color-text-primary` for headings
- **Editorial contrast:** Pair large headers (`display-lg`) with small metadata (`caption`) to create tension
- **Never** use pure black (`#000000`) — always use `color-text-primary` or lighter
- Minimum body text: `body-sm` (12px). Nothing smaller in production UI
- **Korean readability:** Pretendard is optimized for 한글 at all sizes, especially critical for data-dense pages

---

## 5. Spacing System

**Base unit:** 4px

| Token | Value | Common usage |
|:---|:---|:---|
| `space-0` | 0px | Reset |
| `space-1` | 4px | Tight inline gaps (icon–text) |
| `space-2` | 8px | Chip padding, compact gaps |
| `space-3` | 12px | Small card padding, input padding-x |
| `space-4` | 16px | Default card padding, section gaps |
| `space-5` | 20px | Medium spacing |
| `space-6` | 24px | Card padding (comfortable), list item separation |
| `space-8` | 32px | Section separation within a page |
| `space-10` | 40px | Large section gaps |
| `space-12` | 48px | Major content block separation |
| `space-16` | 64px | Page-level section separation |
| `space-20` | 80px | Hero/banner vertical padding |
| `space-24` | 96px | Maximum breathing room |

---

## 6. Breakpoints & Layout

| Token | Value | Target |
|:---|:---|:---|
| `bp-sm` | 640px | Mobile landscape |
| `bp-md` | 768px | Tablet portrait |
| `bp-lg` | 1024px | Desktop |
| `bp-xl` | 1280px | Wide desktop |

- **Content max-width:** 1200px, centered with auto margins
- **Mobile-first:** Base styles target `< 640px`. Use `min-width` media queries to scale up
- **Grid:** 12-column grid with `space-4` (16px) gutter on mobile, `space-6` (24px) on desktop
- **Page padding:** `space-4` (16px) on mobile, `space-8` (32px) on desktop

---

## 7. Border Radius Tokens

| Token | Value | Usage |
|:---|:---|:---|
| `radius-sm` | 4px | Small elements (tags inline, tooltips) |
| `radius-md` | 8px | **Default** — cards, buttons, inputs |
| `radius-lg` | 12px | Large cards, modals, image containers |
| `radius-xl` | 16px | Hero cards, promotional banners |
| `radius-full` | 9999px | Chips, avatars, pill buttons |

**Rule:** Every interactive element must use at least `radius-md` (8px). Sharp corners are forbidden.

---

## 8. Elevation & Depth

### Tonal Layering (Primary Method)

Depth through background color shifts, not shadows. Place `color-bg-card` on `color-bg-page` — subtle contrast creates natural lift.

### Ambient Shadows (Floating Elements Only)

| Token | Value | Usage |
|:---|:---|:---|
| `shadow-sm` | `0 1px 3px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.06)` | Subtle lift (dropdown) |
| `shadow-md` | `0 4px 12px rgba(15,23,42,0.06), 0 2px 4px rgba(15,23,42,0.04)` | Cards on hover |
| `shadow-lg` | `0 12px 40px rgba(15,23,42,0.08)` | Modals, floating action button |
| `shadow-sheet-top` | `0 -1px 2px rgba(15,23,42,0.06), 0 -12px 40px rgba(15,23,42,0.08)` | Bottom sheet top edge (inverted direction) |

- **Color:** Tinted `neutral-900` (deep navy-grey), never pure black

---

## 9. Z-Index Scale

| Token | Value | Usage |
|:---|:---|:---|
| `z-base` | 0 | Default stacking |
| `z-dropdown` | 100 | Dropdown menus, select panels |
| `z-sticky` | 200 | Sticky headers, floating buttons |
| `z-overlay` | 300 | Backdrop / scrim |
| `z-modal` | 400 | Modal dialogs |
| `z-toast` | 500 | Toast notifications (always on top) |

---

## 10. Motion Tokens

| Token | Value | Usage |
|:---|:---|:---|
| `duration-fast` | 150ms | Micro-interactions (hover, toggle) |
| `duration-normal` | 250ms | Standard transitions (panel open, tab switch) |
| `duration-slow` | 400ms | Complex animations (modal enter, page transition) |
| `duration-shimmer` | 1500ms | Skeleton loader wave cycle |
| `easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General purpose (ease-in-out) |
| `easing-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements exiting the viewport |
| `easing-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering the viewport |

### Motion Rules

- Respect `prefers-reduced-motion: reduce` — disable all non-essential animation
- Skeleton loaders use a left-to-right gradient wave (`skeleton-wave`) at `duration-shimmer` with `ease-in-out`, not a background-color pulse
- Page transitions use `duration-normal` with `easing-out`
- Never animate layout properties (width, height) — use `transform` and `opacity` only
- Apply motion primarily on **Editorial tier** pages (Home, News). **Utilitarian tier** pages (Listings, Detail) use instant rendering with minimal animation

### Interaction Patterns

These patterns describe WHAT moves, WHEN, and HOW. All patterns are disabled under `prefers-reduced-motion: reduce`.

#### Card List Stagger Entrance (Editorial tier only)

Cards fade in with a stagger when entering the viewport. Used on Home Dashboard only — Subscription Listing renders cards instantly.

```css
.card-list > * {
  opacity: 0;
  transform: translateY(12px);
  animation: fadeUp var(--duration-normal) var(--easing-out) forwards;
}
.card-list > *:nth-child(1) { animation-delay: 0ms; }
.card-list > *:nth-child(2) { animation-delay: 60ms; }
.card-list > *:nth-child(3) { animation-delay: 120ms; }
.card-list > *:nth-child(4) { animation-delay: 180ms; }
.card-list > *:nth-child(5) { animation-delay: 240ms; }
/* Items beyond 5 appear instantly */
```

#### Card Hover Lift

Replaces the previous "shift to sunken" hover state. Provides a sense of lift, not depression.

```css
.card:hover,
.card:focus-visible {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  transition: transform var(--duration-fast) var(--easing-default),
              box-shadow var(--duration-fast) var(--easing-default);
}
```

#### Skeleton Loader Wave

Gradient shimmer (1.5s cycle) that moves left-to-right across a static neutral base. Long enough to read as "loading", slow enough not to feel like a UI bug.

```css
@keyframes skeleton-wave {
  from { background-position: -150% 0; }
  to   { background-position:  250% 0; }
}
.skeleton {
  background-color: var(--neutral-200);
  background-image: linear-gradient(
    90deg,
    transparent 0%,
    var(--neutral-100) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  background-repeat: no-repeat;
  animation: skeleton-wave var(--duration-shimmer) ease-in-out infinite;
}
```

Under `prefers-reduced-motion: reduce`, the primitive flattens to a static `neutral-200` block (no gradient, no animation).

#### App Bootstrap Splash

Rendered inline by `app/layout.tsx` as `<div id="app-splash">` so it paints on the first HTML frame, before React hydrates. A client-side `<AppReadyMarker />` sets `document.body.dataset.appReady = 'true'` in `useEffect`, and CSS fades the splash out (`duration-normal`, `easing-out`). This layer is distinct from route-level `loading.tsx` skeletons — the splash covers only the pre-hydration frame; skeletons cover in-app navigation and API loading.

---

## 11. Components

### 11.1 Cards

The hero component. All cards use tonal layering — no border lines.

#### Variants

| Variant | Padding | Radius | Description |
|:---|:---|:---|:---|
| **Subscription Card** | `space-6` (24px) | `radius-lg` (12px) | Main listing card — title, location, dates, status chip, key stats |
| **News Card** | `space-4` (16px) | `radius-md` (8px) | Article preview — thumbnail, headline, timestamp |
| **Stat Card** | `space-4` (16px) | `radius-md` (8px) | Single metric — label, large number, trend indicator |
| **Compact Card** | `space-3` (12px) | `radius-md` (8px) | List-style card for dense data views |

#### Card States

**No borders on cards.** Cards must never have visible borders (including left/right accent borders). Status is communicated exclusively through the status chip (color + icon + text label).

| State | Style |
|:---|:---|
| Default | `color-bg-card` background |
| Hover | `translateY(-2px)` + `shadow-md`, transition 150ms `easing-default` |
| Pressed | `translateY(0)` + `shadow-sm` |
| Focus-visible | Same as hover + focus ring |
| Disabled | 50% opacity, no interaction |

#### Card Spacing

- Between cards (vertical list): `space-4` (16px)
- Between card sections (internal): `space-3` (12px)
- Card group heading to first card: `space-4` (16px)

### 11.2 Buttons

| Property | Small (`sm`) | Medium (`md`) | Large (`lg`) |
|:---|:---|:---|:---|
| Height | 32px | 40px | 48px |
| Padding (x) | `space-3` (12px) | `space-4` (16px) | `space-6` (24px) |
| Font | `label-md` | `label-lg` | `label-lg` |
| Radius | `radius-md` (8px) | `radius-md` (8px) | `radius-md` (8px) |
| Min Width | 64px | 80px | 120px |

#### Button Variants

| Variant | Default | Hover | Active | Disabled |
|:---|:---|:---|:---|:---|
| **Primary** | Gradient `brand-primary-500` → `brand-primary-400` at 135° | `brand-primary-600` solid | `brand-primary-700` solid | `neutral-200` bg, `neutral-400` text |
| **Secondary** | `brand-secondary-700` bg, white text | `brand-secondary-800` bg | `brand-secondary-900` bg | `neutral-200` bg, `neutral-400` text |
| **Tertiary** | Transparent, `brand-primary-500` text | `neutral-50` bg | `neutral-100` bg | `neutral-400` text, no bg |
| **Danger** | `danger-500` bg, white text | `danger-600` bg | `danger-700` bg | `neutral-200` bg, `neutral-400` text |

### 11.3 Chips (Status Indicators)

Shape: `radius-full` (capsule). Always pair color with icon or text label for accessibility.

| Status | Background | Text | Icon |
|:---|:---|:---|:---|
| **접수중 (Active)** | `brand-secondary-100` | `brand-secondary-900` | `check-circle` (Lucide) |
| **접수예정 (Upcoming)** | `info-100` | `info-700` | `calendar` (Lucide) |
| **발표대기 (Pending)** | `warning-100` | `warning-700` | `clock` (Lucide) |
| **발표일 (Result Today)** | `warning-50` | `warning-700` | `file-check` (Lucide) |
| **청약완료 (Closed)** | `neutral-200` | `neutral-600` | `archive` (Lucide) |

Chip padding: `space-1` (4px) vertical, `space-2` (8px) horizontal. Font: `label-md`.

### 11.3.2 Phase Chip (Weekly Schedule)

Distinct from Status Chip: Status chips reflect the announcement-wide today-relative state and would shift color across days for the same event. Phase chips lock each weekly phase to a fixed (bg, text) pair so "당첨자 발표 on Monday" looks identical to "당첨자 발표 on Friday." Used by `WeeklyCard` (home `/`) and any future per-day phase rendering.

| Phase | Background | Text |
|:---|:---|:---|
| **특별공급** | `info-50` | `info-700` |
| **일반공급 1순위** | `brand-primary-100` | `brand-primary-800` |
| **일반공급 2순위** | `brand-primary-50` | `brand-primary-700` |
| **당첨자 발표** | `warning-50` | `warning-700` |

Hue allocation:
- 1순위 / 2순위 share `brand-primary` hue, with 1순위 one step heavier (`-100/-800`) and 2순위 one step lighter (`-50/-700`) — same hue ties them as the same "submit" action family while the bg/text steps express priority.
- 특별공급 uses `info` cyan, one tone lighter than the `upcoming` Status Chip (`info-100/700`). Same hue family signals "scheduled / upcoming step" while the lighter bg keeps it visually subordinate to a current-state status chip when both ever co-exist on the same surface.
- 당첨자 발표 reuses the **same `warning-50/700` token pair as the `result_today` Status Chip** — both convey the same "announcement-day" semantic, so the visuals are kept identical on purpose.

Text-only chips (no icon). Color-blind safety holds because each phase carries an explicit Korean label (`특별공급` / `일반공급 1순위` / `일반공급 2순위` / `당첨자 발표`); color is reinforcement, not the sole signal.

Padding / font match Status Chip:
- `sm`: `px-1.5 py-0.5`, `text-caption font-semibold`
- `md`: `px-2 py-1`, `text-label-md`

Component: `src/shared/components/chip/phase-chip.tsx`. Props: `phase: WeeklyPhase`, `size?: 'sm' | 'md'`, `className?`. The `phase` prop is the Korean enum literal (`WeeklyPhase` from `src/shared/types/api.ts`) — no separate english key layer.

`StatusChip` does NOT accept a `label` override. Phase rendering must use `PhaseChip`; this is enforced by removing the `label?` prop from `StatusChip`.

#### 11.3.1 Chip — Hit-Slop Pattern

Use this pattern only for dense chip rows where a slim visual surface is required but touch targets must still meet 44×44.

| Property | Value |
|:---|:---|
| Visible height | `h-8` (32px) |
| Visible padding | `px-3` (12px) |
| Hit-slop token | `--chip-hit-slop: 6px` |
| Utility | `.chip-hit-slop::before { inset: calc(var(--chip-hit-slop) * -1) }` |
| Minimum inter-chip gap | `gap-3` (12px) |

Rules:
- The real button must keep `position: relative`; the pseudo-element anchors to it.
- Apply `aria-pressed` to the button itself, never to the pseudo-element.
- Use this for grouped filter chips such as `/listings` status, type, and region options.
- Do not use this for standalone CTAs or lone buttons; those should render at full 44px height directly.
- Selected state for neutral filter chips stays `neutral-500` background with inverse text. Do not switch filter chips to `brand-primary-*`.

### 11.4 Navigation — Bottom Bar (Mobile)

| Property | Value |
|:---|:---|
| Height | 64px |
| Background | `color-bg-page` at 80% opacity |
| Backdrop | `blur(20px)` (glassmorphism) |
| Shadow | `0 -1px 8px rgba(15,23,42,0.04)` top shadow |
| Z-index | `z-sticky` (200) |
| Layout | Evenly spaced icons + labels (max 5 items) |
| Icon size | 24px |
| Label font | `caption` (11px) |
| Active color | `brand-primary-500` |
| Inactive color | `neutral-400` |
| Touch target | 44×44px minimum per item |

On desktop (`bp-lg`+), navigation moves to a top horizontal bar with the same glassmorphism treatment.

### 11.5 Tables (Subscription Data)

| Property | Value |
|:---|:---|
| Header bg | `color-bg-sunken` |
| Header font | `label-lg`, `color-text-secondary` |
| Row bg (even) | `color-bg-card` |
| Row bg (odd) | `color-bg-page` |
| Row padding | `space-3` (12px) vertical, `space-4` (16px) horizontal |
| Font | `body-md` |
| Border | None (use alternating row colors) |
| Radius | `radius-lg` (12px) on outer container |

**Responsive:** On mobile (`< bp-sm`), tables transform into stacked card layouts.

**Data table border exception:** Unlike cards and layout sections, data tables (supply breakdown, eligibility criteria, schedule tables) MAY use subtle grid lines at `neutral-200` 30% opacity for row-tracing. This is a targeted exception to the No-Line rule — dense tabular data requires visible row boundaries for scannability.

### 11.6 Inputs

| Property | Small (`sm`) | Medium (`md`) | Large (`lg`) |
|:---|:---|:---|:---|
| Height | 36px | 44px | 52px |
| Padding (x) | `space-3` (12px) | `space-3` (12px) | `space-4` (16px) |
| Font | `body-sm` | `body-md` | `body-lg` |
| Radius | `radius-md` (8px) | `radius-md` (8px) | `radius-md` (8px) |

#### Input States

| State | Style |
|:---|:---|
| Default | `color-bg-sunken` fill, no border. Bottom 2px indicator transparent |
| Focus | Bottom 2px indicator `brand-primary-500`. Outer focus ring per a11y spec |
| Error | Bottom 2px indicator `danger-500`. Helper text in `danger-600` |
| Disabled | 50% opacity, `not-allowed` cursor |

### 11.7 Skeleton Loaders

| Component | Skeleton Shape |
|:---|:---|
| Subscription Card | Rectangle `radius-lg`, 3 text bars (60%/80%/40% width), 1 chip placeholder |
| News Card | Thumbnail rect + 2 text bars |
| Stat Card | Small label bar + large number bar + trend indicator bar |
| Button | Rounded rectangle matching button dimensions |
| Chip | Capsule shape matching chip dimensions |
| Table row | 4–6 horizontal bars in a row layout |

- Background: `neutral-200`
- Pulse: `neutral-200` → `neutral-100` → `neutral-200` at `duration-slow` with `easing-default`
- Respect `prefers-reduced-motion` — show static placeholder instead of pulsing

---

## 12. Accessibility Specifications

### Contrast Requirements

| Element Type | Minimum Ratio | Standard |
|:---|:---|:---|
| Normal text (< 18px / < 14px bold) | 4.5:1 | WCAG AA |
| Large text (≥ 18px / ≥ 14px bold) | 3:1 | WCAG AA |
| UI components & graphical objects | 3:1 | WCAG AA |
| Decorative / disabled elements | No minimum | Exempt |

### Verified Contrast Pairs

| Foreground | Background | Ratio | Pass |
|:---|:---|:---|:---|
| `neutral-900` on `neutral-0` | `#0F172A` / `#FFFFFF` | 15.4:1 | AA/AAA |
| `neutral-600` on `neutral-0` | `#475569` / `#FFFFFF` | 6.0:1 | AA |
| `neutral-400` on `neutral-0` | `#94A3B8` / `#FFFFFF` | 2.6:1 | Decorative/disabled only |
| `brand-primary-500` on `neutral-0` | `#0356FF` / `#FFFFFF` | 5.6:1 | AA |
| `brand-secondary-900` on `brand-secondary-100` | `#005B45` / `#D1FFED` | 7.5:1 | AA/AAA |
| `brand-tertiary-700` on `tertiary-50` | `#BA4C27` / `#FFF4F0` | 5.8:1 | AA |
| `success-700` on `success-50` | `#15803D` / `#F0FDF4` | 6.2:1 | AA |
| `danger-700` on `danger-50` | `#9F1239` / `#FFF1F2` | 7.3:1 | AA/AAA |
| `warning-700` on `warning-50` | `#B45309` / `#FFFBEB` | 4.84:1 | AA |
| `info-700` on `info-50` | `#0E7490` / `#ECFEFF` | 5.15:1 | AA |
| `brand-primary-800` on `brand-primary-100` | `#003071` / `#D6E7FF` | 10.1:1 | AA/AAA |
| `brand-primary-700` on `brand-primary-50` | `#003F92` / `#EBF3FF` | 8.8:1 | AA/AAA |

### Brand Color Accessibility Constraints

| Color | Contrast on White | Safe Usage |
|:---|:---|:---|
| `brand-secondary-500` (`#00FFC2`) | ~1.6:1 | **Decorative only** — never as text or meaningful UI |
| `brand-tertiary-500` (`#FF7C4C`) | ~3.3:1 | Large text and UI components only |
| `brand-primary-500` (`#0356FF`) | ~5.6:1 | All text sizes |

### Focus Indicators

| Property | Value |
|:---|:---|
| Style | 2px solid `color-focus-ring` (`brand-primary-500`) |
| Offset | 2px (outside the element) |
| Radius | Matches element's border-radius |
| Visibility | Visible on `:focus-visible` only (not on click) |

### Touch Targets

- **Minimum:** 44×44px for all interactive elements (WCAG 2.5.5)
- If visual element is smaller, extend tap area with padding or `::after`
- Space between adjacent touch targets: minimum `space-2` (8px)

### Reduced Motion

When `prefers-reduced-motion: reduce` is active:
- Disable all transitions and animations
- Replace skeleton pulse with static placeholder
- Replace page transitions with instant swap
- Keep focus ring transitions (essential for accessibility)

### Color-Blind Safety

- **Never** use color alone to convey status — always pair with icon, text label, or pattern
- All status chips include both color background and descriptive icon
- Charts and data visualizations must use patterns or labels in addition to color

---

## 13. Do's and Don'ts

### Do

- **Do** use asymmetrical layouts to break the grid
- **Do** use functional colors for status — never brand colors
- **Do** prioritize `color-bg-card` for main content to keep the app feeling airy
- **Do** use semantic color tokens in implementation — never raw hex values
- **Do** test all text/background combinations against WCAG AA contrast
- **Do** include focus styles for every interactive element

### Don't

- **Don't** use 1px dividers — use `space-6` padding and background shifts instead
- **Don't** use pure black (`#000000`) for text — always use `color-text-primary` or lighter
- **Don't** use sharp corners — minimum `radius-md` (8px) on all interactive elements
- **Don't** introduce Dark Mode — this system is light-only by design
- **Don't** use color alone to communicate status — always pair with icon or text
- **Don't** animate layout properties — use `transform` and `opacity` only
- **Don't** set font sizes below `caption` (11px) in production UI
- **Don't** use `brand-secondary-500` for text on white backgrounds — it fails contrast

---

## 14. Icon System

**Icon set:** Lucide Icons (https://lucide.dev)

| Property | Value |
|:---|:---|
| Style | Outlined, 1.5px stroke weight |
| Caps | Round |
| Corners | Round (matches `radius-md` philosophy) |
| Color | Inherits `currentColor` from parent text context |

### Size Tokens

| Token | Size | Usage |
|:---|:---|:---|
| `icon-xs` | 16px | Inline with body text, chip icons |
| `icon-sm` | 20px | Default UI icons, button icons |
| `icon-md` | 24px | Navigation icons, card actions |
| `icon-lg` | 32px | Empty states, feature highlights |

### Status Chip Icon Mapping

| Status | Lucide Icon Name |
|:---|:---|
| 접수중 (Active) | `check-circle` |
| 접수예정 (Upcoming) | `calendar` |
| 발표대기 (Pending) | `clock` |
| 발표일 (Result Today) | `file-check` |
| 청약완료 (Closed) | `archive` |

### Rules

- Use outlined style exclusively. Filled icons ONLY for active navigation state
- Never mix icon styles (outlined + filled) in the same context
- All icons must have accessible labels (`aria-label` or adjacent text)
- Decorative icons use `aria-hidden="true"`

---

## 15. Color Application Patterns

Beyond the token scales, these patterns define HOW brand colors are applied to create atmosphere and personality. Apply these primarily on **Editorial tier** pages.

### Hero Gradient Mesh (Home Dashboard)

Subtle radial gradients on the hero section create atmospheric depth without competing with content:

```css
.hero-section {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(3,86,255,0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(0,255,194,0.04) 0%, transparent 50%),
    var(--color-bg-page);
}
```

### Section Heading Decorator (Editorial tier only)

A small gradient bar above section headings adds branded visual hierarchy:

```css
.section-decorator::before {
  content: '';
  display: block;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, var(--brand-primary-500), var(--brand-secondary-500));
  margin-bottom: var(--space-4);
  border-radius: var(--radius-full);
}
```

Use on Home Dashboard and News pages only. Not on Subscription Listing/Detail.

### 인기 (Trending) Badge

For high-competition subscriptions, use tertiary-tinted badges:

```css
.badge-trending {
  background: var(--brand-tertiary-50);
  color: var(--brand-tertiary-700); /* 5.8:1 contrast — AA pass */
}
```

### Mint Save Indicator

When a user saves/bookmarks a subscription, a small mint tag appears on the card:

```css
.card--saved::after {
  content: '저장됨';
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  background: var(--brand-secondary-50);
  color: var(--brand-secondary-700);
  font: var(--label-md);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
}
```

This creates a visual system where the mint tag = "my selections." Combined with a share button (Web Share API) as the primary save mechanism. **No borders on cards** — use tag/chip elements for status and state.

### News Hero Card (Text-on-Image)

For the featured news card only, headline overlays the image with a gradient scrim:

```css
.news-hero__scrim {
  background: linear-gradient(transparent 30%, rgba(15,23,42,0.8) 100%);
}
.news-hero__headline {
  color: var(--neutral-0); /* white text on dark scrim */
  font-weight: 700;
}
```

Scrim minimum opacity: **80%** to guarantee WCAG AA contrast on all image types. Regular news cards use standard layout (image above, text below).

### Photography Treatment

Listing and news images receive a subtle editorial grade:

```css
.editorial-image {
  filter: saturate(0.9) contrast(1.05);
}
```

### Data Visualization Style

Charts and graphs use the brand triad for visual consistency:

| Data series | Color |
|:---|:---|
| Primary series | `brand-primary-500` |
| Secondary series | `brand-secondary-600` |
| Tertiary series | `brand-tertiary-500` |
| Additional series | `neutral-400`, `neutral-600` |

- Line charts: 2px stroke, rounded caps
- Bar charts: `radius-sm` (4px) corners
- All charts include text labels — never rely on color alone

---

## 16. Visual Atmosphere

### Noise Grain (Editorial tier only)

A subtle noise texture overlay on hero sections and feature areas adds a "premium print" feeling:

- Opacity: 3–5%
- Applied via CSS pseudo-element or SVG filter
- Disabled under `@media (prefers-contrast: more)`
- Scoped to hero sections and editorial feature areas only — never on data-dense pages

### Full-Bleed Moments (Editorial tier only)

Hero sections and featured content can break out of the 1200px `max-width` constraint for full-viewport-width impact. This creates visual rhythm (constrained → full → constrained) as users scroll.

Apply to:
- Home Dashboard hero section
- News article hero images
- Map views (if implemented)

Never on:
- Subscription Listing cards
- Subscription Detail content
- Data tables

---

## 17. Brand Assets

| File | Purpose | Usage |
|:---|:---|:---|
| `logo.svg` | Official brand logo | Header, footer, splash screen, favicon |
| `placeholder.svg` | Image placeholder | Fallback for unavailable/loading images |

- **Do not** create alternative logo files or inline SVG duplicates — reference `logo.svg` directly
- **Do not** rasterize the logo unless a platform constraint requires it
- Use `placeholder.svg` as the single source of truth for empty-state imagery
