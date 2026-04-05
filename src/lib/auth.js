import { randomUUID } from "node:crypto";
import { query } from "./db";
import { verifyAccessToken } from "./jwt";

export function mapUserRow(row) {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getUserById(id, db = { query }) {
  const result = await db.query(
    'SELECT id, email, username, "createdAt" FROM "User" WHERE id = $1',
    [id]
  );

  return result.rows[0] ?? null;
}

export async function requireAuthUser(request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return {
      error: "Missing bearer token",
    };
  }

  const token = authorization.slice("Bearer ".length).trim();

  try {
    const payload = verifyAccessToken(token);
    const user = await getUserById(payload.sub);

    if (!user) {
      return {
        error: "User not found",
      };
    }

    return {
      user,
    };
  } catch {
    return {
      error: "Invalid or expired token",
    };
  }
}

export function createId() {
  return randomUUID();
}
