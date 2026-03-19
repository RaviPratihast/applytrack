export const DEFAULT_API_BASE_URL = "http://localhost:3001";
export const APPLICATIONS_ENDPOINT = "/api/applications";
export const STORAGE_KEY_API_BASE_URL = "applytrack_api_base_url";

export const APPLICATION_STATUS_APPLIED = "applied" as const;

/** Selectors and patterns for known job sites (role, company, etc.) */
export const JOB_SITE_SELECTORS: Record<
  string,
  { role: string[]; company: string[]; location?: string[]; salary?: string[] }
> = {
  "linkedin.com": {
    role: [
      ".job-details-jobs-unified-top-card__job-title",
      ".jobs-unified-top-card__job-title",
      "h1.t-24",
    ],
    company: [
      ".job-details-jobs-unified-top-card__company-name",
      ".jobs-unified-top-card__company-name",
      "a[data-tracking-control-name='public_jobs_topcard-org-name']",
    ],
    location: [
      ".job-details-jobs-unified-top-card__bullet",
      ".jobs-unified-top-card__bullet",
    ],
  },
  "indeed.com": {
    role: [
      "h1.jobsearch-JobInfoHeader-title",
      ".jobsearch-JobInfoHeader-title",
    ],
    company: [
      "[data-company-name='true']",
      ".jobsearch-InlineCompanyRating-companyHeader",
    ],
    location: [".jobsearch-JobInfoHeader-subtitle div"],
    salary: [".jobsearch-SalaryAndJobType-salarySection"],
  },
  "greenhouse.io": {
    role: [".app-title", "h1"],
    company: [".company-name", ".company"],
    location: [".location"],
  },
  "lever.co": {
    role: [".posting-headline h2", "h2.posting-headline"],
    company: [".posting-categories a", ".main-header-logo img[alt]"],
    location: [".posting-categories"],
  },
  "workday.com": {
    role: ["h1[data-automation-id='jobPostingHeader']", "h1"],
    company: ["[data-automation-id='jobPostingCompanyName']", ".company-name"],
    location: ["[data-automation-id='locations']"],
  },
  // Wellfound: primary extraction is __NEXT_DATA__ + JSON-LD + title fallback.
  // DOM selectors are kept minimal as a last resort — the job panel shares the
  // page with nav elements, so we scope tightly to [role="dialog"] or main.
  "wellfound.com": {
    role: [
      "[role='dialog'] h2",
      "[role='dialog'] h1",
      "main h1",
      "main h2",
    ],
    company: [
      "[role='dialog'] a[href*='/company/']",
      "main a[href*='/company/']",
    ],
    location: [
      "[role='dialog'] [class*='location' i]",
      "main [class*='location' i]",
    ],
  },
  // Kula ATS: careers.kula.ai/{company-slug}/{job-id}
  // Company is extracted from the URL slug in the scraper; DOM selectors cover title + location.
  // "p" is intentionally excluded — it is too broad and reliably matches the wrong element.
  "careers.kula.ai": {
    role: ["h1", "h2"],
    company: [],   // extracted from URL slug in scraper
    location: [
      "[class*='location' i]",
      "[class*='city' i]",
      "[class*='address' i]",
    ],
  },
};
