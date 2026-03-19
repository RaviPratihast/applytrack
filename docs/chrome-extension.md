# Chrome Extension — Product Engineering Spec

**Feature:** Browser extension to capture job applications directly from job sites
**Status:** In Development (v1)
**Owner:** Product Engineering

---

## 1. Problem Statement

ApplyTrack's value depends on users actually logging their applications. The current flow is:

1. User applies on LinkedIn / Indeed / Greenhouse / Lever / Workday.
2. User opens a separate tab, goes to their ApplyTrack dashboard.
3. User clicks "Add Application", manually types company name, role, URL, location.
4. User submits and goes back to the job site.

**This creates three real problems:**

1. **Context-switch friction** — the user must leave the job site, open the dashboard, and type what they just read. Most skip it.
2. **Data entry errors** — manual typing means typos in company names and roles, breaking grouping and search.
3. **Abandonment** — if the dashboard isn't open, the application never gets logged. The board goes stale immediately.

---

## 2. Goal

Detect when a user is on a job posting page, show a non-intrusive prompt ("You're applying here — save to ApplyTrack?"), scrape all available job metadata from the DOM, and send it to the ApplyTrack backend in one click — without the user leaving the job site.

The user should never have to open the dashboard just to log that they applied somewhere.

**Site-agnostic intent:** The prompt should appear whenever the user is on a page that has a job opportunity and an apply (or equivalent) action — whether that’s LinkedIn, Indeed, a company career page, or any other job site. It does not matter if it’s a dedicated job board or a single company’s careers page; the principle is “job + apply here → offer to save to ApplyTrack.” In v1 we limit this to a **supported site list** (LinkedIn, Indeed, Greenhouse, Lever, Workday, Wellfound) so we can reliably scrape and inject the content script; future versions can expand to more sites or a more generic “any page” detection.

---

## 3. User Stories

| # | As a user I want to... | So that... |
|---|------------------------|------------|
| 1 | See a prompt when I'm on a job posting page | I'm reminded to log the application without having to think about it |
| 2 | Click one button to save the job to ApplyTrack | I can log applications in under 2 seconds |
| 3 | Have the company name, role, URL, location, and salary pre-filled | I don't have to type anything manually |
| 4 | Dismiss the prompt without saving | I can skip jobs I'm not applying to |
| 5 | Not see the same prompt twice for the same job | I'm not annoyed by repeated prompts |
| 6 | Configure the API URL in the extension popup | The extension works with my local or deployed backend |
| 7 | Open my ApplyTrack dashboard directly from the popup | I can review what I've saved without hunting for the tab |

---

## 4. Scope

### In Scope (v1)

- Chrome extension (Manifest V3)
- Content script injection on supported job sites
- Prompt banner: "You're applying here. Save to ApplyTrack?"
- DOM scraping for: `company`, `role`, `jobUrl`, `location`, `salaryRange`
- Single click saves to ApplyTrack via `POST /api/applications`
- Status set to `applied`, `appliedDate` set to today automatically
- Per-page dedup: prompt not shown again for same URL within the session (1 hour window)
- SPA-aware: detects URL changes on single-page apps (LinkedIn, etc.) and re-triggers the prompt
- Popup: configure API URL and Dashboard URL, open dashboard
- Supported sites: LinkedIn, Indeed, Greenhouse, Lever, Workday

### Out of Scope (v1)

- Firefox / Edge / Safari — Chrome only in v1
- Scraping from job emails or PDFs
- Auto-fill job application forms on company career sites
- Editing the scraped data before saving (no inline form — that's the dashboard's job)
- Auth / user accounts — backend is assumed to be single-user or trusted local
- Chrome Web Store publication — developer "Load unpacked" in v1
- Saving from any arbitrary career page (only supported site list)

---

## 5. Supported Job Sites

| Site | URL Pattern | Scraping Notes |
|------|-------------|----------------|
| LinkedIn | `linkedin.com/*` | SPA. Job detail opens in a panel without a page reload. Requires URL change detection. Selectors are subject to LinkedIn DOM changes. |
| Indeed | `*.indeed.com/*` | Server-rendered + React hybrid. Selectors relatively stable. |
| Greenhouse | `*.greenhouse.io/*` | Iframe-based apply forms. Scrape from the job detail page, not the apply iframe. |
| Lever | `*.lever.co/*`, `jobs.lever.co/*` | Clean DOM. Company name inferred from subdomain when selector is absent. |
| Workday | `*.workday.com/*` | Heavy React SPA. Uses `data-automation-id` attributes — preferred over class selectors. |
| Wellfound | `wellfound.com/jobs?job_listing_slug=*` | Next.js; prompt only on job detail URLs. Tries `__NEXT_DATA__` first (match current job by slug, resolve hiring company from job→company; never use platform name "Wellfound" as company). Then DOM selectors scoped to `main` and title fallback ("X at Y \| Wellfound" → company Y). Company/location filtered to avoid nav text and UUIDs. |

---

## 6. Architecture

### High-Level Flow

```
User visits job page (LinkedIn, Indeed, etc.)
         │
         ▼
  [Content Script] (dist/content.js)
         │
         ├── Check: is this a new URL? (SPA-aware interval + popstate)
         │
         ├── Check: was prompt already shown for this URL? (sessionStorage)
         │
         ├── Show prompt banner (content-ui.ts)
         │
         ├── User clicks "Yes, save"
         │
         ├── Scrape DOM → ScrapedJob object (scraper.ts)
         │
         └── sendMessage({ type: "SAVE_TO_APPLYTRACK", payload: ScrapedJob })
                  │
                  ▼
         [Background Service Worker] (dist/background.js)
                  │
                  ├── Read API URL from chrome.storage.local
                  │
                  ├── Build ApplicationPayload (api.ts)
                  │
                  └── POST /api/applications → ApplyTrack Backend
                           │
                           └── Success → sendResponse({ ok: true, id })
                               Failure → sendResponse({ ok: false, error })
                  │
                  ▼
         [Content Script] receives response
                  │
                  ├── Success → show "Saved to ApplyTrack." toast (green, auto-dismiss)
                  └── Failure → show error message toast (red, auto-dismiss)
```

### Extension File Structure

```
extension/
├── manifest.json          # MV3: permissions, content_scripts, background
├── package.json
├── tsconfig.json
├── pnpm-lock.yaml
├── popup/
│   ├── popup.html          # Extension toolbar popup
│   ├── popup.css
│   └── popup.js            # Reads/writes chrome.storage.local for URLs
├── src/
│   ├── types.ts             # ApplicationPayload, ScrapedJob, SaveResult
│   ├── constants.ts         # API base URL, storage keys, per-site CSS selectors
│   ├── scraper.ts           # scrapeCurrentPage() — per-site DOM extraction
│   ├── api.ts               # toApplicationPayload(), saveApplication()
│   ├── background.ts        # Service worker: receives messages, calls API
│   ├── content-ui.ts        # Prompt banner and toast DOM injection
│   └── content.ts           # Entry point: init, URL change detection, orchestration
└── dist/                    # TypeScript build output (gitignored in isolation)
```

### Communication Model

Content scripts cannot make cross-origin requests directly. All API calls go through the background service worker via `chrome.runtime.sendMessage`.

```
content.ts ──sendMessage──► background.ts ──fetch──► localhost:3001
              (payload)                   (POST /api/applications)
           ◄──response────                ◄──JSON────
```

This is required by Chrome's MV3 security model and avoids CORS issues.

---

## 7. Scraping Strategy

### Selector Priority

For each site, selectors are tried in order. The first non-empty text match wins.

If site-specific selectors all return empty, a **title fallback** attempts to parse the browser tab title (e.g. "Frontend Developer at GoodScore | LinkedIn") using a split-on-separator heuristic.

### Robustness Rules

1. Selectors live in a single `JOB_SITE_SELECTORS` constant (`constants.ts`) — updating a broken selector requires one line change and one rebuild.
2. If `company` or `role` cannot be determined after all selectors and fallback — **the scrape fails gracefully**: the prompt shows an error toast ("Could not read job details from this page.") rather than saving an empty or corrupted record.
3. `jobUrl` is always `window.location.href` — never scraped from the DOM.

### SPA Navigation (LinkedIn problem)

LinkedIn, Workday, and Lever are single-page apps. Opening a job listing changes the URL but does NOT trigger a new page load, so a content script that only runs on `document_idle` will not fire on navigation.

**Solution implemented in v1:**
- **Full URL as page key:** Dedup uses `location.href` (not just pathname) so each job view (e.g. LinkedIn `currentJobId`) gets its own key and the prompt can show when the user switches jobs.
- **History API hooks:** `history.pushState` and `history.replaceState` are wrapped so SPA navigations (e.g. clicking a job in the list) trigger the prompt immediately instead of waiting for the interval.
- **Fallbacks:** `popstate` for Back/Forward; interval polling every 1,000ms for any URL change the history hooks might miss.
- **Delay:** 800ms `setTimeout` before showing the prompt so the DOM has time to render job details after navigation.

---

## 8. Prompt & UI Design

Design follows `design-guide.md`:

| Element | Spec |
|---------|------|
| Font | DM Sans (Google Fonts, injected via `<link>`) |
| Accent | `#DDF159` (Yes, save button background) |
| Border | `#EBEBEB` 1.5px |
| Radius | 10px |
| Shadow | `0 4px 20px rgba(0,0,0,0.08)` |
| Position | `fixed`, top: 20px, horizontally centered |
| Z-index | `2147483647` (maximum, avoids being covered by site UI) |

### Prompt Banner

The prompt shows **what will be saved** (scraped from the page) so the user can confirm before saving (content-first, per DESIGN.md). If scraping succeeds, a "Scraped from page" section lists Company, Role, Location, Salary (if present), and Job URL (truncated). If scraping fails, a short message explains that we couldn't read details and they can still try to save (title fallback).

```
┌──────────────────────────────────────────────┐
│  You're applying here. Save to ApplyTrack?   │
│  ─────────────────────────────────────────── │
│  Scraped from page                           │
│  Company    Acme Inc                         │
│  Role       Frontend Engineer                │
│  Location   Bangalore Urban                  │
│  Job URL    wellfound.com/jobs?job_list...   │
│  ─────────────────────────────────────────── │
│                            [ No ]  [ Yes, save ] │
└──────────────────────────────────────────────┘
```

### Toast (post-save)

- **Success:** green text, "Saved to ApplyTrack." — auto-dismisses after 2s.
- **Error:** red text, error message from API or scraper — auto-dismisses after 2s.
- **On URL change:** Any visible toast (or prompt) is cleared immediately when the user navigates to a different job so the new view is not cluttered.

### Dedup Logic

- On prompt show OR dismiss: store `{ [pageKey]: timestamp }` in `sessionStorage`.
- `pageKey` = **full URL** (`location.href`) so each distinct job view gets its own key. On LinkedIn, the job is identified by the query param `currentJobId`; using only pathname would treat all jobs on `/jobs/search-results/` as the same page and the prompt would never show again after the first job.
- Suppressed for 1 hour since first shown per URL.
- `sessionStorage` clears on tab close — user will see the prompt again in a new session.

---

## 9. Backend Contract

The extension calls the existing `POST /api/applications` endpoint — no new backend endpoint required for v1.

### Request

```json
POST http://localhost:3001/api/applications
Content-Type: application/json

{
  "company": "GoodScore",
  "role": "Frontend Developer",
  "status": "applied",
  "appliedDate": "2026-03-17",
  "jobUrl": "https://www.linkedin.com/jobs/...",
  "location": "Bengaluru, Karnataka, India",
  "salaryRange": ""
}
```

### Response (success)

```json
HTTP 201
{ "id": "uuid", "company": "...", "role": "...", ... }
```

### Response (failure)

```json
HTTP 400
{ "error": "company and role are required and must be non-empty" }
```

---

## 10. Configuration (Popup)

Settings stored in `chrome.storage.local`:

| Key | Default | Description |
|-----|---------|-------------|
| `applytrack_api_base_url` | `http://localhost:3001` | ApplyTrack backend URL |
| `applytrack_dashboard_url` | `http://localhost:5173` | ApplyTrack frontend URL |

The popup reads these on open, allows edits, and saves on "Save" click.
"Open dashboard" opens the Dashboard URL in a new tab.

---

## 11. Build & Release

### Development Build

```bash
cd extension
pnpm install
pnpm run build   # type-check (tsc --noEmit) + bundle (esbuild) → dist/content.js, dist/background.js
```

The content script is **bundled into a single file** (`dist/content.js`) so Chrome does not need to load separate modules; this avoids "Failed to load module script" or import errors on job sites. The background script is also bundled into a single ESM file.

### Load in Chrome

1. `chrome://extensions` → **Developer mode** ON
2. **Load unpacked** → select `extension/` folder
3. After any code change: `pnpm run build` → click **Reload (🔄)** on the extension card

### Dependencies

| Package | Purpose |
|---------|---------|
| `typescript` | Type-safe compilation |
| `@types/chrome` | Chrome extension API type definitions |

No runtime dependencies. No bundler (direct `tsc` output) — keeps the build simple and auditable.

---

## 12. Permissions Rationale

| Permission | Why |
|------------|-----|
| `storage` | Store API URL and Dashboard URL in `chrome.storage.local` |
| `activeTab` | Access the current tab's URL and DOM when the extension is active |
| `host_permissions: http://localhost:3001/*` | Allow background service worker to POST to the local API |
| `host_permissions: https://*.linkedin.com/*` etc. | Allow content script injection on job sites |

No `tabs`, no `history`, no `cookies`, no `webRequest`. Minimal attack surface by design.

---

## 13. Known Issues & Limitations (v1)

| Issue | Impact | Status |
|-------|--------|--------|
| LinkedIn selector drift | LinkedIn frequently changes CSS class names. Selectors in `constants.ts` will break and require updating. | Known, no automated check yet |
| SPA navigation delay | ~2.3s delay between URL change and prompt appearance | Acceptable in v1 |
| No edit before save | User cannot correct scraped data before it's saved | By design in v1 — dashboard edit is the correction path |
| No duplicate detection | Saving the same job twice creates two records | Backend does not dedup by `jobUrl` — to be added in v2 |
| Title fallback is fragile | `document.title` format varies widely across sites | Fallback only; accepted risk for unsupported sites |
| Manifest V3 service worker sleep | Service workers unload after ~30s inactivity in MV3. Wakes on message. | No known issue currently, watch for "extension context invalidated" errors |
| ~~Content script module import failure~~ | ~~Chrome sometimes fails to load `./scraper.js` etc. when content script is `type: "module"`~~ | **Resolved:** Content script is bundled into a single `dist/content.js` (IIFE) so no runtime imports. Build uses esbuild; see `extension/build.mjs`. |

---

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| LinkedIn changes their DOM structure | High | High | Selectors are in one constant — single-file fix. Consider a fallback to `document.title`. |
| Backend is down when user clicks "Yes" | Medium | Low | Error toast shown clearly. No data loss — user can save manually via dashboard. |
| Extension injection blocked by CSP | Low | Medium | Using `chrome.scripting` injection model via manifest; CSP applies to inline scripts, not extension content scripts. |
| User on an unsupported job site | Medium | Low | No prompt shown; no degraded experience. Scraper returns null → error toast only if triggered manually. |
| Chrome MV3 deprecates module-type content scripts | Low | High | Monitor Chrome release notes. Can switch to bundled single-file content script if needed. |

---

## 15. Open Questions

- [ ] **Duplicate detection:** Should `POST /api/applications` reject or warn on duplicate `jobUrl`? Currently it creates a second record silently.
- [ ] **Selector maintenance:** Should we add a CI check that validates selectors against a real LinkedIn page snapshot? Or accept manual maintenance?
- [ ] **Chrome Web Store:** When do we publish? Requires a privacy policy, developer fee, and Google review (may take 1–3 weeks).
- [ ] **Auth:** If ApplyTrack adds user accounts, the extension will need a login flow or token storage. Design TBD.
- [ ] **Manual trigger:** Should there be a way to trigger the "Save to ApplyTrack?" prompt manually (e.g. from the popup) for sites not in the supported list?

---

## 16. Acceptance Criteria

- [ ] Extension loads in Chrome without errors via "Load unpacked"
- [ ] On a LinkedIn job posting, the prompt banner appears within 3 seconds of the job detail loading
- [ ] On a LinkedIn SPA navigation (clicking a new job without a page reload), the prompt appears on the new job
- [ ] Clicking "Yes, save" sends a request to `POST /api/applications` with correct `company`, `role`, `jobUrl`
- [ ] A success toast appears and the application is visible in the ApplyTrack dashboard
- [ ] Clicking "No" dismisses the prompt without saving
- [ ] The prompt does not re-appear for the same job URL within the same browser session (1 hour)
- [ ] If scraping fails (no company/role found), an error toast is shown and nothing is saved to the backend
- [ ] If the backend is unreachable, an error toast is shown
- [ ] Popup correctly saves and loads API URL and Dashboard URL from `chrome.storage.local`
- [ ] "Open dashboard" in the popup opens the dashboard URL in a new tab
- [ ] All TypeScript compiles without errors (`pnpm run build` exits 0)

---

## 17. Phased Rollout

| Phase | Scope | Exit Criteria |
|-------|-------|---------------|
| **v1 (current)** | Developer "Load unpacked". Supported sites: LinkedIn, Indeed, Greenhouse, Lever, Workday, **Wellfound**. No auth. | All acceptance criteria above pass. Prompt appears reliably on LinkedIn and Wellfound job detail pages. |
| **v2** | Chrome Web Store publication. Add `jobUrl` dedup in backend. Add more sites (Naukri, AngelList, Y Combinator jobs). Manual trigger from popup. | Published to store. Selector CI check in place. |
| **v3** | Auth integration (if ApplyTrack adds user accounts). Auto-detect "Apply" button click to trigger save. | Token stored in `chrome.storage.local`. Extension works with deployed (non-localhost) backend. |

---

## 18. Troubleshooting & Edge Cases

### The extension does not need to be "started"

There is **no dev server** for the extension. You do **not** run `pnpm run dev` to "start" the extension in the sense of a web app.

- **First-time setup:** Build once (`pnpm run dev` in the extension folder runs `tsc --watch` for rebuild-on-save; or use `pnpm run build`), then **Load unpacked** in `chrome://extensions` and select the `extension` folder. The extension is now active in Chrome.
- **After code changes:** Run `pnpm run build` (or leave `pnpm run dev` running), then go to `chrome://extensions` and click **Reload (🔄)** on the ApplyTrack card. Refresh the job page tab.

**Scripts in `extension/package.json`:**
- `pnpm run build` — compile TypeScript to `dist/`. Run after any change to `src/`.
- `pnpm run dev` — run `tsc --watch` so each save triggers a rebuild; you still need to click Reload in Chrome.
- There is no "start" or "serve" script; the extension runs inside Chrome once loaded.

### Prompt not appearing — checklist

| Check | What to do |
|-------|------------|
| **Extension loaded?** | Open `chrome://extensions`. ApplyTrack should be listed and **Enabled** (toggle on). If not, click **Load unpacked** and select the `extension` folder. |
| **Extension reloaded after build?** | After any `pnpm run build`, click the **Reload** button on the ApplyTrack card, then **refresh the job page tab**. The content script only reinjects on page refresh, not on extension reload alone. |
| **Correct URL?** | Content script runs only on: LinkedIn, Indeed, Greenhouse, Lever, Workday, and Wellfound. For Wellfound specifically, the prompt only shows on job detail pages (`/jobs?job_listing_slug=...`). |
| **Prompt shown this session?** | Dedup is **in-memory** — it resets when you refresh the tab or close and reopen it. If you already saw the prompt in this page session (without refreshing), it won't show again. To see it again: refresh the tab. |
| **Wellfound: not a job detail page?** | On Wellfound, browsing `/jobs` (the search listing) does not show the prompt. Navigate into a specific job posting (`?job_listing_slug=...`). |
| **Content script error?** | Right-click the page → **Inspect** → **Console**. Look for `[ApplyTrack] ...` log lines. `[ApplyTrack] maybeShowPrompt failed:` means a code error — report it. |
| **No `document.body`?** | We retry after 300ms if body is null. Very slow pages may not show the prompt; check Console for errors. |

### Other edge cases

| Edge case | Behavior |
|-----------|----------|
| **Backend not running** | User clicks "Yes, save" → request fails → error toast (e.g. "Failed to fetch"). No data is saved. User can start the backend and try again or add manually in the dashboard. |
| **Scraper finds no company/role** | "Could not read job details from this page." toast. Nothing is sent to the API. |
| **Extension reloaded while tab open** | Next "Yes, save" may fail with "Extension context invalidated". User should refresh the job page so the new content script loads. |
| **LinkedIn DOM changed** | Selectors in `constants.ts` may return empty. Scraper falls back to `document.title`; if that fails, scrape returns null and we show the error toast. Update selectors and rebuild. |
| **Multiple tabs, same job** | Each tab has its own `sessionStorage`. Prompt can show in each tab once per URL. Saving from both tabs creates two application records (no dedup in v1). |
| **CSP or ad-blocker** | Extension content scripts run in an isolated world; page CSP does not block them. Ad-blockers could in theory block our script if they target extension IDs; if so, disable for the job site or add an exception. |

### Verifying the content script is running

1. Open a supported job page (e.g. LinkedIn job).
2. Right-click → **Inspect** → **Console**.
3. If the script loaded, you can type `document.getElementById('applytrack-prompt-root')` — after the prompt shows it should return the banner element. Any `[ApplyTrack]` log or error confirms the script ran.

### Test / develop mode: force prompt to show again

- Dedup is **in-memory** (a `Set` in the content script). It resets automatically on every tab refresh. To see the prompt again: **just refresh the tab** (`F5` / `Cmd+R`). The content script reinjects with an empty dedup Set.
- To test **URL change** behavior: open a job, dismiss the prompt (No or Yes), then click a **different** job in the list. The prompt should appear for the new job because the full URL is different.
- After rebuilding + reloading the extension: **refresh the job tab**. The new content script injects fresh with no dedup history.

---

*This doc is the source of truth for the ApplyTrack Chrome Extension. Update it as decisions are made and known issues are resolved.*
