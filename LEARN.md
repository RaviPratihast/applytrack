# 30 Concepts You Can Learn From This Codebase

Concepts demonstrated in ApplyTrack, with where they appear and why they matter.

---

## React fundamentals

1. **Functional components** — The app is built entirely with function components (no class components). See `App.jsx`, `Dashboard.jsx`, `Header.jsx`, `ApplicationForm.jsx`, `ApplicationCard.jsx`.

2. **useState** — Local UI state (applications list, form fields, dialog open/closed, editing item). Used for everything that can change on the client.

3. **useEffect** — Used only for side effects (e.g. syncing `applications` to localStorage in `App.jsx`). No “setState in effect” anti-pattern; state is derived or initialized lazily where possible.

4. **Lazy initial state** — `useState(() => { ... })` in `App.jsx` (load from localStorage once) and `ApplicationForm.jsx` (prefill from `initialData`). Avoids an extra effect and a redundant render.

5. **Controlled components** — All form inputs are controlled: `value={company}` + `onChange={(e) => setCompany(e.target.value)}`. Single source of truth in React state.

6. **Lifting state up** — `applications` and `editingApplication` live in `App.jsx` and are passed down so Header and Dashboard stay in sync. Add/update/delete handlers live in the same place.

7. **Props and callback props** — Parent passes data and handlers (e.g. `onDeleteApplication`, `onEditApplication`, `onAddApplication`). Children stay presentational and call these callbacks.

8. **Key for list identity** — `key={application.id}` in the applications list and `key={editingApplication?.id ?? "new"}` on the form so React remounts correctly when switching add vs edit.

---

## Data and state design

9. **Data model first** — `src/types/application.js` defines `APPLICATION_STATUS` and `createApplication()` before UI. Same shape is used for display, forms, and localStorage.

10. **Immutability** — Updates use new arrays/objects: `[...prev, newApplication]`, `prev.map(...)`, `prev.filter(...)`. No in-place mutation of state.

11. **Single source of truth** — One `applications` array in App; localStorage is a side effect of that state, not a second source.

12. **Unique IDs** — `crypto.randomUUID()` in `createApplication()` so each application has a stable id for keys, updates, and deletes.

13. **Derived state** — Dialog `open` in Header is derived: `open = openByTrigger || !!editingApplication`. No effect needed to “sync” editing to open.

---

## Forms and validation

14. **Form validation without a library** — Simple rule: `isFormValid = company.trim() !== "" && role.trim() !== ""`. Save button disabled and submit guard (`if (!isFormValid) return`) so invalid data never reaches the handler.

15. **Submit guard** — Even if the form is submitted (e.g. Enter key), `handleSubmit` returns early when invalid. Prevents bypassing the disabled button.

16. **Disabled button UX** — Save button uses `disabled={!isFormValid}` and explicit disabled styling (e.g. `opacity-50`, `cursor-not-allowed`) so the state is visible.

---

## Persistence and side effects

17. **localStorage** — Load once in lazy `useState`; write in a `useEffect` that depends on `applications`. Keeps persistence as a side effect, not mixed with business logic.

18. **Effect for sync only** — The only “setState in effect”–style logic was removed; the remaining effect only writes to localStorage when state changes. Reads happen at initialization.

---

## Component and UI patterns

19. **Composition** — Header composes Dialog, DialogTrigger, DialogContent, ApplicationForm. Dashboard composes a grid of ApplicationCard. Small, focused components composed in pages/layout.

20. **Presentational vs container** — Dashboard/ApplicationCard are mostly presentational; App is the container that holds state and handlers and passes them down.

21. **Reusable UI primitives** — Button, Card, Input, Select, Dialog, Badge in `components/ui/` are generic and styled with Tailwind. Used across the app for consistent look and behavior.

22. **Accessible primitives (Radix)** — Dialog and Select use Radix UI for focus trap, keyboard, ARIA. The codebase adds styling and behavior on top instead of building modals/selects from scratch.

23. **Class-based identity** — Semantic class names (e.g. `application-form`, `application-card__edit-button`, `header__add-button`) for styling, testing, and debugging without changing behavior.

---

## Styling and design system

24. **Tailwind CSS** — Utility classes for layout, spacing, typography, colors, responsive breakpoints. No separate CSS files for component layout; design lives next to the JSX.

25. **Design tokens** — `--radius`, `--background`, `--foreground`, etc. in `index.css`. Tailwind theme extends with these so borders, colors, and radius stay consistent.

26. **Single accent color** — One accent (`#DDF159`) used for primary actions (Add Application, Save). Rest of the palette is neutral; the accent gives the app a clear identity.

27. **Consistent border radius** — Shared radius via theme (`rounded-sm` = `calc(var(--radius) - 4px)`). Buttons, inputs, cards, and dialogs use the same system.

---

## Project and code organization

28. **File size discipline** — Target &lt; 100 lines, max 120 per file. Led to splitting (e.g. `ApplicationCard.jsx`, `select-parts.jsx`) and a clear rule in `CODE_STYLE.md`.

29. **Path aliases** — `@/` points to `src/` (in Vite and jsconfig). Imports like `@/components/ui/button` and `@/types/application` keep imports short and stable when moving files.

30. **Layered structure** — `types/` for data shape, `lib/` for utilities, `components/ui/` for primitives, `components/` for feature components, `pages/` for route-level views. Clear places for new code.

---

## How to use this list

- **Interviews** — Use it to say what you applied: e.g. “I used lazy initial state to avoid an effect,” “I derived dialog open from editing state,” “validation is a single boolean and a submit guard.”
- **Learning** — Pick a concept, search the repo for it, and trace how it’s used end-to-end.
- **Portfolio** — In your README or case study, you can say: “This project demonstrates [pick 5–10 concepts] in a production-style React SPA.”
