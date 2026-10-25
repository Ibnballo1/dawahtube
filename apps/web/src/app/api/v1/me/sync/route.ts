import { type NextRequest } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@core/database/client";
import {
  bookmarks,
  listeningHistory,
  timestampBookmarks,
  lectures,
} from "@core/database/schema";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { ok, err, withCors, OPTIONS } from "../../_helpers";
import { authedUser, clientDate } from "../_common";
import {
  loadBookmarks,
  loadHistory,
  loadTimestampBookmarks,
} from "../_queries";

export { OPTIONS };

const lectureId = z.string().min(1).max(100);
const secs = z.number().min(0).max(86_400).transform(Math.floor);
const iso = z.string().datetime();

const bodySchema = z.object({
  bookmarks: z.array(z.object({ lectureId, createdAt: iso })).max(500),
  history: z
    .array(
      z.object({
        lectureId,
        progressSecs: secs,
        completed: z.boolean(),
        playedAt: iso,
      }),
    )
    .max(500),
  timestampBookmarks: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        lectureId,
        timestampSecs: secs,
        note: z.string().max(1000).nullable(),
        createdAt: iso,
      }),
    )
    .max(500),
});

// Duplicate keys inside one bulk upsert make Postgres error out; keep one per key.
function dedupe<T>(
  items: T[],
  key: (t: T) => string,
  prefer?: (a: T, b: T) => T,
): T[] {
  const map = new Map<string, T>();
  for (const item of items) {
    const k = key(item);
    const existing = map.get(k);
    map.set(k, existing && prefer ? prefer(existing, item) : item);
  }
  return [...map.values()];
}

export async function POST(req: NextRequest) {
  const auth = await authedUser(req);
  if (!auth.ok) return auth.response;
  const userId = auth.userId;

  try {
    const body = bodySchema.safeParse(await req.json().catch(() => null));
    if (!body.success) return withCors(err("Invalid request body", 400));
    const { bookmarks: bm, history: hist, timestampBookmarks: tb } = body.data;

    // Drop anything pointing at lectures that no longer exist or aren't public.
    const ids = [...new Set([...bm, ...hist, ...tb].map((x) => x.lectureId))];
    const validRows = ids.length
      ? await db
          .select({ id: lectures.id })
          .from(lectures)
          .where(
            and(
              inArray(lectures.id, ids),
              eq(lectures.status, "published"),
              isNull(lectures.deletedAt),
            ),
          )
      : [];
    const valid = new Set(validRows.map((r) => r.id));

    const bmRows = dedupe(
      bm.filter((b) => valid.has(b.lectureId)),
      (b) => b.lectureId,
    );
    const histRows = dedupe(
      hist.filter((h) => valid.has(h.lectureId)),
      (h) => h.lectureId,
      (a, b) => (new Date(a.playedAt) >= new Date(b.playedAt) ? a : b),
    );
    const tbRows = dedupe(
      tb.filter((t) => valid.has(t.lectureId)),
      (t) => t.id,
    );

    if (bmRows.length) {
      await db
        .insert(bookmarks)
        .values(
          bmRows.map((b) => ({
            id: `bm_${nanoid(16)}`,
            userId,
            lectureId: b.lectureId,
            createdAt: clientDate(b.createdAt),
          })),
        )
        .onConflictDoNothing({
          target: [bookmarks.userId, bookmarks.lectureId],
        });
    }

    if (histRows.length) {
      await db
        .insert(listeningHistory)
        .values(
          histRows.map((h) => ({
            id: `lh_${nanoid(16)}`,
            userId,
            lectureId: h.lectureId,
            playedAt: clientDate(h.playedAt),
            progressSecs: h.progressSecs,
            completed: h.completed,
          })),
        )
        .onConflictDoUpdate({
          target: [listeningHistory.userId, listeningHistory.lectureId],
          set: {
            playedAt: sql`excluded.played_at`,
            progressSecs: sql`excluded.progress_secs`,
            completed: sql`excluded.completed`,
          },
          setWhere: sql`${listeningHistory.playedAt} < excluded.played_at`,
        });
    }

    if (tbRows.length) {
      await db
        .insert(timestampBookmarks)
        .values(
          tbRows.map((t) => ({
            id: t.id,
            userId,
            lectureId: t.lectureId,
            timestampSecs: t.timestampSecs,
            note: t.note,
            createdAt: clientDate(t.createdAt),
          })),
        )
        .onConflictDoNothing({
          target: [timestampBookmarks.userId, timestampBookmarks.id],
        });
    }

    const [mergedBookmarks, mergedHistory, mergedTimestamps] =
      await Promise.all([
        loadBookmarks(userId),
        loadHistory(userId),
        loadTimestampBookmarks(userId),
      ]);

    return withCors(
      ok({
        bookmarks: mergedBookmarks,
        history: mergedHistory,
        timestampBookmarks: mergedTimestamps,
        skipped: {
          bookmarks: bm.length - bmRows.length,
          history: hist.length - histRows.length,
          timestampBookmarks: tb.length - tbRows.length,
        },
      }),
    );
  } catch (e) {
    console.error("[POST /api/v1/me/sync]", e);
    return withCors(err("Sync failed", 500));
  }
}
