import { createId, requireAuthUser } from "@/lib/auth";
import { withTransaction } from "@/lib/db";
import { error, json } from "@/lib/http";
import { fetchPartyById, normalizePartyStatus } from "@/lib/party";

export const runtime = "nodejs";

export async function POST(request, context) {
  const { user, error: authError } = await requireAuthUser(request);

  if (authError) {
    return error(401, authError);
  }

  const { partyId } = await context.params;

  const result = await withTransaction(async (client) => {
    const partyResult = await client.query(
      'SELECT id, "totalMembers" FROM "Party" WHERE id = $1 LIMIT 1 FOR UPDATE',
      [partyId]
    );

    const party = partyResult.rows[0];

    if (!party) {
      return { status: 404 };
    }

    const membershipResult = await client.query(
      'SELECT id FROM "PartyMember" WHERE "partyId" = $1 AND "userId" = $2 LIMIT 1',
      [partyId, user.id]
    );

    if (membershipResult.rowCount > 0) {
      return { status: 409, message: "Пользователь уже состоит в этой пати" };
    }

    const countResult = await client.query(
      'SELECT COUNT(*)::int AS count FROM "PartyMember" WHERE "partyId" = $1',
      [partyId]
    );

    const currentMembers = countResult.rows[0].count;

    if (currentMembers >= party.totalMembers) {
      return { status: 409, message: "В пати уже нет свободных мест" };
    }

    await client.query(
      'INSERT INTO "PartyMember" (id, "userId", "partyId") VALUES ($1, $2, $3)',
      [createId(), user.id, partyId]
    );

    await client.query(
      'UPDATE "Party" SET status = $2::"PartyStatus" WHERE id = $1',
      [partyId, normalizePartyStatus(currentMembers + 1, party.totalMembers)]
    );

    return {
      status: 200,
      party: await fetchPartyById(client, partyId),
    };
  });

  if (result.status === 404) {
    return error(404, "Пати не найдена");
  }

  if (result.status === 409) {
    return error(409, result.message);
  }

  return json(result.party);
}
