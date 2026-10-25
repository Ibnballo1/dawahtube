import { type NextRequest } from "next/server";
import { ok, err, withCors, OPTIONS } from "../../_helpers";
import { authedUser } from "../_common";
import { loadTimestampBookmarks } from "../_queries";

export { OPTIONS };

export async function GET(req: NextRequest) {
  const auth = await authedUser(req);
  if (!auth.ok) return auth.response;
  try {
    const lectureId = req.nextUrl.searchParams.get("lectureId") ?? undefined;
    return withCors(ok(await loadTimestampBookmarks(auth.userId, lectureId)));
  } catch (e) {
    console.error("[GET /api/v1/me/timestamp-bookmarks]", e);
    return withCors(err("Failed to fetch bookmarks", 500));
  }
}
