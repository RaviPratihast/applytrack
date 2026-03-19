const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse an ISO date-only string (YYYY-MM-DD) as a *local* Date.
 * JS parses YYYY-MM-DD as UTC, which can shift the day when formatted locally.
 */
export function parseDateOnlyLocal(dateStr) {
  if (!dateStr) return null;
  const s = String(dateStr).trim();
  if (!s) return null;

  if (DATE_ONLY_RE.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  const dt = new Date(s);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function formatShortDate(dateStr) {
  const d = parseDateOnlyLocal(dateStr);
  if (!d) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatLongDate(dateStr) {
  const d = parseDateOnlyLocal(dateStr);
  if (!d) return null;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function compareDatesAsc(a, b) {
  const da = parseDateOnlyLocal(a);
  const db = parseDateOnlyLocal(b);
  const ta = da ? da.getTime() : 0;
  const tb = db ? db.getTime() : 0;
  return ta - tb;
}

export function compareDatesDesc(a, b) {
  return compareDatesAsc(b, a);
}

export function isPastDate(dateStr) {
  const d = parseDateOnlyLocal(dateStr);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

export function monthKey(dateStr) {
  const d = parseDateOnlyLocal(dateStr);
  if (!d) return null;
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

