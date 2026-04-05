import { requireAuthUser } from "@/lib/auth";
import { query, withTransaction } from "@/lib/db";
import { error, json } from "@/lib/http";
import { fetchPartyById, normalizePartyStatus } from "@/lib/party";
import { validatePartyPayload } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(_request, context) {
  const { partyId } = await context.params;
  const party = await fetchPartyById({ query }, partyId);

  if (!party) {
    return error(404, "Party not found");
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
    return error(404, "Party not found");
  }

  if (deleted.status === 403) {
    return error(403, "Only the creator can delete the party");
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
    return error(400, "Invalid JSON body");
  }

  const payload = {
    partyName: body?.partyName?.trim(),
    partyGame: body?.partyGame?.trim(),
    totalMembers: body?.totalMembers,
  };

  if (
    payload.partyName === undefined &&
    payload.partyGame === undefined &&
    payload.totalMembers === undefined
  ) {
    return error(400, "Validation error", ["At least one field must be provided"]);
  }

  const details = validatePartyPayload(payload, { partial: true });

  if (details.length > 0) {
    return error(400, "Validation error", details);
  }

  const result = await withTransaction(async (client) => {
    const partyResult = await client.query(
      `SELECT
        p.id,
        p."ownerId",
        p."partyName",
        p."partyGame",
        p."totalMembers",
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
        details: ["totalMembers cannot be less than the current number of participants"],
      };
    }

    await client.query(
      `UPDATE "Party"
      SET
        "partyName" = $2,
        "partyGame" = $3,
        "totalMembers" = $4,
        status = $5::"PartyStatus"
      WHERE id = $1`,
      [
        partyId,
        payload.partyName ?? party.partyName,
        payload.partyGame ?? party.partyGame,
        nextTotalMembers,
        normalizePartyStatus(party.currentMembers, nextTotalMembers),
      ]
    );

    return {
      status: 200,
      party: await fetchPartyById(client, partyId),
    };
  });

  if (result.status === 404) {
    return error(404, "Party not found");
  }

  if (result.status === 403) {
    return error(403, "Only the creator can update the party");
  }

  if (result.status === 400) {
    return error(400, "Validation error", result.details);
  }

  return json(result.party);
}
