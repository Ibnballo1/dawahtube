import {
  pgTable,
  text,
  integer,
  timestamp,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { lectures } from "./lectures";

export const timestampBookmarks = pgTable(
  "timestamp_bookmarks",
  {
    id: text("id").notNull(), // client-generated; unique per user, not globally
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lectureId: text("lecture_id")
      .notNull()
      .references(() => lectures.id, { onDelete: "cascade" }),
    timestampSecs: integer("timestamp_secs").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    index("timestamp_bookmarks_user_lecture_idx").on(t.userId, t.lectureId),
  ],
);

export const timestampBookmarksRelations = relations(
  timestampBookmarks,
  ({ one }) => ({
    user: one(user, {
      fields: [timestampBookmarks.userId],
      references: [user.id],
    }),
    lecture: one(lectures, {
      fields: [timestampBookmarks.lectureId],
      references: [lectures.id],
    }),
  }),
);
