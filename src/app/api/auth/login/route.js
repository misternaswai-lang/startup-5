import { createAccessToken, createRefreshToken } from "@/lib/jwt";
import { query } from "@/lib/db";
import { error, json } from "@/lib/http";
import { verifyPassword } from "@/lib/password";
import { validateLoginInput } from "@/lib/validation";

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
    password: body?.password,
  };

  const details = validateLoginInput(normalizedBody);

  if (details.length > 0) {
    return error(400, "Validation error", details);
  }

  const result = await query(
    'SELECT id, password FROM "User" WHERE email = $1 LIMIT 1',
    [normalizedBody.email]
  );

  const user = result.rows[0];

  if (!user || !verifyPassword(normalizedBody.password, user.password)) {
    return error(401, "Invalid email or password");
  }

  return json({
    accessToken: createAccessToken(user.id),
    refreshToken: createRefreshToken(user.id),
  });
}
