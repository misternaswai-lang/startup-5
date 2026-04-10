import { query } from "@/lib/db";
import { error, json } from "@/lib/http";
import { fetchPartySummaries } from "@/lib/party";
import { parsePagination } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const partyName = searchParams.get("partyName")?.trim();
  const partyGame = searchParams.get("partyGame")?.trim();
  const keywords = [
    ...searchParams.getAll("keyword").map((keyword) => keyword.trim()).filter(Boolean),
    ...String(searchParams.get("keywords") ?? "")
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
  ];
  const { details, limit, offset } = parsePagination(searchParams);

  if (details.length > 0) {
    return error(400, "Ошибка валидации", details);
  }

  if (!partyName && !partyGame && keywords.length === 0) {
    return error(400, "Ошибка валидации", [
      "Нужен хотя бы один параметр поиска: partyName, partyGame или keywords",
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

  if (keywords.length > 0) {
    values.push(keywords);
    filters.push(`COALESCE(p.keywords, ARRAY[]::text[]) && $${values.length}::text[]`);
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
