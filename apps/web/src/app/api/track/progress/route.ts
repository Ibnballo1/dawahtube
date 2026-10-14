// src/app/api/track/progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { recordLecturePlay } from "@features/account/actions/history-bookmark.actions";
import { z } from "zod";

const schema = z.object({
  lectureId: z.string(),
  progressSecs: z.number().int().min(0),
  completed: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.safeParse(body);
    if (!data.success) return NextResponse.json({ ok: false }, { status: 400 });

    await recordLecturePlay(
      data.data.lectureId,
      data.data.progressSecs,
      data.data.completed,
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
