import type { ScrapedJob } from "./types.js";

/** Design tokens from design-guide: accent #DDF159, radius 10px, neutrals */
const STYLES = {
  accent: "#DDF159",
  accentHover: "rgba(221, 241, 89, 0.9)",
  bg: "#FFFFFF",
  border: "#EBEBEB",
  text: "#111111",
  muted: "#6b7280",
  radius: "10px",
  font: "'DM Sans', system-ui, sans-serif",
};

const CONTAINER_ID = "applytrack-prompt-root";
const TOAST_DURATION_MS = 2000;

function injectFont(): void {
  if (document.querySelector('link[href*="DM+Sans"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap";
  document.head.appendChild(link);
}

/** Truncate URL for display (show domain + path up to ~40 chars). */
function truncateUrl(url: string, maxLen = 48): string {
  try {
    const u = new URL(url);
    const base = `${u.hostname}${u.pathname}`;
    if (base.length <= maxLen) return base;
    return base.slice(0, maxLen - 3) + "...";
  } catch {
    return url.length > maxLen ? url.slice(0, maxLen - 3) + "..." : url;
  }
}

/** Build "Scraped from page" rows for the prompt (DESIGN: content-first, show what will be saved). */
function buildScrapedSummary(scraped: ScrapedJob): string {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Company", value: scraped.company },
    { label: "Role", value: scraped.role },
  ];
  if (scraped.location) rows.push({ label: "Location", value: scraped.location });
  if (scraped.salaryRange) rows.push({ label: "Salary", value: scraped.salaryRange });
  rows.push({ label: "Job URL", value: truncateUrl(scraped.jobUrl) });

  return rows
    .map(
      (r) =>
        `<div style="display:flex; gap:8px; margin-bottom:4px; font-size:0.8125rem;">
          <span style="color:${STYLES.muted}; flex-shrink:0; min-width:64px;">${escapeHtml(r.label)}</span>
          <span style="color:${STYLES.text}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(r.value)}</span>
        </div>`
    )
    .join("");
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

export function createPromptContainer(
  scraped: ScrapedJob | null,
  onYes: () => void,
  onNo: () => void,
): HTMLElement {
  injectFont();
  const root = document.createElement("div");
  root.id = CONTAINER_ID;
  root.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    z-index: 2147483647; font-family: ${STYLES.font};
    background: ${STYLES.bg}; border: 1.5px solid ${STYLES.border};
    border-radius: ${STYLES.radius}; padding: 20px 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    max-width: 420px; min-width: 320px;
  `;

  const heading =
    scraped != null
      ? "You're applying here. Save to ApplyTrack?"
      : "You're applying here. Save to ApplyTrack?";

  const scrapedSection =
    scraped != null
      ? `<div style="margin:12px 0 16px 0; padding:12px 0; border-top:1px solid ${STYLES.border}; border-bottom:1px solid ${STYLES.border};">
          <p style="margin:0 0 8px 0; font-size:0.75rem; font-weight:600; color:${STYLES.muted}; text-transform:uppercase; letter-spacing:0.04em;">Scraped from page</p>
          ${buildScrapedSummary(scraped)}
        </div>`
      : `<p style="margin:12px 0 16px 0; font-size:0.875rem; color:${STYLES.muted};">
          We couldn't read job details from this page. You can still try to save (we'll use the page title if possible).
        </p>`;

  root.innerHTML = `
    <p style="margin:0; font-size:1rem; font-weight:500; color:${STYLES.text};">
      ${escapeHtml(heading)}
    </p>
    ${scrapedSection}
    <div style="display:flex; gap:8px; justify-content:flex-end;">
      <button id="applytrack-no" type="button" style="
        padding: 8px 16px; border: 1.5px solid ${STYLES.border}; background:${STYLES.bg};
        border-radius:${STYLES.radius}; font:500 0.875rem ${STYLES.font}; color:${STYLES.text};
        cursor:pointer;
      ">No</button>
      <button id="applytrack-yes" type="button" style="
        padding: 8px 18px; background:${STYLES.accent}; color:${STYLES.text};
        border:none; border-radius:${STYLES.radius}; font:500 0.875rem ${STYLES.font};
        cursor:pointer;
      ">Yes, save</button>
    </div>
  `;
  root.querySelector("#applytrack-yes")?.addEventListener("click", onYes);
  root.querySelector("#applytrack-no")?.addEventListener("click", onNo);
  return root;
}

export function showPrompt(root: HTMLElement): void {
  if (document.getElementById(CONTAINER_ID)) return;
  if (document.body) {
    document.body.appendChild(root);
    return;
  }
  setTimeout(() => showPrompt(root), 300);
}

export function hidePrompt(): void {
  const el = document.getElementById(CONTAINER_ID);
  if (el) el.remove();
}

export function showMessage(message: string, isError: boolean): void {
  const existing = document.getElementById(CONTAINER_ID);
  if (existing) existing.remove();
  injectFont();
  const root = document.createElement("div");
  root.id = CONTAINER_ID;
  const color = isError ? "#ef4444" : "#22c55e";
  root.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    z-index: 2147483647; font-family: ${STYLES.font};
    background: ${STYLES.bg}; border: 1.5px solid ${STYLES.border};
    border-radius: ${STYLES.radius}; padding: 16px 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08); color: ${color};
    font-size: 0.875rem; font-weight: 500;
  `;
  root.textContent = message;
  document.body?.appendChild(root);
  setTimeout(() => root.remove(), TOAST_DURATION_MS);
}
