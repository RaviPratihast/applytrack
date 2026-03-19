import type { ApplicationPayload, SaveResult } from "./types.js";
import { APPLICATION_STATUS_APPLIED } from "./constants.js";

function toYYYYMMDD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Build payload for POST /api/applications from scraped data. */
export function toApplicationPayload(scraped: {
  company: string;
  role: string;
  jobUrl: string;
  location?: string;
  salaryRange?: string;
  companySize?: string;
}): ApplicationPayload {
  return {
    company: scraped.company,
    role: scraped.role,
    status: APPLICATION_STATUS_APPLIED,
    appliedDate: toYYYYMMDD(new Date()),
    jobUrl: scraped.jobUrl,
    ...(scraped.location && { location: scraped.location }),
    ...(scraped.salaryRange && { salaryRange: scraped.salaryRange }),
    ...(scraped.companySize && { companySize: scraped.companySize }),
  };
}

/** POST application to ApplyTrack API. Called from background script. */
export async function saveApplication(
  baseUrl: string,
  payload: ApplicationPayload,
): Promise<SaveResult> {
  const url = `${baseUrl.replace(/\/$/, "")}/api/applications`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (data as { error?: string }).error ?? res.statusText;
      return { ok: false, error: msg };
    }
    const id = (data as { id?: string }).id ?? "";
    return { ok: true, id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
