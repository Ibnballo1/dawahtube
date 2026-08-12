// src/app/api/cron/publish-scheduled/route.ts
//
// Called every 5 minutes by the GitHub Actions workflow.
// Publishes any content whose scheduled_at time has passed.
//
// Security: verifies x-cron-secret header — reject anything without it.
// This prevents the endpoint from being triggered by arbitrary HTTP requests.

import { NextRequest, NextResponse } from "next/server";
import { publishScheduledContent } from "@core/jobs/publish-scheduled";

export const runtime = "nodejs"; // needs DB access — can't run on edge

export async function POST(req: NextRequest) {
  // ── Auth check ───────────────────────────────────────────────────────────
  const secret = req.headers.get("x-cron-secret");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.error("[cron] CRON_SECRET env var is not set");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 },
    );
  }

  if (!secret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Run publish job ───────────────────────────────────────────────────────
  try {
    const result = await publishScheduledContent();

    console.log(
      `[cron] Published ${result.published} items` +
        ((result.errors ?? 0) > 0 ? ` (${result.errors ?? 0} errors)` : ""),
    );

    return NextResponse.json({
      ok: true,
      published: result.published,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron] publishScheduledContent threw:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Reject non-POST requests
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
