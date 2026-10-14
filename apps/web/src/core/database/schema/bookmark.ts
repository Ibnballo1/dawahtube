import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth"; // Your BetterAuth user schema
import { lectures } from "./lectures";
import { relations } from "drizzle-orm/relations";

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lectureId: text("lecture_id")
      .notNull()
      .references(() => lectures.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("bookmarks_user_lecture_unique").on(
      table.userId,
      table.lectureId,
    ),
  ],
);

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(user, {
    fields: [bookmarks.userId],
    references: [user.id],
  }),
  lecture: one(lectures, {
    fields: [bookmarks.lectureId],
    references: [lectures.id],
  }),
}));
