import { mapUserRow, requireAuthUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { error, json } from "@/lib/http";
import { USER_GENDERS } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request) {
  const { user, error: authError } = await requireAuthUser(request);

  if (authError) {
    return error(401, authError);
  }

  return json(mapUserRow(user));
}

function normalizeInterests(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    return value;
  }

  return value.map((item) => String(item).trim()).filter(Boolean);
}

export async function PATCH(request) {
  const { user, error: authError } = await requireAuthUser(request);

  if (authError) {
    return error(401, authError);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return error(400, "Некорректное JSON-тело запроса");
  }

  const payload = {
    age: body?.age,
    gender: body?.gender,
    city: body?.city,
    interests: normalizeInterests(body?.interests),
  };

  const details = [];

  if (payload.age !== undefined && payload.age !== null && payload.age !== "") {
    if (!Number.isInteger(payload.age) || payload.age < 1 || payload.age > 120) {
      details.push("Возраст должен быть целым числом от 1 до 120");
    }
  }

  if (payload.gender !== undefined && payload.gender !== null) {
    if (typeof payload.gender !== "string") {
      details.push("Пол должен быть строкой");
    } else if (payload.gender.trim() !== "" && !USER_GENDERS.includes(payload.gender.trim())) {
      details.push("Пол должен быть одним из значений: male, female, other");
    }
  }

  if (payload.city !== undefined && payload.city !== null) {
    if (typeof payload.city !== "string") {
      details.push("Город должен быть строкой");
    }
  }

  if (payload.interests !== undefined && payload.interests !== null && !Array.isArray(payload.interests)) {
    details.push("Интересы должны быть массивом строк");
  }

  if (details.length > 0) {
    return error(400, "Ошибка валидации", details);
  }

  const nextAge =
    payload.age === undefined ? user.age : payload.age === "" || payload.age === null ? null : payload.age;
  const nextGender =
    payload.gender === undefined
      ? user.gender
      : payload.gender === null
        ? null
        : payload.gender.trim() === ""
          ? null
          : payload.gender.trim();
  const nextCity =
    payload.city === undefined
      ? user.city
      : payload.city === null
        ? null
        : typeof payload.city === "string" && payload.city.trim() === ""
          ? null
          : payload.city;
  const nextInterests = payload.interests === undefined ? user.interests ?? [] : payload.interests ?? [];

  const updatedResult = await query(
    `UPDATE "User"
    SET age = $2, gender = $3, city = $4, interests = $5::text[]
    WHERE id = $1
    RETURNING id, email, username, age, gender, city, interests, "createdAt"`,
    [user.id, nextAge, nextGender, nextCity, nextInterests]
  );

  return json(mapUserRow(updatedResult.rows[0]));
}
