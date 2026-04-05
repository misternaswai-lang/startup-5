import { requireAuthUser } from "@/lib/auth";
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
      'SELECT id, "ownerId", "totalMembers" FROM "Party" WHERE id = $1 LIMIT 1 FOR UPDATE',
      [partyId]
    );

    const party = partyResult.rows[0];

    if (!party) {
      return { status: 404 };
    }

    if (party.ownerId === user.id) {
      return {
        status: 403,
        message: "Party creator cannot leave their own party. Delete it instead.",
      };
    }

    const membershipResult = await client.query(
      'SELECT id FROM "PartyMember" WHERE "partyId" = $1 AND "userId" = $2 LIMIT 1',
      [partyId, user.id]
    );

    const membership = membershipResult.rows[0];

    if (!membership) {
      return { status: 404, message: "User is not a member of this party" };
    }

    await client.query('DELETE FROM "PartyMember" WHERE id = $1', [membership.id]);

    const countResult = await client.query(
      'SELECT COUNT(*)::int AS count FROM "PartyMember" WHERE "partyId" = $1',
      [partyId]
    );

    const currentMembers = countResult.rows[0].count;

    await client.query(
      'UPDATE "Party" SET status = $2::"PartyStatus" WHERE id = $1',
      [partyId, normalizePartyStatus(currentMembers, party.totalMembers)]
    );

    return {
      status: 200,
      party: await fetchPartyById(client, partyId),
    };
  });

  if (result.status === 404) {
    return error(404, result.message ?? "Party not found");
  }

  if (result.status === 403) {
    return error(403, result.message);
  }

  return json(result.party);
}
