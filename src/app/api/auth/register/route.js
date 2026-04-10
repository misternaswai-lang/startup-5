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
    return error(400, "Некорректное JSON-тело запроса");
  }

  const normalizedBody = {
    email: typeof body?.email === "string" ? body.email.trim().toLowerCase() : body?.email,
    username: typeof body?.username === "string" ? body.username.trim() : body?.username,
    password: body?.password,
    age: body?.age === "" || body?.age === null ? undefined : body?.age,
    gender:
      typeof body?.gender === "string"
        ? body.gender.trim() === ""
          ? undefined
          : body.gender.trim()
        : body?.gender,
    city:
      typeof body?.city === "string"
        ? body.city.trim() === ""
          ? undefined
          : body.city.trim()
        : body?.city,
    interests: Array.isArray(body?.interests)
      ? body.interests.map((interest) => String(interest).trim()).filter(Boolean)
      : body?.interests === undefined || body?.interests === null
        ? []
        : body?.interests,
  };

  const details = validateRegisterInput(normalizedBody);

  if (details.length > 0) {
    return error(400, "Ошибка валидации", details);
  }

  const existingUserResult = await query(
    'SELECT id FROM "User" WHERE email = $1 OR username = $2 LIMIT 1',
    [normalizedBody.email, normalizedBody.username]
  );

  if (existingUserResult.rowCount > 0) {
    return error(409, "Пользователь с таким email или username уже существует");
  }

  const userResult = await query(
    `INSERT INTO "User" (id, email, username, password, age, gender, city, interests)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8::text[])
    RETURNING id, email, username, age, gender, city, interests, "createdAt"`,
    [
      createId(),
      normalizedBody.email,
      normalizedBody.username,
      hashPassword(normalizedBody.password),
      normalizedBody.age ?? null,
      normalizedBody.gender ?? null,
      normalizedBody.city ?? null,
      Array.isArray(normalizedBody.interests) ? normalizedBody.interests : [],
    ]
  );

  return json(mapUserRow(userResult.rows[0]), { status: 201 });
}
