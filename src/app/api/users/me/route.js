import { mapUserRow, requireAuthUser } from "@/lib/auth";
import { error, json } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(request) {
  const { user, error: authError } = await requireAuthUser(request);

  if (authError) {
    return error(401, authError);
  }

  return json(mapUserRow(user));
}
