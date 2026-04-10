import { randomUUID } from "node:crypto";
import { query } from "./db";
import { verifyAccessToken } from "./jwt";

export function mapUserRow(row) {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    age: row.age,
    gender: row.gender,
    city: row.city,
    interests: row.interests ?? [],
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getUserById(id, db = { query }) {
  const result = await db.query(
    'SELECT id, email, username, age, gender, city, interests, "createdAt" FROM "User" WHERE id = $1',
    [id]
  );

  return result.rows[0] ?? null;
}

export async function requireAuthUser(request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return {
      error: "Отсутствует Bearer-токен",
    };
  }

  const token = authorization.slice("Bearer ".length).trim();

  try {
    const payload = verifyAccessToken(token);
    const user = await getUserById(payload.sub);

    if (!user) {
      return {
        error: "Пользователь не найден",
      };
    }

    return {
      user,
    };
  } catch {
    return {
      error: "Токен недействителен или истёк",
    };
  }
}

export function createId() {
  return randomUUID();
}
