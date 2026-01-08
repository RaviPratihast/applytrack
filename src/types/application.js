export const APPLICATION_STATUS = {
  APPLIED: "applied",
  INTERVIEW: "interview",
  REJECTED: "rejected",
  OFFER: "offer",
};

export function createApplication({
  company,
  role,
  status = APPLICATION_STATUS.APPLIED,
  appliedDate = new Date().toISOString(),
  notes = "",
  resumeVersion = "",
  followUpDate = null,
}) {
  return {
    id: crypto.randomUUID(),
    company,
    role,
    status,
    appliedDate,
    notes,
    resumeVersion,
    followUpDate,
  };
}
