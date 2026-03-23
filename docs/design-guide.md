# ApplyTrack Design Guide

Single source of truth for **visual design**, **layout**, and **implementation** for ApplyTrack. Use this when designing in **Paper**, building in **React**, or writing specs.

**Related docs**

| Doc | Role |
|-----|------|
| [`docs/Engineers/paper.md`](./Engineers/paper.md) | Desktop **structure & placement** (section order, spacing). |
| [`docs/Engineers/DESIGN.md`](./Engineers/DESIGN.md) | **Design principles**, craft, accessibility, handoff quality. |
| [`docs/Engineers/claude.md`](./Engineers/claude.md) | **Frontend engineering** conventions (Tailwind, resilience, structure). |
| [`docs/PM/PM.md`](./PM/PM.md) | **Product discipline** (clarity, falsifiable bets, execution). |

---

## 1. Paper ↔ product alignment

### 1.1 Live Paper snapshot (MCP `get_basic_info`)

*Last read: **Scratchpad** / **Page 1** — use Paper as the visual reference; this table is the canonical artboard list.*

| Paper artboard id | Name | Size (W×H) | Notes |
|-------------------|------|------------|--------|
| `1-0` | ApplyTrack — Desktop | 1440×960 | Dashboard |
| `48-0` | ApplyTrack — Mobile | 390×844 | Dashboard mobile |
| `6F-0` | Add Application Modal — Desktop | 1440×960 | Add / edit dialog |
| `6G-0` | Add Application Modal — Mobile | 390×844 | Add / edit mobile |
| `AR-0` | Kanban Board — Desktop | 1440×960 | Kanban |
| `AS-0` | Kanban Board — Mobile | 390×844 | Kanban mobile |
| `J1-0` | Analytics — Desktop | 1440×960 | Analytics |
| `J2-0` | Analytics — Mobile | 390×960 | Analytics mobile (taller frame) |
| `QY-0` | Application Detail Drawer — Desktop | 1440×960 | Detail sheet |
| `QZ-0` | Application Detail Drawer — Mobile | 390×960 | Detail sheet mobile |
| `VK-0` | Design Guide — ApplyTrack | 1440×1400 | Tokens / components on canvas |

**Fonts in file:** DM Sans, System Sans-Serif (match `index.html` + `tailwind.config.js`).

### 1.2 Principles we inherit from `DESIGN.md`

- **Clarity over cleverness** — navigation and status must be obvious.
- **Consistency over novelty** — one button style, one card style, one accent rule.
- **Content-first** — stats and lists serve real job data, not decoration.
- **Accessibility** — WCAG AA; focus states; dialogs/sheets need titles + descriptions where Radix expects them.
- **Resilient UI** — loading, empty, and error states are first-class (see `claude.md`).

### 1.3 Product framing from `PM.md` (applies to UX)

- **Clarity is the deliverable** — labels, hierarchy, and flows should not need a meeting to understand.
- **Ship measurable outcomes** — dashboard/Kanban/analytics should support decisions (where am I in the funnel?).

---

## 2. Brand & tone

- **Product:** Job application tracker (dashboard, Kanban, analytics, detail drawer, add/edit).
- **Tone:** Calm, minimal, productive. **One** strong accent moment per view (lime).
- **Elevation:** Light borders, no heavy shadows unless overlay (drawer/modal).

---

## 3. Color palette

### 3.1 Brand & actions

| Role | Hex / token | Usage |
|------|-------------|--------|
| **Accent** | `#DDF159` / `--app-accent` | Primary CTA, active nav, key highlights |
| Accent hover | ~90% opacity | Hover on accent buttons |
| **Dark CTA** | `#111111` / `--app-dark` | “Add Application”, Export CSV |
| **Border** | `#EBEBEB` / `--app-border` | Cards, inputs, header |

### 3.2 Neutrals (light)

| Role | Implementation |
|------|----------------|
| Page shell | `hsl(var(--background))` — subtle off-white acceptable (`bg-muted/25` on `.app`) for card contrast |
| Surfaces / cards | White `#FFFFFF` / `bg-card` |
| Text | `text-foreground`, secondary `text-muted-foreground` |

### 3.3 Status (pipeline)

| Status | Hex | Usage |
|--------|-----|--------|
| Applied | `#3b82f6` | Stats, badges, charts |
| Interview | `#eab308` | Idem |
| Offer | `#22c55e` | Idem; **Offer stat card** may use accent fill (Paper) |
| Rejected | `#ef4444` | Idem |
| Default | `#6b7280` | Unknown |

**Rule:** Never rely on color alone — pair with **label** and/or **shape** (badge text, column title).

---

## 4. Typography

- **Family:** **DM Sans** (Google Fonts), fallback `system-ui`, sans-serif.
- **Scale (max ~5 roles per screen):**

| Role | Tailwind / size | Weight |
|------|-----------------|--------|
| Page title | `text-2xl` | `font-semibold` |
| Section / card title | `text-lg`–`text-xl` | `font-semibold` |
| Body | `text-sm`–`text-base` | normal / `font-medium` |
| Meta / labels | `text-xs`–`text-sm` | `font-medium`, `text-muted-foreground` |
| Column / filter labels | `text-sm` `uppercase` `tracking-wide` | `font-semibold` |

---

## 5. Spacing, radius, layout

### 5.1 Grid

- **Base unit:** 4px — use `4, 8, 12, 16, 20, 24`.
- **Section gap:** `12px` (`gap-3`) between header → stats → filter → main.
- **Page gutter:** `20px` (`px-5`) horizontal; align with Paper.
- **Content max width:** `1400px` (`max-w-[1400px] mx-auto`).
- **Main grid (dashboard):** two columns ~2/3 + ~1/3, `gap-6` (24px).

### 5.2 Radius

| Tier | px | Tailwind |
|------|-----|----------|
| Surfaces (cards, header) | 20 | `rounded-card` |
| Controls | 10 | `rounded-[10px]` / `--radius` |

### 5.3 Density

| Block | Spec |
|-------|------|
| Header bar | ~56px height desktop; wrap/stack on narrow mobile |
| Stat cards | ~100px height desktop; **2×2 grid** on small mobile |
| Filter bar | ~48px min height desktop; **stack** controls on mobile |
| List rows | min **48px** tap target |

---

## 6. Screens (desktop vs mobile)

### 6.1 Desktop (1440 reference)

1. **Sticky header** — logo, **Dashboard | Kanban | Analytics**, **Add Application** (dark). `z-10`.
2. **Dashboard:** Status bar (4 cards) → Filter bar → main grid (recent list + sidebar: follow-ups, metrics, CTA).
3. **Kanban:** Four columns, equal visual weight; cards white, column tint borders.
4. **Analytics:** Summary row + charts + funnel; cards `rounded-card` + border.
5. **Detail drawer:** Right sheet, max width ~`lg`, scroll body, timeline + notes.

### 6.2 Mobile (390×844 / 390×960 reference)

| Area | Behavior |
|------|----------|
| Header | **Stack**: logo + compact Add on first row; **nav** full-width **horizontal scroll** OR second row; avoid clipping. |
| Stats | **2 columns × 2 rows**; slightly reduced vertical padding if needed. |
| Filters | **Vertical stack**: search full width; status + sort row; Export full width. |
| Dashboard grid | **Single column**; same section order as desktop. |
| Kanban | **Horizontal scroll** columns (`snap-x`, fixed min column width) so behavior matches narrow Paper frames. |
| Analytics | Charts **stack**; summary cards **2-wide** then scroll; touch-friendly spacing. |
| Drawer | Full-width sheet; same content order; meta grid can collapse to **one column**. |

---

## 7. Components (checklist)

### Buttons

- **Accent:** `bg-app-accent text-black`, hover opacity.
- **Dark:** `bg-app-dark text-white` — primary global actions (Add, Export).
- **Ghost / outline:** for secondary in-card actions (View, Edit).

### Cards & panels

- White surface, `border-app-border`, `rounded-card`, padding `p-6` (or `px-6 py-5` for dense rows).

### Inputs

- Height ~40px, `rounded-[10px]`, border `1.5px` `app-border`.

### Dialogs (Add / Edit)

- `DialogTitle` + **`DialogDescription`** (can be brief) for Radix a11y.
- Form uses same field order as Paper modal artboards.

### Sheet (detail)

- `SheetTitle` + `SheetDescription`; scroll long content; close control visible.

### Lists & Kanban

- **Vertical lanes** for icons/status/date in list rows (dashboard recent list).
- Kanban cards: company **bold**, role muted, date **xs** muted — use **date-only helpers** (`src/lib/dates.js`) to avoid timezone off-by-one.

---

## 8. Implementation map (`src/`)

| Area | Files |
|------|--------|
| Tokens / base | `src/index.css`, `tailwind.config.js` |
| Shell | `src/App.jsx` |
| Header / add flow | `src/components/Header.jsx`, `ApplicationForm.jsx` |
| Dashboard | `src/pages/Dashboard.jsx`, `StatusBar.jsx`, `FilterBar.jsx`, `ApplicationCard.jsx` |
| Kanban | `src/pages/KanbanBoard.jsx` |
| Analytics | `src/pages/Analytics.jsx` |
| Detail | `src/components/ApplicationDetailDrawer.jsx`, `src/components/ui/sheet.jsx` |
| Dates | `src/lib/dates.js` |

---

## 9. Checklist for new UI

- [ ] Matches **Paper** artboard for that breakpoint (desktop + mobile).
- [ ] Uses **tokens** (`app-accent`, `app-border`, `rounded-card`) — no one-off hex unless status chart colors.
- [ ] **Section gaps** `gap-3`, main grids `gap-6`.
- [ ] **Touch targets** ≥ 48px where tappable.
- [ ] **Loading / empty / error** states (per `DESIGN.md` + `claude.md`).
- [ ] **WCAG:** contrast, focus ring, dialog/sheet description.
- [ ] **Date-only** fields use `parseDateOnlyLocal` / format helpers — no raw `new Date('YYYY-MM-DD')` for display.

---

*Update this file when Paper artboards or production UI change. For structural placement only, see `docs/Engineers/paper.md`.*
