// src/features/account/actions/history-bookmark.actions.ts
"use server";

import { db } from "@core/database/client";
import { headers } from "next/headers";
import auth from "@core/auth/config";
import { nanoid } from "nanoid";
import { eq, and, desc, count } from "drizzle-orm";
import { listeningHistory, bookmarks, lectures } from "@core/database/schema";
import { revalidatePath } from "next/cache";

// ─── Get current user ─────────────────────────────────────────────────────────

async function requireUser() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  if (!session?.user) throw new Error("Not authenticated");
  return session.user.id;
}

// ─── Listening history ────────────────────────────────────────────────────────

export async function recordLecturePlay(
  lectureId: string,
  progressSecs: number = 0,
  completed: boolean = false,
): Promise<{ ok: boolean }> {
  try {
    const userId = await requireUser();

    // Upsert — one row per user/lecture, updated on each play
    await db
      .insert(listeningHistory)
      .values({
        id: `lh_${nanoid(16)}`,
        userId,
        lectureId,
        playedAt: new Date(),
        progressSecs,
        completed,
      })
      .onConflictDoUpdate({
        target: [listeningHistory.userId, listeningHistory.lectureId],
        set: {
          playedAt: new Date(),
          progressSecs,
          completed,
        },
      });

    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// src/features/account/actions/history-bookmark.actions.ts

export async function getListeningHistory(limit = 20) {
  try {
    const userId = await requireUser();

    const rows = await db.query.listeningHistory.findMany({
      where: eq(listeningHistory.userId, userId),
      orderBy: [desc(listeningHistory.playedAt)],
      limit,
      with: {
        lecture: {
          columns: {
            id: true,
            slug: true,
            title: true,
            durationSecs: true,
          },
          with: {
            scholar: {
              columns: { id: true, slug: true, name: true, honorifics: true },
            },
            thumbnailAsset: { columns: { publicUrl: true } },
            audioAsset: { columns: { durationSecs: true } },
          },
        },
      },
    });

    return rows;
  } catch {
    return [];
  }
}

export async function clearListeningHistory(): Promise<{ ok: boolean }> {
  try {
    const userId = await requireUser();
    await db
      .delete(listeningHistory)
      .where(eq(listeningHistory.userId, userId));
    revalidatePath("/account/history");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export async function toggleBookmark(
  lectureId: string,
): Promise<{ ok: boolean; bookmarked: boolean }> {
  try {
    const userId = await requireUser();

    const existing = await db.query.bookmarks.findFirst({
      where: and(
        eq(bookmarks.userId, userId),
        eq(bookmarks.lectureId, lectureId),
      ),
    });

    if (existing) {
      await db.delete(bookmarks).where(eq(bookmarks.id, existing.id));
      revalidatePath("/account/bookmarks");
      return { ok: true, bookmarked: false };
    }

    await db.insert(bookmarks).values({
      id: `bm_${nanoid(16)}`,
      userId,
      lectureId,
      createdAt: new Date(),
    });

    revalidatePath("/account/bookmarks");
    return { ok: true, bookmarked: true };
  } catch {
    return { ok: false, bookmarked: false };
  }
}

export async function getBookmarks(limit = 50) {
  try {
    const userId = await requireUser();

    return db.query.bookmarks.findMany({
      where: eq(bookmarks.userId, userId),
      orderBy: [desc(bookmarks.createdAt)],
      limit,
      with: {
        lecture: {
          columns: {
            id: true,
            slug: true,
            title: true,
            durationSecs: true,
          },
          with: {
            scholar: {
              columns: { id: true, slug: true, name: true, honorifics: true },
            },
            thumbnailAsset: { columns: { publicUrl: true } },
            audioAsset: { columns: { durationSecs: true } },
            category: { columns: { id: true, name: true } },
          },
        },
      },
    });
  } catch {
    return [];
  }
}

export async function isBookmarked(lectureId: string): Promise<boolean> {
  try {
    const userId = await requireUser();
    const row = await db.query.bookmarks.findFirst({
      where: and(
        eq(bookmarks.userId, userId),
        eq(bookmarks.lectureId, lectureId),
      ),
      columns: { id: true },
    });
    return !!row;
  } catch {
    return false;
  }
}

export async function removeBookmark(
  lectureId: string,
): Promise<{ ok: boolean }> {
  try {
    const userId = await requireUser();
    await db
      .delete(bookmarks)
      .where(
        and(eq(bookmarks.userId, userId), eq(bookmarks.lectureId, lectureId)),
      );
    revalidatePath("/account/bookmarks");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
