// src/app/api/cron/publish-scheduled/route.ts
//
// Vercel Cron Job — runs every 5 minutes.
// Finds all content with status='scheduled' and scheduled_at <= now(),
// flips them to status='published', and invalidates relevant cache tags.
//
// vercel.json configuration:
// {
//   "crons": [{ "path": "/api/cron/publish-scheduled", "schedule": "*/5 * * * *" }]
// }
//
// Security: Vercel automatically sends an Authorization header with CRON_SECRET.
// Requests without the correct secret return 401.

import { NextRequest, NextResponse } from "next/server";
import { publishScheduledContent } from "@core/jobs/publish-scheduled";
import { env } from "@core/config/env";

export const runtime = "nodejs"; // needs Drizzle + postgres client, not edge
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify the request is from Vercel Cron (or an authorised caller in dev)
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${env.CRON_SECRET}`;

  if (env.NODE_ENV === "production" && authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await publishScheduledContent();

    const total = Object.values(results).reduce((sum, n) => sum + n, 0);
    console.log(`[cron/publish-scheduled] Published ${total} items:`, results);

    return NextResponse.json({ ok: true, published: results });
  } catch (err) {
    console.error("[cron/publish-scheduled] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
