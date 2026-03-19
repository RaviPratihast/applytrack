/** Payload sent to ApplyTrack POST /api/applications */
export interface ApplicationPayload {
  company: string;
  role: string;
  status?: "applied" | "interview" | "rejected" | "offer";
  appliedDate?: string;
  notes?: string;
  resumeVersion?: string;
  followUpDate?: string | null;
  salaryRange?: string;
  location?: string;
  jobUrl?: string;
  companySize?: string;
}

/** Data scraped from the current page */
export interface ScrapedJob {
  company: string;
  role: string;
  jobUrl: string;
  location?: string;
  salaryRange?: string;
  companySize?: string;
}

export type SaveResult =
  | { ok: true; id: string }
  | { ok: false; error: string };
