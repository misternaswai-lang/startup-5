import { requireAuthUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { error, json } from "@/lib/http";
import { fetchPartySummaries } from "@/lib/party";
import { parsePagination } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request) {
  const { user, error: authError } = await requireAuthUser(request);

  if (authError) {
    return error(401, authError);
  }

  const { details, limit, offset } = parsePagination(request.nextUrl.searchParams);

  if (details.length > 0) {
    return error(400, "Ошибка валидации", details);
  }

  const items = await fetchPartySummaries(
    { query },
    {
      whereClause: `EXISTS (
        SELECT 1
        FROM "PartyMember" pm
        WHERE pm."partyId" = p.id AND pm."userId" = $1
      )`,
      values: [user.id],
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
