// src/app/api/analytics/view/route.ts
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

    if (body.entity === "lecture") {
      await analyticsService.trackLectureView(
        body.id,
        body.sessionId,
        body.durationSecs,
      );
    } else if (body.entity === "article") {
      await analyticsService.trackArticleView(body.id, body.sessionId);
    } else {
      await analyticsService.trackBookDownload(body.id, body.sessionId);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
