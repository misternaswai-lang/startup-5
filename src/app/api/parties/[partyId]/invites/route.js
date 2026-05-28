import { createId, requireAuthUser } from "@/lib/auth";
import { withTransaction } from "@/lib/db";
import { error, json } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request, context) {
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

  const toUserId = body?.toUserId?.trim();

  if (!toUserId) {
    return error(400, "Ошибка валидации", ["toUserId обязателен"]);
  }

  const result = await withTransaction(async (client) => {
    const partyResult = await client.query(
      'SELECT id, "ownerId" FROM "Party" WHERE id = $1 LIMIT 1 FOR UPDATE',
      [partyId]
    );

    const party = partyResult.rows[0];

    if (!party) {
      return { status: 404, message: "Пати не найдена" };
    }

    if (party.ownerId !== user.id) {
      return { status: 403, message: "Создавать приглашения может только создатель" };
    }

    const targetUserResult = await client.query(
      'SELECT id, email, username FROM "User" WHERE id = $1 LIMIT 1',
      [toUserId]
    );

    const targetUser = targetUserResult.rows[0];

    if (!targetUser) {
      return { status: 404, message: "Пользователь для приглашения не найден" };
    }

    const membershipResult = await client.query(
      'SELECT id FROM "PartyMember" WHERE "partyId" = $1 AND "userId" = $2 LIMIT 1',
      [partyId, toUserId]
    );

    if (membershipResult.rowCount > 0) {
      return { status: 409, message: "Пользователь уже состоит в этой пати" };
    }

    const inviteResult = await client.query(
      `INSERT INTO "Invite" (id, "partyId", "toUserId", status)
      VALUES ($1, $2, $3, 'pending'::"InviteStatus")
      ON CONFLICT ("partyId", "toUserId")
      DO UPDATE SET status = 'pending'::"InviteStatus", "createdAt" = CURRENT_TIMESTAMP
      RETURNING id, "partyId", "toUserId", status, "createdAt"`,
      [createId(), partyId, toUserId]
    );

    const invite = inviteResult.rows[0];

    return {
      status: 201,
      invite: {
        id: invite.id,
        partyId: invite.partyId,
        toUser: targetUser,
        status: invite.status,
        createdAt: invite.createdAt.toISOString(),
      },
    };
  });

  if (result.status !== 201) {
    return error(result.status, result.message);
  }

  return json(result.invite, { status: 201 });
}
