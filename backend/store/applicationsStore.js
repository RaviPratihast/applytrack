import { randomUUID } from "crypto";
import pool from "../db.js";

const VALID_STATUSES = ["applied", "interview", "rejected", "offer"];

function rowToApplication(row) {
  if (!row) return null;
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    status: row.status,
    appliedDate: row.applied_date,
    notes: row.notes ?? "",
    resumeVersion: row.resume_version ?? "",
    followUpDate: row.follow_up_date ?? null,
  };
}

function parseBody(body) {
  const { company, role, status, appliedDate, notes, resumeVersion, followUpDate } = body ?? {};
  const companyTrimmed = typeof company === "string" ? company.trim() : "";
  const roleTrimmed = typeof role === "string" ? role.trim() : "";
  const statusValue = VALID_STATUSES.includes(status) ? status : "applied";
  // Date-only (YYYY-MM-DD) for compatibility with DATE columns; fallback to today
  const applied =
    typeof appliedDate === "string" && appliedDate.trim()
      ? appliedDate.trim().slice(0, 10)
      : new Date().toISOString().slice(0, 10);
  const notesStr = typeof notes === "string" ? notes : "";
  const resumeVersionStr = typeof resumeVersion === "string" ? resumeVersion : "";
  const followUp =
    followUpDate === null || followUpDate === undefined || followUpDate === ""
      ? null
      : String(followUpDate).trim().slice(0, 10) || null;
  return {
    company: companyTrimmed,
    role: roleTrimmed,
    status: statusValue,
    appliedDate: applied,
    notes: notesStr,
    resumeVersion: resumeVersionStr,
    followUpDate: followUp,
  };
}

async function getAll() {
  try {
    const result = await pool.query("SELECT * FROM applications ORDER BY applied_date DESC");
    const applications = result.rows.map(rowToApplication);
    return { ok: true, data: { applications } };
  } catch (err) {
    return { ok: false, statusCode: 500, error: err.message };
  }
}

async function getById(id) {
  try {
    const result = await pool.query("SELECT * FROM applications WHERE id = $1", [id]);
    const row = result.rows[0];
    if (!row) return { ok: false, statusCode: 404, error: "Application not found" };
    return { ok: true, data: rowToApplication(row) };
  } catch (err) {
    return { ok: false, statusCode: 500, error: err.message };
  }
}

async function add(application) {
  try {
    // Never pass undefined to PostgreSQL - coerce to null or empty string
    const id = application.id ?? null;
    const company = application.company ?? "";
    const role = application.role ?? "";
    const status = application.status ?? "applied";
    const appliedDate = application.appliedDate != null ? String(application.appliedDate).slice(0, 10) : new Date().toISOString().slice(0, 10);
    const notes = application.notes != null ? String(application.notes) : "";
    const resumeVersion = application.resumeVersion != null ? String(application.resumeVersion) : "";
    const followUpDate = application.followUpDate != null && application.followUpDate !== "" ? String(application.followUpDate).slice(0, 10) : null;

    await pool.query(
      `INSERT INTO applications (id, company, role, status, applied_date, notes, resume_version, follow_up_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, company, role, status, appliedDate, notes, resumeVersion, followUpDate]
    );
    return { ok: true, data: application };
  } catch (err) {
    console.error("[applicationsStore.add] DB error:", err.message);
    return { ok: false, statusCode: 500, error: err.message };
  }
}

async function update(id, application) {
  try {
    const company = application.company ?? "";
    const role = application.role ?? "";
    const status = application.status ?? "applied";
    const appliedDate = application.appliedDate != null ? String(application.appliedDate).slice(0, 10) : new Date().toISOString().slice(0, 10);
    const notes = application.notes != null ? String(application.notes) : "";
    const resumeVersion = application.resumeVersion != null ? String(application.resumeVersion) : "";
    const followUpDate = application.followUpDate != null && application.followUpDate !== "" ? String(application.followUpDate).slice(0, 10) : null;

    const result = await pool.query(
      `UPDATE applications
       SET company = $1, role = $2, status = $3, applied_date = $4, notes = $5, resume_version = $6, follow_up_date = $7
       WHERE id = $8
       RETURNING *`,
      [company, role, status, appliedDate, notes, resumeVersion, followUpDate, id]
    );
    const row = result.rows[0];
    if (!row) return { ok: false, statusCode: 404, error: "Application not found" };
    return { ok: true, data: rowToApplication(row) };
  } catch (err) {
    return { ok: false, statusCode: 500, error: err.message };
  }
}

async function remove(id) {
  try {
    const result = await pool.query("DELETE FROM applications WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) return { ok: false, statusCode: 404, error: "Application not found" };
    return { ok: true, data: null };
  } catch (err) {
    return { ok: false, statusCode: 500, error: err.message };
  }
}

function createFromPayload(body) {
  const { company, role, ...rest } = parseBody(body);
  if (!company || !role) {
    return { ok: false, statusCode: 400, error: "company and role are required and must be non-empty" };
  }
  const application = { id: randomUUID(), company, role, ...rest };
  return { ok: true, data: application };
}

async function updateFromPayload(id, body) {
  const getResult = await getById(id);
  if (!getResult.ok) return getResult;
  const { company, role, ...rest } = parseBody(body);
  if (!company || !role) {
    return { ok: false, statusCode: 400, error: "company and role are required and must be non-empty" };
  }
  const updated = { id, company, role, ...rest };
  return update(id, updated);
}

export default {
  getAll,
  getById,
  add,
  update,
  remove,
  createFromPayload,
  updateFromPayload,
};
