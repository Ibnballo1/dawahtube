import { pgTable, varchar, text, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { contentStatusEnum } from "./enums";
import {
  idColumn,
  auditTimestamps,
  softDelete,
  defaultLanguageColumn,
  publishingColumns,
} from "./helpers";
import { mediaAssets } from "./media-assets";
import { scholars } from "./scholars";

// ─────────────────────────────────────────────────────────────────────────────
// REMINDERS
//
// Short-form Islamic reminders displayed on the homepage and as a
// daily notification (future). Content stored as MDX for rich formatting
// support (Arabic verse embedding, hadith blocks, etc.)
//
// source: the Qur'anic verse, hadith, or scholar quote this reminder
//   is derived from. Plain text reference, e.g. "Surah Al-Baqarah 2:286"
//
// One reminder is displayed at a time on the homepage (via featured_slots).
// The collection grows over time and can be scheduled in rotation.
// ─────────────────────────────────────────────────────────────────────────────
export const reminders = pgTable(
  "reminders",
  {
    id: idColumn(),

    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(), // MDX
    source: varchar("source", { length: 512 }),

    // Optional scholar attribution
    scholarId: text("scholar_id").references(() => scholars.id, {
      onDelete: "set null",
    }),

    // Optional decorative image
    imageAssetId: text("image_asset_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),

    // Lifecycle
    status: contentStatusEnum("status").notNull().default("draft"),
    ...publishingColumns(),

    // i18n
    ...defaultLanguageColumn(),

    ...auditTimestamps(),
    ...softDelete(),
  },
  (t) => [
    index("reminders_status_idx").on(t.status),
    index("reminders_published_at_idx").on(t.publishedAt),
    index("reminders_scholar_id_idx").on(t.scholarId),
    index("reminders_deleted_at_idx").on(t.deletedAt),
  ],
);

export const remindersRelations = relations(reminders, ({ one }) => ({
  scholar: one(scholars, {
    fields: [reminders.scholarId],
    references: [scholars.id],
  }),
  imageAsset: one(mediaAssets, {
    fields: [reminders.imageAssetId],
    references: [mediaAssets.id],
  }),
}));
