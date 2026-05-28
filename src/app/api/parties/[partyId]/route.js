import { requireAuthUser } from "@/lib/auth";
import { query, withTransaction } from "@/lib/db";
import { error, json } from "@/lib/http";
import { fetchPartyById, normalizePartyStatus } from "@/lib/party";
import { validatePartyPayload } from "@/lib/validation";

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
    return value;
  }

  if (!Array.isArray(value)) {
    return value;
  }

  return value.map((item) => String(item).trim()).filter(Boolean);
}

export async function GET(_request, context) {
  const { partyId } = await context.params;
  const party = await fetchPartyById({ query }, partyId);

  if (!party) {
    return error(404, "Пати не найдена");
  }

  return json(party);
}

export async function DELETE(request, context) {
  const { user, error: authError } = await requireAuthUser(request);

  if (authError) {
    return error(401, authError);
  }

  const { partyId } = await context.params;

  const deleted = await withTransaction(async (client) => {
    const partyResult = await client.query(
      'SELECT id, "ownerId" FROM "Party" WHERE id = $1 LIMIT 1',
      [partyId]
    );

    const party = partyResult.rows[0];

    if (!party) {
      return { status: 404 };
    }

    if (party.ownerId !== user.id) {
      return { status: 403 };
    }

    await client.query('DELETE FROM "Invite" WHERE "partyId" = $1', [partyId]);
    await client.query('DELETE FROM "PartyMember" WHERE "partyId" = $1', [partyId]);
    await client.query('DELETE FROM "Party" WHERE id = $1', [partyId]);

    return { status: 204 };
  });

  if (deleted.status === 404) {
    return error(404, "Пати не найдена");
  }

  if (deleted.status === 403) {
    return error(403, "Удалить пати может только создатель");
  }

  return new Response(null, { status: 204 });
}

export async function PATCH(request, context) {
  const { user, error: authError } = await requireAuthUser(request);

  if (authError) {
    return error(401, authError);
  }

  const { partyId } = await context.params;
  let body;

  try {
    body = await request.json();
  } catch {
    return error(400, "Некорректное JSON-тело запроса");
  }

  const payload = {
    partyName: readTrimmedString(body?.partyName),
    partyGame: readTrimmedString(body?.partyGame),
    totalMembers: body?.totalMembers,
    status: body?.status,
    description: readTrimmedString(body?.description),
    address: readTrimmedString(body?.address),
    keywords: normalizeStringArray(body?.keywords),
  };

  if (
    payload.partyName === undefined &&
    payload.partyGame === undefined &&
    payload.totalMembers === undefined &&
    payload.status === undefined &&
    payload.description === undefined &&
    payload.address === undefined &&
    payload.keywords === undefined
  ) {
    return error(400, "Ошибка валидации", ["Нужно передать хотя бы одно поле для обновления"]);
  }

  const details = validatePartyPayload(payload, { partial: true });

  if (details.length > 0) {
    return error(400, "Ошибка валидации", details);
  }

  const result = await withTransaction(async (client) => {
    const partyResult = await client.query(
      `SELECT
        p.id,
        p."ownerId",
        p."partyName",
        p."partyGame",
        p.description,
        p.address,
        p.keywords,
        p."totalMembers",
        p.status,
        COALESCE(pm_counts."currentMembers", 0) AS "currentMembers"
      FROM "Party" p
      LEFT JOIN (
        SELECT "partyId", COUNT(*)::int AS "currentMembers"
        FROM "PartyMember"
        GROUP BY "partyId"
      ) pm_counts ON pm_counts."partyId" = p.id
      WHERE p.id = $1
      LIMIT 1`,
      [partyId]
    );

    const party = partyResult.rows[0];

    if (!party) {
      return { status: 404 };
    }

    if (party.ownerId !== user.id) {
      return { status: 403 };
    }

    const nextTotalMembers = payload.totalMembers ?? party.totalMembers;

    if (nextTotalMembers < party.currentMembers) {
      return {
        status: 400,
        details: ["totalMembers не может быть меньше текущего числа участников"],
      };
    }

    const nextStatus =
      payload.status ??
      (party.status === "in_game"
        ? "in_game"
        : normalizePartyStatus(party.currentMembers, nextTotalMembers));

    const nextDescription =
      payload.description === undefined ? party.description : payload.description ?? "";
    const nextAddress = payload.address === undefined ? party.address : payload.address ?? "";
    const nextKeywords =
      payload.keywords === undefined
        ? party.keywords ?? []
        : Array.isArray(payload.keywords)
          ? payload.keywords
          : [];

    await client.query(
      `UPDATE "Party"
      SET
        "partyName" = $2,
        "partyGame" = $3,
        "totalMembers" = $4,
        status = $5::"PartyStatus",
        description = $6,
        address = $7,
        keywords = $8::text[]
      WHERE id = $1`,
      [
        partyId,
        payload.partyName ?? party.partyName,
        payload.partyGame ?? party.partyGame,
        nextTotalMembers,
        nextStatus,
        nextDescription,
        nextAddress,
        nextKeywords,
      ]
    );

    return {
      status: 200,
      party: await fetchPartyById(client, partyId),
    };
  });

  if (result.status === 404) {
    return error(404, "Пати не найдена");
  }

  if (result.status === 403) {
    return error(403, "Обновлять пати может только создатель");
  }

  if (result.status === 400) {
    return error(400, "Ошибка валидации", result.details);
  }

  return json(result.party);
}
