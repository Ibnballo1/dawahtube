import { type NextRequest } from "next/server";
import { ok, err, withCors, OPTIONS } from "../../_helpers";
import { authedUser } from "../_common";
import { loadBookmarks } from "../_queries";

export { OPTIONS };

export async function GET(req: NextRequest) {
  const auth = await authedUser(req);
  if (!auth.ok) return auth.response;
  try {
    return withCors(ok(await loadBookmarks(auth.userId)));
  } catch (e) {
    console.error("[GET /api/v1/me/bookmarks]", e);
    return withCors(err("Failed to fetch bookmarks", 500));
  }
}
