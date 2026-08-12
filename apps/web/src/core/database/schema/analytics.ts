import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { idColumn } from "./helpers";
import { lectures } from "./lectures";
import { articles } from "./articles";
import { books } from "./books";
import { reminders } from "./reminders";
import { user } from "./auth";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN NOTES — ANALYTICS TABLES
//
// 1. Append-only. No updates, no deletes in normal operation.
//    Background jobs read these tables to update denormalised counts.
//
// 2. sessionId: anonymous identifier stored in the browser (sessionStorage).
//    NOT a user session ID — it is generated client-side with nanoid and
//    is ephemeral. No PII stored. Not linked to the BetterAuth sessions table.
//
// 3. userId: nullable. Set only if the user is authenticated when the event fires.
//    Used for "you've already downloaded this" UX, not for tracking.
//
// 4. Unique constraints on (entity_id, session_id):
//    - lecture_views:  prevents one page refresh = two view counts
//    - article_views:  same
//    - book_downloads: NOT unique — a user can download multiple times
//
// 5. ON DELETE SET NULL for entity FKs:
//    If a lecture is hard-deleted, historical view data is preserved
//    with a NULL lecture_id. Useful for reporting total platform traffic.
//    In practice, content is soft-deleted so this rarely fires.
//
// 6. createdAt only (no updatedAt) — these rows never change.
//
// 7. Partitioning: at very high volume (millions of rows), partition by
//    created_at month (PARTITION BY RANGE). Not needed for MVP.
//    The schema is compatible with Postgres table partitioning when needed.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// LECTURE_VIEWS
// ─────────────────────────────────────────────────────────────────────────────
export const lectureViews = pgTable(
  "lecture_views",
  {
    id: idColumn(),
    lectureId: text("lecture_id").references(() => lectures.id, {
      onDelete: "set null",
    }),
    sessionId: text("session_id").notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    durationSecs: integer("duration_secs"),
    referrer: text("referrer"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    // Deduplication: one view record per (lecture, session)
    uniqueIndex("lecture_views_lecture_session_uidx").on(
      t.lectureId,
      t.sessionId,
    ),
    index("lecture_views_lecture_id_idx").on(t.lectureId),
    index("lecture_views_user_id_idx").on(t.userId),
    // Time-based aggregation queries (daily/weekly/monthly counts)
    index("lecture_views_created_at_idx").on(t.createdAt),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// ARTICLE_VIEWS
// ─────────────────────────────────────────────────────────────────────────────
export const articleViews = pgTable(
  "article_views",
  {
    id: idColumn(),
    articleId: text("article_id").references(() => articles.id, {
      onDelete: "set null",
    }),
    sessionId: text("session_id").notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    referrer: text("referrer"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    uniqueIndex("article_views_article_session_uidx").on(
      t.articleId,
      t.sessionId,
    ),
    index("article_views_article_id_idx").on(t.articleId),
    index("article_views_user_id_idx").on(t.userId),
    index("article_views_created_at_idx").on(t.createdAt),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// BOOK_DOWNLOADS
// Not unique — user can legitimately download multiple times.
// Track each download separately for accurate download count reporting.
// ─────────────────────────────────────────────────────────────────────────────
export const bookDownloads = pgTable(
  "book_downloads",
  {
    id: idColumn(),
    bookId: text("book_id").references(() => books.id, {
      onDelete: "set null",
    }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    sessionId: text("session_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index("book_downloads_book_id_idx").on(t.bookId),
    index("book_downloads_user_id_idx").on(t.userId),
    index("book_downloads_created_at_idx").on(t.createdAt),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// DAILY_REMINDER_VIEWS
// Tracks which reminders have been seen — enables "don't repeat today's
// reminder" UX and popularity metrics for the reminder collection.
// ─────────────────────────────────────────────────────────────────────────────
export const dailyReminderViews = pgTable(
  "daily_reminder_views",
  {
    id: idColumn(),
    reminderId: text("reminder_id").references(() => reminders.id, {
      onDelete: "set null",
    }),
    sessionId: text("session_id").notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    uniqueIndex("reminder_views_reminder_session_uidx").on(
      t.reminderId,
      t.sessionId,
    ),
    index("reminder_views_reminder_id_idx").on(t.reminderId),
    index("reminder_views_created_at_idx").on(t.createdAt),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// RELATIONS (back-references for Drizzle query builder)
// ─────────────────────────────────────────────────────────────────────────────
export const lectureViewsRelations = relations(lectureViews, ({ one }) => ({
  lecture: one(lectures, {
    fields: [lectureViews.lectureId],
    references: [lectures.id],
  }),
  user: one(user, { fields: [lectureViews.userId], references: [user.id] }),
}));

export const articleViewsRelations = relations(articleViews, ({ one }) => ({
  article: one(articles, {
    fields: [articleViews.articleId],
    references: [articles.id],
  }),
  user: one(user, { fields: [articleViews.userId], references: [user.id] }),
}));

export const bookDownloadsRelations = relations(bookDownloads, ({ one }) => ({
  book: one(books, { fields: [bookDownloads.bookId], references: [books.id] }),
  user: one(user, { fields: [bookDownloads.userId], references: [user.id] }),
}));

export const dailyReminderViewsRelations = relations(
  dailyReminderViews,
  ({ one }) => ({
    reminder: one(reminders, {
      fields: [dailyReminderViews.reminderId],
      references: [reminders.id],
    }),
    user: one(user, {
      fields: [dailyReminderViews.userId],
      references: [user.id],
    }),
  }),
);
