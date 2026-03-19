# Paper — Structure & Placement

Single reference for **layout structure** and **placement** of the ApplyTrack desktop UI. Use with `docs/design-guide.md` (visual tokens, typography, components) and `docs/Engineers/DESIGN.md` (design principles).

---

## 1. Desktop artboard

| Artboard | Dimensions | Use |
|----------|------------|-----|
| ApplyTrack — Desktop | 1440×960 | Main dashboard, default layout |
| Kanban Board — Desktop | 1440×960 | Kanban view |
| Analytics — Desktop | 1440×960 | Analytics |
| Application Detail Drawer — Desktop | 1440×960 | Detail drawer overlay |

Content max-width: **1400px** (centered). Layout padding: **20px** around the main content area.

---

## 2. Page structure (vertical order)

1. **Header** — sticky, full width, inside max-width container  
   - Height: **56px**  
   - Horizontal padding: **24px**  
   - Contains: logo, nav (Dashboard | Kanban | Analytics), primary CTA (Add Application)

2. **Section gap** — **12px** between header and next section (and between all major sections).

3. **Stats (Dashboard only)** — status bar  
   - Height: **100px**  
   - Card padding: **20px** vertical, **24px** horizontal  
   - Four cards: Applied, Interview, Offer, Rejected (Offer can use accent treatment).

4. **Section gap** — **12px**.

5. **Filter bar (Dashboard only)**  
   - Container height: **48px**  
   - Inline gap between controls: **8px**  
   - Search + status filter + sort + Export CSV.

6. **Section gap** — **12px**.

7. **Main content**  
   - **Dashboard:** Two-column grid. Left ~2/3 (Recent Applications + Kanban teaser), right ~1/3 (Follow-ups, Offer rate card, Track new role CTA). Column gap: **24px** (e.g. `gap-6`).  
   - **Kanban:** Full-width column area; columns share horizontal space.  
   - **Analytics:** Full-width charts/content.

---

## 3. Placement rules

- **Cards / panels:** radius **20px** (`rounded-card`), padding **24px** (`p-6`). Optional subtle border; no heavy shadows.
- **Section gaps:** **12px** between header ↔ stats ↔ filter ↔ main content (`gap-3` in flex/grid).
- **Inline gaps:** **8px** between related elements (e.g. icon + label, filter chips) (`gap-2`).
- **List rows:** Minimum **48px** tap/click height; use fixed-width slots for icon/status/actions so **vertical lanes** align across rows (see design-guide “Lists”).
- **Grid:** Main content grid gap **24px** (`gap-6`).

---

## 4. Responsive (desktop-first)

- **Desktop (default):** 1440×960 artboard; max-width 1400px, 20px layout padding.
- **Smaller viewports:** Stack stats, collapse filter to fewer controls or row wrap as needed; keep section gaps and card padding proportional (same tokens).

---

## 5. Z-index & overlay

- Header: sticky, `z-10`.  
- Modals/dialogs and Application Detail Drawer: above main content; drawer overlays page.

---

## 6. Token alignment

- Spacing: 4pt base grid (4, 8, 12, 16, 20, 24).  
- Radius: **20px** surfaces (cards, header bar), **10px** controls (buttons, inputs, pills).  
- See `docs/design-guide.md` for color and typography tokens.

---

*Keep this file updated when the desktop layout or section order changes (e.g. new sections or artboard updates from Paper).*
