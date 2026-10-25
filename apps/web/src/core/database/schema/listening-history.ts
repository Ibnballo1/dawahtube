import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth"; // Your BetterAuth user schema
import { lectures } from "./lectures";
import { relations } from "drizzle-orm";

export const listeningHistory = pgTable(
  "listening_history",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lectureId: text("lecture_id")
      .notNull()
      .references(() => lectures.id, { onDelete: "cascade" }),
    playedAt: timestamp("played_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    progressSecs: integer("progress_secs").notNull().default(0),
    completed: boolean("completed").notNull().default(false),
  },
  (table) => [
    uniqueIndex("listening_history_user_lecture_unique").on(
      table.userId,
      table.lectureId,
    ),
    index("listening_history_user_played_idx").on(table.userId, table.playedAt),
  ],
);

export const listeningHistoryRelations = relations(
  listeningHistory,
  ({ one }) => ({
    user: one(user, {
      fields: [listeningHistory.userId],
      references: [user.id],
    }),
    lecture: one(lectures, {
      fields: [listeningHistory.lectureId],
      references: [lectures.id],
    }),
  }),
);
