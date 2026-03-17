# ApplyTrack Design Guide

A single source of truth for visual design, components, and patterns used in ApplyTrack. Use this when designing in Paper or implementing in code.

---

## 1. Overview

- **Product:** ApplyTrack — job application tracker (dashboard, Kanban, analytics, application detail).
- **Tone:** Clean, minimal, productive. One strong accent (lime) on a neutral base.
- **Principle:** Restraint and clarity. White space and hierarchy over decoration.

---

## 2. Color Palette

### Brand & primary actions
| Role        | Hex       | Usage |
|------------|-----------|--------|
| **Accent** | `#DDF159` | Primary CTA, active filters, focus rings, progress, key highlights |
| Accent hover | `#DDF159` at 90% opacity | Buttons, interactive states |

Use the accent sparingly — one clear moment per view (e.g. main CTA or active filter).

### Neutrals (light mode)
| Role        | Hex / CSS var      | Usage |
|------------|--------------------|--------|
| Background | `#FFFFFF` / page   | Cards, surfaces |
| Page background | `hsl(var(--background))` | App background (default white) |
| Foreground | `hsl(var(--foreground))` | Primary text (~black) |
| Muted text | `hsl(var(--muted-foreground))` | Secondary text, captions |
| Border     | `#EBEBEB` / `hsl(var(--border))` | Inputs, dividers, card edges |
| Dark button | `#111111` | Primary-style buttons (e.g. "Add application") |

### Status (application pipeline)
| Status     | Hex       | Use for |
|------------|-----------|---------|
| Applied    | `#3b82f6` | Applied count, badges, charts |
| Interview  | `#eab308` | Interview count, badges, charts |
| Offer      | `#22c55e` | Offer count, badges, charts |
| Rejected   | `#ef4444` | Rejected count, badges, charts |
| Neutral/Default | `#6b7280` | Unknown or inactive |

### Semantic
- **Destructive:** `hsl(var(--destructive))` — delete, dangerous actions.
- **Charts:** Use `--chart-1` … `--chart-5` for analytics; keep status colors consistent where status is shown.

---

## 3. Typography

### Font families
- **Primary:** **DM Sans** (headings and body).
- **Fallback:** System Sans-Serif.

Load DM Sans (e.g. Google Fonts) and set as default in CSS.

### Scale and usage
| Element   | Size   | Weight   | Usage |
|----------|--------|----------|--------|
| Page title | 2xl (e.g. 1.5rem) | Semibold | "Applications", "Kanban Board", "Analytics" |
| Card/section title | lg–xl | Semibold | Section headers, drawer title |
| Body / list | base (1rem) | Regular / Medium | Descriptions, list content |
| Labels, meta | sm (0.875rem) | Medium | Dates, salary, resume version, labels |
| Small UI   | xs (0.75rem) | Medium | Badges, pills, column counts |
| Uppercase labels | sm | Semibold, tracking-wide | Kanban column headers, filters |

### Hierarchy
- One clear page title per screen.
- Use weight (semibold vs regular) and size (2xl → base → sm → xs) rather than many colors.
- Muted text only for secondary info; keep body text readable (avoid &lt; 12px for body).

---

## 4. Spacing & layout

### Rhythm
- **Base unit:** 4px; use multiples for consistency (4, 8, 12, 16, 20, 24).
- **Section gap:** 12px between major sections (e.g. header ↔ stats ↔ main content).
- **Layout padding:** 20px around the main layout; 24px inside cards/panels.
- **Inline gaps:** 8px between related elements (icon + label, filter chips); 12px between stat cards or list items.

### Border radius
| Element   | Radius | Notes |
|----------|--------|--------|
| Cards, panels, header | 20px | Main surfaces |
| Buttons, inputs, pills | 10px | Small interactive elements |
| Code/implementation | 9px (`--radius`) | Tailwind default; can align to 10px for parity with design |

### Density
- Header: 56px height; 24px horizontal padding.
- Stat cards: 100px height; 20px vertical, 24px horizontal padding.
- Filter bar: 48px height; inputs ~40px.
- List rows: comfortable tap/click height (e.g. 48px+ for touch).

---

## 5. Components

### Buttons
- **Primary:** Background `#DDF159`, text black, `font-medium`. Hover: 90% opacity. Radius 10px (or `rounded-sm` in code).
- **Secondary / outline:** Border `#EBEBEB`, transparent or white background; same radius.
- **Dark primary (design):** Background `#111111`, text white, padding ~8px vertical, 18px horizontal, radius 10px.
- Size: at least 32px height for primary actions.

### Cards / panels
- Background `#FFFFFF`, radius 20px, padding 24px (20px vertical acceptable).
- No heavy shadows; optional very subtle border or shadow for separation.

### Inputs & search
- Height 40px, radius 10px, padding 12px horizontal.
- Border 1.5px solid `#EBEBEB`; background white.
- Placeholder and helper text: muted color.

### Badges & status pills
- Status colors (see above); text white or dark depending on contrast.
- Radius: pill (e.g. `rounded-full`) or small (e.g. 4px).
- Typography: xs, font-medium.

### Lists (applications, Kanban cards)
- Clear vertical lanes: fixed-width slots for icon/status/actions so columns align across rows.
- Use gap + fixed widths (e.g. `flexShrink: 0`) for icons and trailing actions.

---

## 6. Artboards (Paper reference)

Use these for layout and responsive behavior:

| Artboard | Size    | Purpose |
|----------|---------|---------|
| ApplyTrack — Desktop | 1440×960 | Main dashboard |
| ApplyTrack — Mobile | 390×844  | Mobile dashboard |
| Add Application Modal — Desktop | 1440×960 | Add flow |
| Add Application Modal — Mobile | 390×844  | Add flow mobile |
| Kanban Board — Desktop | 1440×960 | Kanban view |
| Kanban Board — Mobile | 390×844  | Kanban mobile |
| Analytics — Desktop | 1440×960 | Analytics |
| Analytics — Mobile | 390×960  | Analytics mobile |
| Application Detail Drawer — Desktop | 1440×960 | Detail drawer |
| Application Detail Drawer — Mobile | 390×960  | Detail drawer mobile |

---

## 7. Implementation notes

- **CSS variables:** `src/index.css` defines `--background`, `--foreground`, `--radius`, etc. Prefer these for theming and dark mode.
- **Tailwind:** `tailwind.config.js` maps these variables to `background`, `foreground`, `primary`, `muted`, `border`, `destructive`, `chart-*`. Use semantic names (e.g. `bg-primary`, `text-muted-foreground`) instead of raw hex where possible.
- **Accent in code:** The lime accent is currently `#DDF159` in components (Header, FilterBar, ApplicationForm, Dashboard, KanbanColumn, ApplicationDetailDrawer). Consider a single token (e.g. `--accent` or Tailwind `accent`) for consistency and future theming.
- **Status colors:** Defined in `src/pages/Analytics.jsx`; reuse the same map for badges and Kanban so status color is consistent everywhere.

---

## 8. Checklist for new UI

- [ ] One clear accent moment per view.
- [ ] Text hierarchy (title → body → caption) with size and weight.
- [ ] Spacing: 12px section gap, 24px card padding, 8px inline gap.
- [ ] Radius: 20px surfaces, 10px controls.
- [ ] Vertical alignment in lists (fixed-width slots for icons/actions).
- [ ] Status colors from palette; no new ad-hoc colors.
- [ ] DM Sans (or fallback) for all text.

---

*Last synced with Paper artboards and `src` implementation. Update this guide when the design system or tokens change.*
