import { type NextRequest } from "next/server";
import { db } from "@core/database/client";
import { listeningHistory } from "@core/database/schema";
import { eq } from "drizzle-orm";
import { ok, err, withCors, OPTIONS } from "../../_helpers";
import { authedUser } from "../_common";
import { loadHistory } from "../_queries";

export { OPTIONS };

export async function GET(req: NextRequest) {
  const auth = await authedUser(req);
  if (!auth.ok) return auth.response;
  try {
    return withCors(ok(await loadHistory(auth.userId)));
  } catch (e) {
    console.error("[GET /api/v1/me/history]", e);
    return withCors(err("Failed to fetch history", 500));
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await authedUser(req);
  if (!auth.ok) return auth.response;
  try {
    await db
      .delete(listeningHistory)
      .where(eq(listeningHistory.userId, auth.userId));
    return withCors(ok({ cleared: true }));
  } catch (e) {
    console.error("[DELETE /api/v1/me/history]", e);
    return withCors(err("Failed to clear history", 500));
  }
}
