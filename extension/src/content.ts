import type { ScrapedJob } from "./types.js";
import { watchUrlChanges } from "./content-url.js";
import { scrapeCurrentPage } from "./scraper.js";
import {
  createPromptContainer,
  showPrompt,
  hidePrompt,
  showMessage,
} from "./content-ui.js";

/**
 * In-memory dedup. Using a Set (not sessionStorage) so it resets on every
 * page refresh / extension reload. This prevents stale dedup entries from
 * blocking the prompt after a code fix + reload — which was the root cause
 * of "popup not showing after rebuild".
 *
 * SPA dedup still works: navigating between jobs within the same tab will not
 * re-show the prompt for a URL already in the Set.
 */
const shownUrls = new Set<string>();

/** Full URL so LinkedIn `currentJobId` and Wellfound `job_listing_slug` each get their own key. */
function getPageKey(): string {
  return window.location.href;
}

function wasPromptAlreadyShown(): boolean {
  return shownUrls.has(getPageKey());
}

function markPromptShown(): void {
  shownUrls.add(getPageKey());
}

function handleYes(scrapedFromPrompt: ScrapedJob | null): void {
  hidePrompt();
  const scraped = scrapedFromPrompt ?? scrapeCurrentPage();
  if (!scraped) {
    showMessage("Could not read job details from this page.", true);
    return;
  }
  chrome.runtime.sendMessage(
    { type: "SAVE_TO_APPLYTRACK", payload: scraped },
    (result: unknown) => {
      if (chrome.runtime.lastError) {
        showMessage(
          "Extension error: " + chrome.runtime.lastError.message,
          true,
        );
        return;
      }
      const r = result as { ok: boolean; error?: string; id?: string };
      if (r?.ok) {
        showMessage("Saved to ApplyTrack.", false);
      } else {
        showMessage(r?.error ?? "Failed to save.", true);
      }
    },
  );
}

function handleNo(): void {
  hidePrompt();
}

/**
 * Wellfound is a Next.js SPA. The prompt should only show on job detail pages,
 * identified by the `job_listing_slug` query param. Generic browsing /
 * search pages should not trigger the prompt.
 */
function isWellfoundJobPage(): boolean {
  try {
    const u = new URL(window.location.href);
    if (!u.hostname.includes("wellfound")) return false;
    // Query param pattern: /jobs?job_listing_slug=3989438-frontend-engineer
    if (u.searchParams.has("job_listing_slug")) return true;
    // Path pattern: /jobs/frontend-engineer-at-company-123  (future URL structure)
    if (/^\/jobs\/[a-z0-9-]+-\d+$/.test(u.pathname)) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Kula ATS career pages follow `careers.kula.ai/{company-slug}/{job-id}`.
 * Only show the prompt on actual job detail URLs (two path segments where the
 * second is a numeric job ID), not on the company root page.
 */
function isKulaJobPage(): boolean {
  try {
    const u = new URL(window.location.href);
    if (u.hostname !== "careers.kula.ai") return false;
    const parts = u.pathname.split("/").filter(Boolean);
    // Expect: ["sarvam-ai", "5843"]
    return parts.length >= 2 && /^\d+$/.test(parts[1]);
  } catch {
    return false;
  }
}

function maybeShowPrompt(): void {
  try {
    if (wasPromptAlreadyShown()) {
      console.log("[ApplyTrack] Prompt already shown for:", getPageKey());
      return;
    }
    if (window.location.hostname.includes("wellfound") && !isWellfoundJobPage()) {
      console.log("[ApplyTrack] Not a Wellfound job detail page, skipping.");
      return;
    }
    if (window.location.hostname === "careers.kula.ai" && !isKulaJobPage()) {
      console.log("[ApplyTrack] Not a Kula job detail page, skipping.");
      return;
    }

    const scraped = scrapeCurrentPage();
    console.log("[ApplyTrack] Scraped:", scraped);

    // Mark as shown BEFORE displaying (dedup on show, per spec).
    markPromptShown();

    const root = createPromptContainer(scraped, () => handleYes(scraped), handleNo);
    showPrompt(root);
    console.log("[ApplyTrack] Prompt shown for:", getPageKey());
  } catch (err) {
    console.error("[ApplyTrack] maybeShowPrompt failed:", err);
  }
}

function schedulePrompt(): void {
  setTimeout(maybeShowPrompt, 800);
}

function onUrlChange(): void {
  hidePrompt();
  schedulePrompt();
}

function init(): void {
  schedulePrompt();
  watchUrlChanges(onUrlChange);
}

function runInit(): void {
  try {
    init();
  } catch (err) {
    console.error("[ApplyTrack] Content script init failed:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runInit);
} else {
  runInit();
}
