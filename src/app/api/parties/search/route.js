import { query } from "@/lib/db";
import { error, json } from "@/lib/http";
import { fetchPartySummaries } from "@/lib/party";
import { parsePagination } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const partyName = searchParams.get("partyName")?.trim();
  const partyGame = searchParams.get("partyGame")?.trim();
  const { details, limit, offset } = parsePagination(searchParams);

  if (details.length > 0) {
    return error(400, "Validation error", details);
  }

  if (!partyName && !partyGame) {
    return error(400, "Validation error", [
      "At least one search parameter is required: partyName or partyGame",
    ]);
  }

  const values = [];
  const filters = [];

  if (partyName) {
    values.push(`%${partyName}%`);
    filters.push(`p."partyName" ILIKE $${values.length}`);
  }

  if (partyGame) {
    values.push(`%${partyGame}%`);
    filters.push(`p."partyGame" ILIKE $${values.length}`);
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
