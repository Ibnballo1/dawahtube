// src/core/database/schema/likes.ts
//
// Likes table — supports both anonymous (session-based) and
// authenticated (user-based) likes across all content types.
//
// ─── How it works ─────────────────────────────────────────────────────────────
//
// Anonymous:    session_id set, user_id null
// Authenticated: user_id set, session_id set (for merge on sign-in)
//
// Unique constraint: one like per (entity_type, entity_id, user_id)
//                and: one like per (entity_type, entity_id, session_id)
// This prevents double-liking while allowing both anonymous and auth likes.
//
// ─── Denormalised counts ───────────────────────────────────────────────────────
// Each content table has a like_count column that is incremented/decremented
// when a like is added or removed. This avoids a COUNT(*) join on every page load.
//
// ─── Run this SQL in Supabase SQL editor ──────────────────────────────────────
/*
-- 1. Create the likes table
CREATE TABLE IF NOT EXISTS "likes" (
  "id"           TEXT PRIMARY KEY,
  "entity_type"  TEXT NOT NULL,   -- 'lecture' | 'article' | 'book' | 'reminder'
  "entity_id"    TEXT NOT NULL,
  "user_id"      TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  "session_id"   TEXT NOT NULL,   -- anonymous session cookie value
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Unique indexes — prevent double-liking
-- One like per authenticated user per entity
CREATE UNIQUE INDEX IF NOT EXISTS likes_user_entity_uidx
  ON likes (entity_type, entity_id, user_id)
  WHERE user_id IS NOT NULL;

-- One like per anonymous session per entity
CREATE UNIQUE INDEX IF NOT EXISTS likes_session_entity_uidx
  ON likes (entity_type, entity_id, session_id)
  WHERE user_id IS NULL;

-- Fast lookup index
CREATE INDEX IF NOT EXISTS likes_entity_idx
  ON likes (entity_type, entity_id);

-- 3. Add like_count column to all content tables
ALTER TABLE lectures  ADD COLUMN IF NOT EXISTS like_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE articles  ADD COLUMN IF NOT EXISTS like_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE books     ADD COLUMN IF NOT EXISTS like_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS like_count INTEGER NOT NULL DEFAULT 0;
*/

import { pgTable, text, timestamp, index, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const likes = pgTable(
  "likes",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type").notNull(), // 'lecture' | 'article' | 'book' | 'reminder'
    entityId: text("entity_id").notNull(),
    userId: text("user_id"), // null for anonymous
    sessionId: text("session_id").notNull(), // always set — anonymous or auth session
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    entityIdx: index("likes_entity_idx").on(t.entityType, t.entityId),
    userEntityUnique: index("likes_user_entity_uidx")
      .on(t.entityType, t.entityId, t.userId)
      .where(sql`user_id IS NOT NULL`),
    sessionEntityUnique: index("likes_session_entity_uidx")
      .on(t.entityType, t.entityId, t.sessionId)
      .where(sql`user_id IS NULL`),
  }),
);

export type Like = typeof likes.$inferSelect;
export type LikeInsert = typeof likes.$inferInsert;
