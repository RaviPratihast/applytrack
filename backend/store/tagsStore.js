import { randomUUID } from "crypto";
import pool from "../db.js";

function rowToTag(row) {
  return { id: row.id, name: row.name, color: row.color };
}

async function getAll() {
  try {
    const result = await pool.query("SELECT * FROM tags ORDER BY name ASC");
    return { ok: true, data: result.rows.map(rowToTag) };
  } catch (err) {
    return { ok: false, statusCode: 500, error: err.message };
  }
}

async function create(name, color = "#6B7280") {
  try {
    const id = randomUUID();
    const result = await pool.query(
      "INSERT INTO tags (id, name, color) VALUES ($1, $2, $3) RETURNING *",
      [id, name.trim(), color]
    );
    return { ok: true, data: rowToTag(result.rows[0]) };
  } catch (err) {
    if (err.code === "23505") return { ok: false, statusCode: 409, error: "Tag name already exists" };
    return { ok: false, statusCode: 500, error: err.message };
  }
}

async function remove(id) {
  try {
    const result = await pool.query("DELETE FROM tags WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) return { ok: false, statusCode: 404, error: "Tag not found" };
    return { ok: true, data: null };
  } catch (err) {
    return { ok: false, statusCode: 500, error: err.message };
  }
}

async function getByApplicationId(applicationId) {
  try {
    const result = await pool.query(
      `SELECT t.* FROM tags t
       JOIN application_tags at ON t.id = at.tag_id
       WHERE at.application_id = $1
       ORDER BY t.name ASC`,
      [applicationId]
    );
    return { ok: true, data: result.rows.map(rowToTag) };
  } catch (err) {
    return { ok: false, statusCode: 500, error: err.message };
  }
}

async function addToApplication(applicationId, tagId) {
  try {
    await pool.query(
      "INSERT INTO application_tags (application_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [applicationId, tagId]
    );
    return { ok: true, data: null };
  } catch (err) {
    return { ok: false, statusCode: 500, error: err.message };
  }
}

async function removeFromApplication(applicationId, tagId) {
  try {
    await pool.query(
      "DELETE FROM application_tags WHERE application_id = $1 AND tag_id = $2",
      [applicationId, tagId]
    );
    return { ok: true, data: null };
  } catch (err) {
    return { ok: false, statusCode: 500, error: err.message };
  }
}

export default { getAll, create, remove, getByApplicationId, addToApplication, removeFromApplication };
