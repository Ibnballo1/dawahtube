import { db } from "@core/database/client";
import {
  bookmarks,
  listeningHistory,
  timestampBookmarks,
} from "@core/database/schema";
import { eq, and, desc } from "drizzle-orm";
import { lectureCardRelation, isAvailable, shapeLectureCard } from "./_shapes";

export async function loadBookmarks(userId: string) {
  const rows = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, userId),
    orderBy: [desc(bookmarks.createdAt)],
    limit: 500,
    with: { lecture: lectureCardRelation },
  });
  return rows.flatMap((r) =>
    isAvailable(r.lecture)
      ? [
          {
            lectureId: r.lectureId,
            createdAt: r.createdAt,
            lecture: shapeLectureCard(r.lecture),
          },
        ]
      : [],
  );
}

export async function loadHistory(userId: string) {
  const rows = await db.query.listeningHistory.findMany({
    where: eq(listeningHistory.userId, userId),
    orderBy: [desc(listeningHistory.playedAt)],
    limit: 200,
    with: { lecture: lectureCardRelation },
  });
  return rows.flatMap((r) =>
    isAvailable(r.lecture)
      ? [
          {
            lectureId: r.lectureId,
            playedAt: r.playedAt,
            progressSecs: r.progressSecs,
            completed: r.completed,
            lecture: shapeLectureCard(r.lecture),
          },
        ]
      : [],
  );
}

export async function loadTimestampBookmarks(
  userId: string,
  lectureId?: string,
) {
  const rows = await db.query.timestampBookmarks.findMany({
    where: lectureId
      ? and(
          eq(timestampBookmarks.userId, userId),
          eq(timestampBookmarks.lectureId, lectureId),
        )
      : eq(timestampBookmarks.userId, userId),
    orderBy: [desc(timestampBookmarks.createdAt)],
    limit: 1000,
    with: {
      lecture: {
        columns: { id: true, title: true, status: true, deletedAt: true },
      },
    },
  });
  return rows.flatMap((r) =>
    r.lecture &&
    r.lecture.status === "published" &&
    r.lecture.deletedAt === null
      ? [
          {
            id: r.id,
            lectureId: r.lectureId,
            lectureTitle: r.lecture.title,
            timestampSecs: r.timestampSecs,
            note: r.note,
            createdAt: r.createdAt,
          },
        ]
      : [],
  );
}
