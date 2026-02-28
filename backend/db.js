import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Test that the database connection works.
 * @returns {Promise<{ ok: true } | { ok: false; error: string }>}
 */
export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export default pool;
