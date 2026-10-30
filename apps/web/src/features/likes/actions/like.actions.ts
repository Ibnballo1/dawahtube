// src/features/likes/actions/like.actions.ts
"use server";

import { db } from "@core/database/client";
import {
  likes,
  lectures,
  articles,
  books,
  reminders,
} from "@core/database/schema";
import { eq, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import auth from "@core/auth/config";

type EntityType = "lecture" | "article" | "book" | "reminder";

interface LikeResult {
  ok: boolean;
  liked: boolean; // true = now liked, false = now unliked
  likeCount: number;
  error?: string;
}

// ─── Get or create anonymous session ID ───────────────────────────────────────

async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get("dw_sid")?.value;

  if (existing) return existing;

  // Create a new session ID and persist it in a cookie
  const newId = nanoid(21);
  cookieStore.set("dw_sid", newId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  return newId;
}

// ─── Get current user ID (if authenticated) ───────────────────────────────────

async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth.api
      .getSession({ headers: await headers() })
      .catch(() => null);
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

// ─── Get the right table for a content type ───────────────────────────────────

function getContentTable(type: EntityType) {
  switch (type) {
    case "lecture":
      return lectures;
    case "article":
      return articles;
    case "book":
      return books;
    case "reminder":
      return reminders;
  }
}

// ─── Toggle like ─────────────────────────────────────────────────────────────

export async function toggleLike(
  entityType: EntityType,
  entityId: string,
): Promise<LikeResult> {
  try {
    const [sessionId, userId] = await Promise.all([
      getSessionId(),
      getCurrentUserId(),
    ]);

    const table = getContentTable(entityType);

    // Check if already liked
    const existing = await db.query.likes.findFirst({
      where: userId
        ? // Authenticated — match by user_id
          and(
            eq(likes.entityType, entityType),
            eq(likes.entityId, entityId),
            eq(likes.userId, userId),
          )
        : // Anonymous — match by session_id
          and(
            eq(likes.entityType, entityType),
            eq(likes.entityId, entityId),
            eq(likes.sessionId, sessionId),
          ),
    });

    if (existing) {
      // ── Unlike ─────────────────────────────────────────────────────────────
      await db.delete(likes).where(eq(likes.id, existing.id));

      const updated = await db
        .update(table)
        .set({ likeCount: sql`GREATEST(${table.likeCount} - 1, 0)` })
        .where(eq(table.id, entityId))
        .returning({ likeCount: table.likeCount });

      return {
        ok: true,
        liked: false,
        likeCount: updated[0]?.likeCount ?? 0,
      };
    }

    // ── Like ──────────────────────────────────────────────────────────────────

    // If authenticated, remove any existing anonymous like from same session
    // so we don't double-count when a guest signs in
    if (userId) {
      const anonLike = await db.query.likes.findFirst({
        where: and(
          eq(likes.entityType, entityType),
          eq(likes.entityId, entityId),
          eq(likes.sessionId, sessionId),
        ),
      });
      if (anonLike && !anonLike.userId) {
        // Upgrade the anonymous like to an authenticated one
        await db.update(likes).set({ userId }).where(eq(likes.id, anonLike.id));

        // Count hasn't changed — just return current count
        const current = await db.query.lectures
          .findFirst({
            where: eq(table.id, entityId),
            columns: { likeCount: true },
          })
          .catch(() => null);

        return {
          ok: true,
          liked: true,
          likeCount: (current as { likeCount?: number } | null)?.likeCount ?? 1,
        };
      }
    }

    // Insert new like
    await db.insert(likes).values({
      id: `lk_${nanoid(16)}`,
      entityType,
      entityId,
      userId: userId ?? null,
      sessionId,
    });

    const updated = await db
      .update(table)
      .set({ likeCount: sql`${table.likeCount} + 1` })
      .where(eq(table.id, entityId))
      .returning({ likeCount: table.likeCount });

    return {
      ok: true,
      liked: true,
      likeCount: updated[0]?.likeCount ?? 1,
    };
  } catch (err) {
    console.error("[toggleLike]", err);
    return {
      ok: false,
      liked: false,
      likeCount: 0,
      error: "Failed to update like",
    };
  }
}

// ─── Check if current visitor has liked a specific entity ─────────────────────
// Used to initialise the button state on page load.

export async function getLikeState(
  entityType: EntityType,
  entityId: string,
): Promise<{ liked: boolean; likeCount: number }> {
  try {
    const [sessionId, userId] = await Promise.all([
      getSessionId(),
      getCurrentUserId(),
    ]);

    const table = getContentTable(entityType);

    // Get current like count + check if this visitor has liked
    const existingPromise = db.query.likes.findFirst({
      where: userId
        ? and(
            eq(likes.entityType, entityType),
            eq(likes.entityId, entityId),
            eq(likes.userId, userId),
          )
        : and(
            eq(likes.entityType, entityType),
            eq(likes.entityId, entityId),
            eq(likes.sessionId, sessionId),
          ),
    });

    // Query each table explicitly so TypeScript does not have to call
    // findFirst on a union of incompatible relational query types.
    const rowPromise =
      entityType === "lecture"
        ? db.query.lectures.findFirst({
            where: eq(lectures.id, entityId),
            columns: { likeCount: true },
          })
        : entityType === "article"
          ? db.query.articles.findFirst({
              where: eq(articles.id, entityId),
              columns: { likeCount: true },
            })
          : entityType === "book"
            ? db.query.books.findFirst({
                where: eq(books.id, entityId),
                columns: { likeCount: true },
              })
            : db.query.reminders.findFirst({
                where: eq(reminders.id, entityId),
                columns: { likeCount: true },
              });

    const [existing, row] = await Promise.all([existingPromise, rowPromise]);

    return {
      liked: !!existing,
      likeCount: (row as { likeCount?: number } | null)?.likeCount ?? 0,
    };
  } catch {
    return { liked: false, likeCount: 0 };
  }
}
