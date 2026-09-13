// src/app/api/v1/categories/route.ts
import { type NextRequest } from "next/server";
import { db } from "@core/database/client";
import { lectureCategories } from "@core/database/schema";
import { eq, asc } from "drizzle-orm";
import { ok, err, withCors, OPTIONS } from "../_helpers";
import { rateLimit } from "@/core/ratelimit/client";

export { OPTIONS };

export async function GET(_req: NextRequest) {
  // Inside GET():
  // ── Rate Limiting with Fail-Open Handling ─────────────────────────────────
  try {
    const rl = await rateLimit("api", _req);
    if (!rl.ok) return rl.response!;
  } catch (rlError) {
    // Allows request through if Upstash Redis drops or DNS fails locally
    console.warn(
      "[RateLimit] Skipping rate limit check due to Redis connection error:",
      rlError,
    );
  }
  try {
    const rows = await db.query.lectureCategories.findMany({
      where: eq(lectureCategories.isActive, true),
      orderBy: [asc(lectureCategories.name)],
      columns: {
        id: true,
        slug: true,
        name: true,
        description: true,
        position: true,
      },
    });

    return withCors(ok(rows));
  } catch (e) {
    console.error("[GET /api/v1/categories]", e);
    return withCors(err("Failed to fetch categories", 500));
  }
}
