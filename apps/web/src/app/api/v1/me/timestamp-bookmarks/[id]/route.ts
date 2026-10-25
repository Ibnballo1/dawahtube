import { type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@core/database/client";
import { timestampBookmarks, lectures } from "@core/database/schema";
import { and, count, eq, isNull } from "drizzle-orm";
import { ok, err, withCors, OPTIONS } from "../../../_helpers";
import { authedUser, clientDate } from "../../_common";

export { OPTIONS };

const MAX_PER_USER = 5000;

const bodySchema = z.object({
  lectureId: z.string().min(1).max(100),
  timestampSecs: z.number().min(0).max(86_400).transform(Math.floor),
  note: z.string().max(1000).nullable(),
  createdAt: z.string().datetime(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authedUser(req);
  if (!auth.ok) return auth.response;
  try {
    const { id } = await params;
    if (!id || id.length > 100) return withCors(err("Invalid id", 400));
    const body = bodySchema.safeParse(await req.json().catch(() => null));
    if (!body.success) return withCors(err("Invalid request body", 400));

    const lecture = await db.query.lectures.findFirst({
      where: and(
        eq(lectures.id, body.data.lectureId),
        eq(lectures.status, "published"),
        isNull(lectures.deletedAt),
      ),
      columns: { id: true },
    });
    if (!lecture) return withCors(err("Lecture not found", 404));

    const [{ value } = { value: 0 }] = await db
      .select({ value: count() })
      .from(timestampBookmarks)
      .where(eq(timestampBookmarks.userId, auth.userId));
    if (value >= MAX_PER_USER)
      return withCors(err("Bookmark limit reached", 409));

    await db
      .insert(timestampBookmarks)
      .values({
        id,
        userId: auth.userId,
        lectureId: body.data.lectureId,
        timestampSecs: body.data.timestampSecs,
        note: body.data.note,
        createdAt: clientDate(body.data.createdAt),
      })
      .onConflictDoNothing({
        target: [timestampBookmarks.userId, timestampBookmarks.id],
      });

    return withCors(ok({ saved: true }));
  } catch (e) {
    console.error("[PUT /api/v1/me/timestamp-bookmarks/:id]", e);
    return withCors(err("Failed to save bookmark", 500));
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authedUser(req);
  if (!auth.ok) return auth.response;
  try {
    const { id } = await params;
    await db
      .delete(timestampBookmarks)
      .where(
        and(
          eq(timestampBookmarks.userId, auth.userId),
          eq(timestampBookmarks.id, id),
        ),
      );
    return withCors(ok({ deleted: true }));
  } catch (e) {
    console.error("[DELETE /api/v1/me/timestamp-bookmarks/:id]", e);
    return withCors(err("Failed to delete bookmark", 500));
  }
}
