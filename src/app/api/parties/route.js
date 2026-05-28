import { createId, requireAuthUser } from "@/lib/auth";
import { query, withTransaction } from "@/lib/db";
import { error, json } from "@/lib/http";
import { fetchPartyById, fetchPartySummaries, normalizePartyStatus } from "@/lib/party";
import { parsePagination, validatePartyPayload } from "@/lib/validation";

export const runtime = "nodejs";

function readTrimmedString(value) {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  return value.trim();
}

function normalizeStringArray(value) {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    return value;
  }

  return value.map((item) => String(item).trim()).filter(Boolean);
}

function validateMinimalPartyCreatePayload(payload) {
  const details = [];

  if (payload.description !== undefined && payload.description !== null && typeof payload.description !== "string") {
    details.push("Описание должно быть строкой");
  }

  if (payload.address !== undefined && payload.address !== null && typeof payload.address !== "string") {
    details.push("Адрес должен быть строкой");
  }

  if (payload.keywords !== undefined && payload.keywords !== null) {
    if (!Array.isArray(payload.keywords)) {
      details.push("Ключевые слова должны быть массивом строк");
    } else if (payload.keywords.some((keyword) => typeof keyword !== "string")) {
      details.push("Каждое ключевое слово должно быть строкой");
    }
  }

  return details;
}

function derivePartyName(description) {
  const normalized = String(description ?? "").trim().replace(/\s+/g, " ");

  if (normalized === "") {
    return "Новая пати";
  }

  if (normalized.length <= 48) {
    return normalized;
  }

  return `${normalized.slice(0, 48).trimEnd()}…`;
}

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const partyGame = searchParams.get("partyGame")?.trim();
  const { details, limit, offset } = parsePagination(searchParams);

  if (details.length > 0) {
    return error(400, "Ошибка валидации", details);
  }

  const values = [];
  const filters = [];

  if (partyGame) {
    values.push(partyGame);
    filters.push(`p."partyGame" = $${values.length}`);
  }

  const items = await fetchPartySummaries(
    { query },
    {
      whereClause: filters.join(" AND "),
      values,
      limit,
      offset,
    }
  );

  return json({
    items,
    limit,
    offset,
  });
}

export async function POST(request) {
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
    partyName: readTrimmedString(body?.partyName),
    partyGame: readTrimmedString(body?.partyGame),
    description: readTrimmedString(body?.description),
    address: readTrimmedString(body?.address),
    keywords: normalizeStringArray(body?.keywords),
    totalMembers: body?.totalMembers,
    listMembers: body?.listMembers,
  };

  const wantsFullPayload =
    payload.partyName !== undefined ||
    payload.partyGame !== undefined ||
    payload.totalMembers !== undefined;

  const details = wantsFullPayload ? validatePartyPayload(payload) : validateMinimalPartyCreatePayload(payload);

  if (details.length > 0) {
    return error(400, "Ошибка валидации", details);
  }

  const normalizedPayload = wantsFullPayload
    ? payload
    : {
        ...payload,
        partyName: derivePartyName(payload.description),
        partyGame: "Без игры",
        description: typeof payload.description === "string" ? payload.description : "",
        address: typeof payload.address === "string" ? payload.address : "",
        totalMembers: 5,
        listMembers: [],
        keywords: Array.isArray(payload.keywords) ? payload.keywords : [],
      };

  const requestedMemberIds = [
    ...new Set((normalizedPayload.listMembers ?? []).map((memberId) => memberId.trim())),
  ];
  const memberIds = [...new Set([user.id, ...requestedMemberIds])];

  if (normalizedPayload.totalMembers < memberIds.length) {
    return error(
      400,
      "Ошибка валидации",
      ["Количество мест не может быть меньше текущего числа участников"]
    );
  }

  const party = await withTransaction(async (client) => {
    if (requestedMemberIds.length > 0) {
      const usersResult = await client.query(
        'SELECT id FROM "User" WHERE id = ANY($1::text[])',
        [requestedMemberIds]
      );

      if (usersResult.rowCount !== requestedMemberIds.length) {
        throw new Error("Один или несколько пользователей из listMembers не существуют");
      }
    }

    const partyId = createId();
    const status = normalizePartyStatus(memberIds.length, normalizedPayload.totalMembers);

    await client.query(
      `INSERT INTO "Party" (
        id,
        "partyName",
        "partyGame",
        description,
        address,
        keywords,
        "totalMembers",
        status,
        "ownerId"
      )
      VALUES ($1, $2, $3, $4, $5, $6::text[], $7, $8::"PartyStatus", $9)`,
      [
        partyId,
        normalizedPayload.partyName,
        normalizedPayload.partyGame,
        normalizedPayload.description,
        normalizedPayload.address,
        Array.isArray(normalizedPayload.keywords) ? normalizedPayload.keywords : [],
        normalizedPayload.totalMembers,
        status,
        user.id,
      ]
    );

    for (const memberId of memberIds) {
      await client.query(
        'INSERT INTO "PartyMember" (id, "userId", "partyId") VALUES ($1, $2, $3)',
        [createId(), memberId, partyId]
      );
    }

    return fetchPartyById(client, partyId);
  }).catch((transactionError) => {
    if (transactionError.message === "Один или несколько пользователей из listMembers не существуют") {
      return null;
    }

    throw transactionError;
  });

  if (!party) {
    return error(400, "Ошибка валидации", ["Один или несколько пользователей из listMembers не существуют"]);
  }

  return json(party, { status: 201 });
}
