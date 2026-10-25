import { type NextRequest } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@core/database/client";
import { listeningHistory, lectures } from "@core/database/schema";
import { and, eq, isNull, lt } from "drizzle-orm";
import { ok, err, withCors, OPTIONS } from "../../../_helpers";
import { authedUser, clientDate } from "../../_common";

export { OPTIONS };

const bodySchema = z.object({
  progressSecs: z.number().min(0).max(86_400).transform(Math.floor),
  completed: z.boolean(),
  playedAt: z.string().datetime(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const auth = await authedUser(req);
  if (!auth.ok) return auth.response;
  try {
    const { lectureId } = await params;
    const body = bodySchema.safeParse(await req.json().catch(() => null));
    if (!body.success) return withCors(err("Invalid request body", 400));

    const lecture = await db.query.lectures.findFirst({
      where: and(
        eq(lectures.id, lectureId),
        eq(lectures.status, "published"),
        isNull(lectures.deletedAt),
      ),
      columns: { id: true },
    });
    if (!lecture) return withCors(err("Lecture not found", 404));

    const playedAt = clientDate(body.data.playedAt);

    // Last-write-wins: an older device can never overwrite newer progress.
    const written = await db
      .insert(listeningHistory)
      .values({
        id: `lh_${nanoid(16)}`,
        userId: auth.userId,
        lectureId,
        playedAt,
        progressSecs: body.data.progressSecs,
        completed: body.data.completed,
      })
      .onConflictDoUpdate({
        target: [listeningHistory.userId, listeningHistory.lectureId],
        set: {
          playedAt,
          progressSecs: body.data.progressSecs,
          completed: body.data.completed,
        },
        setWhere: lt(listeningHistory.playedAt, playedAt),
      })
      .returning({ id: listeningHistory.id });

    return withCors(ok({ applied: written.length > 0 }));
  } catch (e) {
    console.error("[PUT /api/v1/me/history/:lectureId]", e);
    return withCors(err("Failed to save history", 500));
  }
}
