// src/app/api/analytics/view/route.ts
// Called from a client component on mount — fire and forget.
// No auth required — anonymous tracking uses sessionId only.
import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "@core/analytics/pg-analytics.service";
import { z } from "zod";

const schema = z.discriminatedUnion("entity", [
  z.object({
    entity: z.literal("lecture"),
    id: z.string(),
    sessionId: z.string(),
    durationSecs: z.number().optional(),
  }),
  z.object({
    entity: z.literal("article"),
    id: z.string(),
    sessionId: z.string(),
  }),
  z.object({
    entity: z.literal("book"),
    id: z.string(),
    sessionId: z.string(),
  }),
]);

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const ref = req.headers.get("referer") ?? undefined;

    if (body.entity === "lecture") {
      await analyticsService.trackLectureView(
        body.id,
        body.sessionId,
        body.durationSecs,
        undefined,
        ref,
      );
    } else if (body.entity === "article") {
      await analyticsService.trackArticleView(
        body.id,
        body.sessionId,
        undefined,
        ref,
      );
    } else {
      await analyticsService.trackBookDownload(body.id);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
