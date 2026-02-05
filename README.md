# ApplyTrack

A focused job-application tracker: one place to log roles, status, and notes so you can spend less time in spreadsheets and more time preparing for interviews.

---

## Why this project?

- **Real use case** — Tracks company, role, status (Applied → Interview → Rejected / Offer), and notes. Data stays in the browser (localStorage) so there’s no backend or sign-up.
- **Deliberate scope** — Built step-by-step: data model first, then CRUD, then UX (confirm delete, empty state, disabled save when required fields are empty). Good for talking through tradeoffs in interviews.
- **Modern stack** — React 19, Vite 7, Tailwind CSS, shadcn/ui (Radix). Single accent color (`#DDF159`) for a clear visual identity.

---

## Features

- **CRUD** — Add, edit, and delete applications with delete confirmation.
- **Persistence** — All data in localStorage; survives refresh.
- **Form UX** — Save disabled until Company and Role are filled; Enter key doesn’t submit when invalid.
- **Empty state** — Clear copy and a hint to use “Add Application” when there are no entries.
- **Layout** — Header and content aligned; responsive card grid; centered empty state.

---

## Tech stack

| Area        | Choice           | Why                                      |
|------------|-------------------|------------------------------------------|
| Framework  | React 19          | Current React, hooks, component model   |
| Build      | Vite 7            | Fast dev server and production builds   |
| Styling    | Tailwind CSS      | Utility-first, design tokens, responsive |
| Components | shadcn/ui (Radix) | Accessible primitives, unstyled + custom UI |
| State      | React (useState)  | Local state + localStorage; no global store for this scope |

---

## Run the project

```bash
# Install
pnpm install

# Dev
pnpm dev

# Build
pnpm build

# Preview production build
pnpm preview

# Lint
pnpm lint
```

---

## Project structure (high level)

```
src/
  App.jsx              # Root: apps state, localStorage load/save, add/update/delete handlers
  main.jsx
  pages/
    Dashboard.jsx      # List or empty state; uses ApplicationCard
  components/
    Header.jsx         # Title + Add Application (opens dialog)
    ApplicationForm.jsx# Add/Edit form; validation, submit guard
    ApplicationCard.jsx# One card: company, role, status, date, notes, Edit/Delete
    ui/                # shadcn-style components (Button, Card, Dialog, Input, etc.)
  types/
    application.js     # APPLICATION_STATUS, createApplication()
  lib/
    utils.js           # cn() for class names
```

Data flow: **App** holds `applications` and passes down add/update/delete. **Header** owns the dialog and add/edit flow. **Dashboard** renders the list or empty state. **ApplicationCard** and **ApplicationForm** stay presentational + callbacks.

---

## Code style

- **File size** — Aim for &lt; 100 lines per file; hard limit 120. Split into smaller components or modules when you exceed it.  
  See [CODE_STYLE.md](./CODE_STYLE.md).

---

## Positioning (for interviews / portfolio)

- **What** — Small, production-style SPA for tracking job applications with full CRUD and localStorage.
- **How** — React + Vite + Tailwind + shadcn/ui; no backend; intentional UX (validation, confirmations, empty state).
- **Why** — Demonstrates component design, state handling, form behavior, and consistent styling within a single, understandable problem domain.

Use it to walk through: data model first, then UI, then persistence and polish — and to discuss tradeoffs (e.g. localStorage vs backend, when to split components, how you’d add auth or sync later).
