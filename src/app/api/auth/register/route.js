import { createId, mapUserRow } from "@/lib/auth";
import { query } from "@/lib/db";
import { error, json } from "@/lib/http";
import { hashPassword } from "@/lib/password";
import { validateRegisterInput } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return error(400, "Invalid JSON body");
  }

  const normalizedBody = {
    email: body?.email?.trim().toLowerCase(),
    username: body?.username?.trim(),
    password: body?.password,
  };

  const details = validateRegisterInput(normalizedBody);

  if (details.length > 0) {
    return error(400, "Validation error", details);
  }

  const existingUserResult = await query(
    'SELECT id FROM "User" WHERE email = $1 OR username = $2 LIMIT 1',
    [normalizedBody.email, normalizedBody.username]
  );

  if (existingUserResult.rowCount > 0) {
    return error(409, "User already exists");
  }

  const userResult = await query(
    `INSERT INTO "User" (id, email, username, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, username, "createdAt"`,
    [
      createId(),
      normalizedBody.email,
      normalizedBody.username,
      hashPassword(normalizedBody.password),
    ]
  );

  return json(mapUserRow(userResult.rows[0]), { status: 201 });
}
