import { Pool } from "pg";
import { env } from "./env";

const globalForDb = globalThis;

export const pool =
  globalForDb.__partyPool ??
  new Pool({
    connectionString: env.databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__partyPool = pool;
}

export async function query(text, params) {
  return pool.query(text, params);
}

export async function withTransaction(callback) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
