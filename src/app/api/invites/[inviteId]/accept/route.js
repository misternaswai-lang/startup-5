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

  const { inviteId } = await context.params;

  const result = await withTransaction(async (client) => {
    const inviteResult = await client.query(
      `SELECT
        i.id,
        i."partyId",
        i."toUserId",
        i.status,
        p."totalMembers",
        p.status AS "partyStatus"
      FROM "Invite" i
      JOIN "Party" p ON p.id = i."partyId"
      WHERE i.id = $1
      LIMIT 1
      FOR UPDATE`,
      [inviteId]
    );

    const invite = inviteResult.rows[0];

    if (!invite) {
      return { status: 404, message: "Invite not found" };
    }

    if (invite.toUserId !== user.id) {
      return { status: 403, message: "This invite does not belong to the current user" };
    }

    if (invite.status !== "pending") {
      return { status: 409, message: "Invite has already been processed" };
    }

    const existingMembershipResult = await client.query(
      'SELECT id FROM "PartyMember" WHERE "partyId" = $1 AND "userId" = $2 LIMIT 1',
      [invite.partyId, user.id]
    );

    if (existingMembershipResult.rowCount > 0) {
      await client.query(
        'UPDATE "Invite" SET status = $2::"InviteStatus" WHERE id = $1',
        [inviteId, "accepted"]
      );

      return { status: 409, message: "User is already in this party" };
    }

    const countResult = await client.query(
      'SELECT COUNT(*)::int AS count FROM "PartyMember" WHERE "partyId" = $1',
      [invite.partyId]
    );

    if (countResult.rows[0].count >= invite.totalMembers) {
      return { status: 409, message: "Party is already full" };
    }

    await client.query(
      'INSERT INTO "PartyMember" (id, "userId", "partyId") VALUES ($1, $2, $3)',
      [createId(), user.id, invite.partyId]
    );
    await client.query(
      'UPDATE "Invite" SET status = $2::"InviteStatus" WHERE id = $1',
      [inviteId, "accepted"]
    );

    const nextCount = countResult.rows[0].count + 1;
    const nextStatus =
      invite.partyStatus === "in_game"
        ? "in_game"
        : normalizePartyStatus(nextCount, invite.totalMembers);

    await client.query(
      'UPDATE "Party" SET status = $2::"PartyStatus" WHERE id = $1',
      [invite.partyId, nextStatus]
    );

    return { status: 200, party: await fetchPartyById(client, invite.partyId) };
  });

  if (result.status !== 200) {
    return error(result.status, result.message);
  }

  return json(result.party);
}
