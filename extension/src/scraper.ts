import type { ScrapedJob } from "./types.js";
import { JOB_SITE_SELECTORS } from "./constants.js";

// ─── Host key ────────────────────────────────────────────────────────────────

function getHostKey(url: string): string | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("linkedin")) return "linkedin.com";
    if (host.includes("indeed")) return "indeed.com";
    if (host.includes("greenhouse")) return "greenhouse.io";
    if (host.includes("lever")) return "lever.co";
    if (host.includes("workday")) return "workday.com";
    if (host.includes("wellfound")) return "wellfound.com";
    if (host === "careers.kula.ai") return "careers.kula.ai";
    return null;
  } catch {
    return null;
  }
}

// ─── DOM helpers ─────────────────────────────────────────────────────────────

function firstText(selectors: string[]): string {
  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel);
      const text = el?.textContent?.trim();
      if (text) return text;
    } catch {
      // invalid selector — skip
    }
  }
  return "";
}

function firstTextFiltered(
  selectors: string[],
  filter: (t: string) => boolean,
): string {
  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel);
      const text = el?.textContent?.trim();
      if (text && filter(text)) return text;
    } catch {
      // invalid selector — skip
    }
  }
  return "";
}

// ─── Platform guard ───────────────────────────────────────────────────────────

const PLATFORM_NAMES = new Set([
  "wellfound", "angellist", "angel list",
  "linkedin", "indeed", "kula",
]);

function isPlatformName(name: string): boolean {
  const lower = name.trim().toLowerCase();
  return (
    PLATFORM_NAMES.has(lower) ||
    lower.startsWith("wellfound ") ||
    lower.startsWith("linkedin ") ||
    lower.startsWith("indeed ")
  );
}

// ─── JSON-LD (universal — works on Wellfound, Kula, Greenhouse, and many ATS) ──

interface JsonLdJobPosting {
  "@type"?: string;
  title?: string;
  name?: string;
  hiringOrganization?: { name?: string; "@type"?: string };
  recruiter?: { name?: string };
  jobLocation?: JsonLdPlace | JsonLdPlace[];
  baseSalary?: { value?: { minValue?: number; maxValue?: number }; currency?: string };
}

interface JsonLdPlace {
  address?: { addressLocality?: string; addressRegion?: string; addressCountry?: string };
  name?: string;
}

/**
 * Try every `<script type="application/ld+json">` on the page for a JobPosting.
 * This works on any site that ships Schema.org structured data — including
 * Wellfound, Kula, Greenhouse, and many ATS platforms.
 */
function tryJsonLd(): Partial<ScrapedJob> | null {
  try {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of Array.from(scripts)) {
      const raw = script.textContent;
      if (!raw) continue;
      const parsed = JSON.parse(raw) as JsonLdJobPosting | JsonLdJobPosting[];
      const items: JsonLdJobPosting[] = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item["@type"] !== "JobPosting") continue;
        const role = item.title ?? item.name;
        const orgName =
          item.hiringOrganization?.name ?? item.recruiter?.name;
        if (!role || !orgName || isPlatformName(orgName)) continue;

        // Location
        const locs = Array.isArray(item.jobLocation)
          ? item.jobLocation
          : item.jobLocation
            ? [item.jobLocation]
            : [];
        const addr = locs[0]?.address;
        const location =
          addr?.addressLocality ?? addr?.addressRegion ?? locs[0]?.name ?? "";

        // Salary
        const sal = item.baseSalary?.value;
        const cur = item.baseSalary?.currency ?? "$";
        const salaryRange =
          sal?.minValue && sal?.maxValue
            ? `${cur}${sal.minValue} – ${cur}${sal.maxValue}`
            : sal?.minValue
              ? `${cur}${sal.minValue}+`
              : "";

        const cleanLocation =
          location && location.trim() !== role.trim() && location.trim() !== orgName.trim()
            ? location.trim()
            : "";

        return {
          role: role.trim(),
          company: orgName.trim(),
          ...(cleanLocation && { location: cleanLocation }),
          ...(salaryRange && { salaryRange }),
        };
      }
    }
  } catch {
    // malformed JSON-LD — ignore
  }
  return null;
}

// ─── Wellfound __NEXT_DATA__ ──────────────────────────────────────────────────

function getWellfoundJobSlug(): string | null {
  try {
    const v = new URL(window.location.href).searchParams.get("job_listing_slug");
    return v && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

function buildSalaryRange(min: unknown, max: unknown): string {
  const n = (v: unknown): number | null =>
    typeof v === "number" && v > 0 ? v : null;
  const lo = n(min);
  const hi = n(max);
  if (lo !== null && hi !== null) return `$${lo}k – $${hi}k`;
  if (lo !== null) return `$${lo}k+`;
  if (hi !== null) return `Up to $${hi}k`;
  return "";
}

function extractLocation(obj: Record<string, unknown>): string {
  const locs = obj.locationNames ?? obj.locations ?? obj.location_names;
  if (Array.isArray(locs) && locs.length > 0) {
    const first = String(locs[0]).trim();
    if (first.length > 0 && first.length < 80) return first;
  }
  for (const key of ["location", "location_name", "city", "place"] as const) {
    const v = obj[key];
    if (typeof v === "string" && v.trim().length > 0 && v.trim().length < 80) {
      return v.trim();
    }
  }
  return "";
}

function extractFromJobListing(
  listing: Record<string, unknown>,
): Partial<ScrapedJob> | null {
  const role =
    typeof listing.title === "string"
      ? listing.title.trim()
      : typeof listing.name === "string"
        ? listing.name.trim()
        : "";
  if (!role) return null;

  const startup = listing.startup as Record<string, unknown> | undefined;
  const companyObj = listing.company as Record<string, unknown> | undefined;
  const companyName =
    typeof startup?.name === "string"
      ? startup.name.trim()
      : typeof startup?.display_name === "string"
        ? startup.display_name.trim()
        : typeof companyObj?.name === "string"
          ? companyObj.name.trim()
          : "";

  if (!companyName || isPlatformName(companyName)) return null;

  const location = extractLocation(listing);
  const salaryRange = buildSalaryRange(listing.salary_min, listing.salary_max);

  return {
    role,
    company: companyName,
    ...(location && { location }),
    ...(salaryRange && { salaryRange }),
  };
}

function findJobInApollo(
  apollo: Record<string, unknown>,
  currentSlug: string | null,
): Record<string, unknown> | null {
  const candidates: Array<Record<string, unknown>> = [];

  for (const key of Object.keys(apollo)) {
    // Wellfound uses both StartupJob: (legacy) and JobListing: (current)
    if (
      !key.startsWith("JobListing:") &&
      !key.startsWith("Job:") &&
      !key.startsWith("StartupJob:")
    ) continue;
    const obj = apollo[key];
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      candidates.push(obj as Record<string, unknown>);
    }
  }

  if (candidates.length === 0) return null;

  if (currentSlug) {
    const idPrefix = currentSlug.split("-")[0];
    const match = candidates.find(
      (c) =>
        (typeof c.slug === "string" &&
          c.slug.toLowerCase() === currentSlug.toLowerCase()) ||
        String(c.id) === idPrefix,
    );
    if (match) return match;
  }

  return candidates[0];
}

function resolveStartupName(
  apollo: Record<string, unknown>,
  job: Record<string, unknown>,
): string | null {
  const startupField = job.startup as Record<string, unknown> | undefined;
  const companyField = job.company as Record<string, unknown> | undefined;

  const refs = [
    startupField?.__ref,
    companyField?.__ref,
    typeof job.startup_id !== "undefined" ? `Startup:${job.startup_id}` : null,
    typeof job.company_id !== "undefined" ? `Company:${job.company_id}` : null,
  ];

  for (const ref of refs) {
    if (typeof ref !== "string") continue;
    const obj =
      apollo[ref] ??
      apollo[`Startup:${ref}`] ??
      apollo[`Company:${ref}`];
    if (obj && typeof obj === "object") {
      const rec = obj as Record<string, unknown>;
      const n = rec.name ?? rec.display_name;
      if (typeof n === "string" && n.trim() && !isPlatformName(n)) return n.trim();
    }
  }

  // Scan all Startup: / Company: keys as last resort
  for (const key of Object.keys(apollo)) {
    if (!key.startsWith("Startup:") && !key.startsWith("Company:")) continue;
    const obj = apollo[key] as Record<string, unknown> | undefined;
    const n = obj?.name ?? obj?.display_name;
    if (typeof n === "string" && n.trim() && !isPlatformName(n)) return n.trim();
  }

  return null;
}

/**
 * Wellfound embeds job data in `__NEXT_DATA__` (Next.js SSR).
 *
 * IMPORTANT: This only has full job data when the user navigates DIRECTLY to
 * the job URL. For in-app SPA navigation (clicking a job in the list), the
 * `__NEXT_DATA__` was loaded for the jobs-list page and may not contain the
 * clicked job's detail. In that case, JSON-LD and DOM selectors are used as
 * fallbacks.
 *
 * Priority (within __NEXT_DATA__):
 * 1. `props.pageProps.jobListing` — direct object with `startup` sub-object.
 * 2. `props.apolloState.data` — GraphQL cache keyed as `JobListing:ID` /
 *    `StartupJob:ID` (legacy) / `Startup:ID`.
 */
function tryWellfoundNextData(): Partial<ScrapedJob> | null {
  try {
    const script = document.querySelector("script#__NEXT_DATA__");
    const raw = script?.textContent;
    if (!raw) return null;

    const data = JSON.parse(raw) as { props?: Record<string, unknown> };
    const props = data?.props;
    if (!props || typeof props !== "object") return null;

    // Path 1: pageProps.jobListing
    const pageProps = props.pageProps as Record<string, unknown> | undefined;
    const listing = (
      pageProps?.jobListing ??
      pageProps?.job ??
      pageProps?.listing
    ) as Record<string, unknown> | undefined;

    if (listing && typeof listing === "object") {
      const result = extractFromJobListing(listing);
      if (result) return result;
    }

    // Path 2: Apollo cache
    const apolloState = props.apolloState as
      | { data?: Record<string, unknown> }
      | undefined;
    const apollo = apolloState?.data;
    if (!apollo || typeof apollo !== "object") return null;

    const currentSlug = getWellfoundJobSlug();
    const job = findJobInApollo(apollo, currentSlug);
    if (!job) return null;

    const companyName = resolveStartupName(apollo, job);
    if (!companyName || isPlatformName(companyName)) return null;

    const role = typeof job.title === "string" ? job.title.trim() : "";
    if (!role) return null;

    const location = extractLocation(job);
    const salaryRange = buildSalaryRange(job.salary_min, job.salary_max);

    return {
      role,
      company: companyName,
      ...(location && { location }),
      ...(salaryRange && { salaryRange }),
    };
  } catch {
    return null;
  }
}

// ─── Kula ATS ─────────────────────────────────────────────────────────────────

/**
 * Extract company name from a Kula ATS URL.
 * Pattern: `careers.kula.ai/{company-slug}/{job-id}`
 * e.g. "sarvam-ai" → "Sarvam AI", "frequency-cx" → "Frequency Cx"
 */
function kulaCompanyFromUrl(): string {
  try {
    const parts = new URL(window.location.href).pathname.split("/").filter(Boolean);
    if (parts.length < 1) return "";
    const slug = parts[0];
    // Humanize: split by "-", capitalise each word
    return slug
      .split("-")
      .map((w) => {
        // Common acronyms that should stay uppercase
        if (["ai", "cx", "hr", "api", "uk", "us", "ux", "ui"].includes(w.toLowerCase())) {
          return w.toUpperCase();
        }
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(" ");
  } catch {
    return "";
  }
}

// ─── Title fallback ───────────────────────────────────────────────────────────

/**
 * Parse `document.title` as a last resort.
 *
 * Patterns handled:
 * - "Frontend Engineer at Frequency.cx | Wellfound" (Wellfound/Greenhouse)
 * - "Frontend Engineer, API Platform | Sarvam AI" (Kula, generic)
 * - "Frontend Developer - Google" (generic)
 */
function parseTitleFallback(hostKey: string | null): {
  company?: string;
  role?: string;
} {
  const title = document.title?.trim();
  if (!title) return {};

  // Strip trailing " | <platform>" or " - <platform>" where platform is known
  const platformSuffixes = [" | Wellfound", " | AngelList", " | Kula", " | LinkedIn", " | Indeed"];
  let main = title;
  for (const suffix of platformSuffixes) {
    if (main.endsWith(suffix)) {
      main = main.slice(0, -suffix.length).trim();
      break;
    }
  }
  // Generic: strip last " | ..." segment
  const pipe = main.lastIndexOf(" | ");
  if (pipe > 0) {
    const afterPipe = main.slice(pipe + 3).trim();
    if (!isPlatformName(afterPipe) && afterPipe.length > 0 && afterPipe.length < 50) {
      // "Role | Company" pattern
      const role = main.slice(0, pipe).trim();
      if (role && afterPipe && !isPlatformName(afterPipe)) {
        return { role, company: afterPipe };
      }
    } else {
      // The segment after | is a platform — drop it and re-check
      main = main.slice(0, pipe).trim();
    }
  }

  // "Role at Company" pattern (Wellfound, Greenhouse, Lever)
  const atIdx = main.toLowerCase().indexOf(" at ");
  if (atIdx > 0) {
    const role = main.slice(0, atIdx).trim();
    const company = main.slice(atIdx + 4).trim();
    if (role && company && !isPlatformName(company)) return { role, company };
  }

  // Fallback: split by any separator and take last part as company
  const parts = main.split(/\s*[\-–—]\s*/).filter(Boolean);
  if (parts.length >= 2) {
    const company = parts[parts.length - 1];
    if (!isPlatformName(company)) {
      return { role: parts.slice(0, -1).join(" – "), company };
    }
  }

  if (parts.length === 1 && hostKey !== "wellfound.com") {
    return { role: parts[0] };
  }

  return {};
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Scrape job details from the current page.
 *
 * Extraction order (most reliable → least reliable):
 * 1. Site-specific extraction (LinkedIn selectors, Wellfound __NEXT_DATA__, Kula URL, etc.)
 * 2. JSON-LD `<script type="application/ld+json">` — universal, works on many ATS platforms
 * 3. Generic DOM selectors (role: h1/h2, company: from site-specific logic)
 * 4. `document.title` parsing
 *
 * Returns null only if company + role cannot be determined.
 */
export function scrapeCurrentPage(): ScrapedJob | null {
  const url = window.location.href;
  const hostKey = getHostKey(url);
  let role = "";
  let company = "";
  let location = "";
  let salaryRange = "";

  // ── 1. Site-specific extraction ────────────────────────────────────────────

  if (hostKey === "wellfound.com") {
    // __NEXT_DATA__ (only reliable for direct navigation, not SPA clicks)
    const nextData = tryWellfoundNextData();
    if (nextData) {
      role = nextData.role ?? "";
      company = nextData.company ?? "";
      location = nextData.location ?? "";
      salaryRange = nextData.salaryRange ?? "";
    }
    // If __NEXT_DATA__ worked, DOM fallback below is skipped by the !role/!company guards.
    // If __NEXT_DATA__ returned nothing (SPA navigation), fall through to JSON-LD + DOM.
  } else if (hostKey === "careers.kula.ai") {
    // Company from URL slug (most reliable signal on Kula)
    company = kulaCompanyFromUrl();
  } else if (hostKey && JOB_SITE_SELECTORS[hostKey]) {
    const s = JOB_SITE_SELECTORS[hostKey];
    role = firstText(s.role);
    company = firstText(s.company);
    if (s.location) location = firstText(s.location);
    if (s.salary) salaryRange = firstText(s.salary);
  }

  // ── 2. JSON-LD (universal — fills any gaps left above) ────────────────────

  if (!role || !company) {
    const ld = tryJsonLd();
    if (ld) {
      if (!role && ld.role) role = ld.role;
      if (!company && ld.company) company = ld.company;
      if (!location && ld.location) location = ld.location;
      if (!salaryRange && ld.salaryRange) salaryRange = ld.salaryRange;
    }
  }

  // ── 3. DOM selectors (site-specific, after JSON-LD) ───────────────────────

  if ((!role || !company) && hostKey && JOB_SITE_SELECTORS[hostKey]) {
    const s = JOB_SITE_SELECTORS[hostKey];
    if (!role) {
      role = firstTextFiltered(
        s.role,
        (t) => t.length > 2 && t.length < 120 && !/^search\s+for\s+jobs$/i.test(t),
      );
    }
    if (!company && s.company.length > 0) {
      company = firstTextFiltered(
        s.company,
        (t) => !isPlatformName(t) && t.length > 1 && t.length < 80,
      );
    }
    if (!location && s.location && s.location.length > 0) {
      location = firstTextFiltered(
        s.location,
        (t) => t.length < 80 && !/[0-9a-f]{8}-[0-9a-f]{4}/i.test(t),
      );
    }
  }

  // ── 4. Title fallback ──────────────────────────────────────────────────────

  if (!role || !company) {
    const fallback = parseTitleFallback(hostKey);
    if (!role && fallback.role) role = fallback.role;
    if (!company && fallback.company) company = fallback.company;
  }

  // ── Sanitise location ─────────────────────────────────────────────────────
  // Prevent the location field from being contaminated with the role or company
  // text — a known issue when ATS platforms have malformed JSON-LD
  // (e.g. jobLocation.name == job title) or overly broad DOM selectors match
  // the heading element instead of a geographic string.
  const trimmedLocation = location.trim();
  if (
    trimmedLocation &&
    (trimmedLocation === role.trim() ||
      trimmedLocation === company.trim() ||
      // Reject strings that look like job titles: contain no comma and are
      // longer than a typical city/region string (>60 chars is very unusual
      // for a location but common for a role title).
      (trimmedLocation.length > 60 && !trimmedLocation.includes(",")))
  ) {
    location = "";
  }

  // ── Validate ───────────────────────────────────────────────────────────────

  const trimmedCompany = company.trim();
  const trimmedRole = role.trim();

  if (!trimmedCompany || !trimmedRole) return null;
  if (isPlatformName(trimmedCompany)) return null;

  return {
    company: trimmedCompany,
    role: trimmedRole,
    jobUrl: url,
    ...(location && { location: location.trim() }),
    ...(salaryRange && { salaryRange: salaryRange.trim() }),
  };
}
