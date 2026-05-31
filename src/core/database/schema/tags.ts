import {
  pgTable,
  varchar,
  text,
  index,
  uniqueIndex,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  idColumn,
  auditTimestamps,
  slugColumn,
  seoColumns,
  softDelete,
} from "./helpers";

// ─────────────────────────────────────────────────────────────────────────────
// TAGS
//
// A single tags table shared across all content types.
// This enables cross-entity tag search: searching "Tawheed" returns
// lectures, articles, AND books tagged with it.
//
// Join tables (lecture_tags, article_tags, book_tags) are defined in
// their respective schema files to keep domain boundaries clean.
// ─────────────────────────────────────────────────────────────────────────────
export const tags = pgTable(
  "tags",
  {
    id: idColumn(),
    slug: slugColumn(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    usageCount: integer("usage_count").notNull().default(0),
    arabicName: varchar("arabic_name", {
      length: 255,
    }),
    isFeatured: boolean("is_featured").notNull().default(false),
    ...auditTimestamps(),
    ...seoColumns(),
    ...softDelete(),
  },
  (t) => [
    uniqueIndex("tags_slug_uidx").on(t.slug),
    index("tags_slug_idx").on(t.slug),
    index("tags_name_idx").on(t.name),
    index("tags_usage_count_idx").on(t.usageCount),
    index("tags_is_featured_idx").on(t.isFeatured),
    index("tags_deleted_at_idx").on(t.deletedAt),
  ],
);

export const tagsRelations = relations(tags, ({ many }) => ({
  // Back-references populated by lecture/article/book tag join tables
}));
