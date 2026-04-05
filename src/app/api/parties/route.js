import { createId, requireAuthUser } from "@/lib/auth";
import { query, withTransaction } from "@/lib/db";
import { error, json } from "@/lib/http";
import { fetchPartyById, fetchPartySummaries, normalizePartyStatus } from "@/lib/party";
import { parsePagination, validatePartyPayload } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const partyGame = searchParams.get("partyGame")?.trim();
  const { details, limit, offset } = parsePagination(searchParams);

  if (details.length > 0) {
    return error(400, "Validation error", details);
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
    return error(400, "Invalid JSON body");
  }

  const payload = {
    partyName: body?.partyName?.trim(),
    partyGame: body?.partyGame?.trim(),
    totalMembers: body?.totalMembers,
    listMembers: body?.listMembers,
  };

  const details = validatePartyPayload(payload);

  if (details.length > 0) {
    return error(400, "Validation error", details);
  }

  const requestedMemberIds = [...new Set((payload.listMembers ?? []).map((memberId) => memberId.trim()))];
  const memberIds = [...new Set([user.id, ...requestedMemberIds])];

  if (payload.totalMembers < memberIds.length) {
    return error(
      400,
      "Validation error",
      ["totalMembers cannot be less than the current number of participants"]
    );
  }

  const party = await withTransaction(async (client) => {
    if (requestedMemberIds.length > 0) {
      const usersResult = await client.query(
        'SELECT id FROM "User" WHERE id = ANY($1::text[])',
        [requestedMemberIds]
      );

      if (usersResult.rowCount !== requestedMemberIds.length) {
        throw new Error("One or more listMembers do not exist");
      }
    }

    const partyId = createId();
    const status = normalizePartyStatus(memberIds.length, payload.totalMembers);

    await client.query(
      `INSERT INTO "Party" (
        id,
        "partyName",
        "partyGame",
        "totalMembers",
        status,
        "ownerId"
      )
      VALUES ($1, $2, $3, $4, $5::"PartyStatus", $6)`,
      [partyId, payload.partyName, payload.partyGame, payload.totalMembers, status, user.id]
    );

    for (const memberId of memberIds) {
      await client.query(
        'INSERT INTO "PartyMember" (id, "userId", "partyId") VALUES ($1, $2, $3)',
        [createId(), memberId, partyId]
      );
    }

    return fetchPartyById(client, partyId);
  }).catch((transactionError) => {
    if (transactionError.message === "One or more listMembers do not exist") {
      return null;
    }

    throw transactionError;
  });

  if (!party) {
    return error(400, "Validation error", ["One or more listMembers do not exist"]);
  }

  return json(party, { status: 201 });
}
