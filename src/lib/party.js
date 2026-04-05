export function normalizePartyStatus(currentMembers, totalMembers) {
  return currentMembers >= totalMembers ? "closed" : "open";
}

export async function fetchPartyById(db, partyId) {
  const partyResult = await db.query(
    `SELECT
      p.id,
      p."partyName",
      p."partyGame",
      p."totalMembers",
      p.status,
      p."ownerId",
      p."createdAt",
      u.email AS "ownerEmail",
      u.username AS "ownerUsername",
      COALESCE(pm_counts."currentMembers", 0) AS "currentMembers"
    FROM "Party" p
    JOIN "User" u ON u.id = p."ownerId"
    LEFT JOIN (
      SELECT "partyId", COUNT(*)::int AS "currentMembers"
      FROM "PartyMember"
      GROUP BY "partyId"
    ) pm_counts ON pm_counts."partyId" = p.id
    WHERE p.id = $1`,
    [partyId]
  );

  const party = partyResult.rows[0];

  if (!party) {
    return null;
  }

  const membersResult = await db.query(
    `SELECT
      u.id,
      u.email,
      u.username,
      u."createdAt",
      pm.id AS "membershipId"
    FROM "PartyMember" pm
    JOIN "User" u ON u.id = pm."userId"
    WHERE pm."partyId" = $1
    ORDER BY u."createdAt" ASC`,
    [partyId]
  );

  return {
    id: party.id,
    partyName: party.partyName,
    partyGame: party.partyGame,
    totalMembers: party.totalMembers,
    currentMembers: party.currentMembers,
    status: party.status,
    createdAt: party.createdAt.toISOString(),
    owner: {
      id: party.ownerId,
      email: party.ownerEmail,
      username: party.ownerUsername,
    },
    members: membersResult.rows.map((member) => ({
      id: member.id,
      email: member.email,
      username: member.username,
      createdAt: member.createdAt.toISOString(),
      membershipId: member.membershipId,
    })),
  };
}
