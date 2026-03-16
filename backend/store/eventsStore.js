import { randomUUID } from "crypto";
import pool from "../db.js";

async function getByApplicationId(applicationId) {
  try {
    const result = await pool.query(
      "SELECT * FROM application_events WHERE application_id = $1 ORDER BY created_at ASC",
      [applicationId]
    );
    return { ok: true, data: result.rows.map(rowToEvent) };
  } catch (err) {
    return { ok: false, statusCode: 500, error: err.message };
  }
}

async function add(applicationId, eventType, note = "") {
  try {
    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO application_events (id, application_id, event_type, note)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, applicationId, eventType, note]
    );
    return { ok: true, data: rowToEvent(result.rows[0]) };
  } catch (err) {
    return { ok: false, statusCode: 500, error: err.message };
  }
}

function rowToEvent(row) {
  return {
    id: row.id,
    applicationId: row.application_id,
    eventType: row.event_type,
    note: row.note,
    createdAt: row.created_at,
  };
}

export default { getByApplicationId, add };
