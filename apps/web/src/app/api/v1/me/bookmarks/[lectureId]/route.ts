import { type NextRequest } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@core/database/client";
import { bookmarks, lectures } from "@core/database/schema";
import { and, eq, isNull } from "drizzle-orm";
import { ok, err, withCors, OPTIONS } from "../../../_helpers";
import { authedUser, clientDate } from "../../_common";

export { OPTIONS };

const bodySchema = z.object({ createdAt: z.string().datetime().optional() });

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const auth = await authedUser(req);
  if (!auth.ok) return auth.response;
  try {
    const { lectureId } = await params;
    const body = bodySchema.safeParse(await req.json().catch(() => ({})));
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

    await db
      .insert(bookmarks)
      .values({
        id: `bm_${nanoid(16)}`,
        userId: auth.userId,
        lectureId,
        createdAt: clientDate(body.data.createdAt),
      })
      .onConflictDoNothing({ target: [bookmarks.userId, bookmarks.lectureId] });

    return withCors(ok({ bookmarked: true }));
  } catch (e) {
    console.error("[PUT /api/v1/me/bookmarks/:lectureId]", e);
    return withCors(err("Failed to save bookmark", 500));
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const auth = await authedUser(req);
  if (!auth.ok) return auth.response;
  try {
    const { lectureId } = await params;
    await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, auth.userId),
          eq(bookmarks.lectureId, lectureId),
        ),
      );
    return withCors(ok({ bookmarked: false }));
  } catch (e) {
    console.error("[DELETE /api/v1/me/bookmarks/:lectureId]", e);
    return withCors(err("Failed to remove bookmark", 500));
  }
}
