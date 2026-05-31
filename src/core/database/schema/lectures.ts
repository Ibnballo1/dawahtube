import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  integer,
  smallint,
  boolean,
  vector,
  index,
  uniqueIndex,
  primaryKey,
  bigint,
  AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { contentStatusEnum, languageCodeEnum } from "./enums";
import {
  idColumn,
  auditTimestamps,
  softDelete,
  slugColumn,
  canonicalSlugColumn,
  seoColumns,
  defaultLanguageColumn,
  publishingColumns,
  featuredColumn,
  viewCountColumn,
} from "./helpers";
import { scholars } from "./scholars";
import { mediaAssets } from "./media-assets";
import { tags } from "./tags";
import { customType } from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// LECTURE_CATEGORIES
//
// Self-referencing for one level of nesting:
//   "Aqeedah" (parent) → "Tawheed al-Uluhiyyah" (child)
//
// parent_id = null means it is a root/top-level category.
// Circular references are prevented at the application layer.
// ─────────────────────────────────────────────────────────────────────────────
export const lectureCategories = pgTable(
  "lecture_categories",
  {
    id: idColumn(),
    slug: slugColumn(),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description"),
    parentId: text("parent_id").references(
      (): AnyPgColumn => lectureCategories.id,
      {
        onDelete: "restrict",
      },
    ),
    iconName: varchar("icon_name", { length: 50 }),
    position: smallint("position").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...auditTimestamps(),
  },
  (t) => [
    uniqueIndex("lecture_categories_slug_uidx").on(t.slug),
    index("lecture_categories_parent_id_idx").on(t.parentId),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// LECTURES
//
// Core content entity. A lecture can have:
//   - Audio only (most common)
//   - Video only
//   - Both audio and video (different quality options)
//   - Neither (draft with metadata only)
//
// Media references use asset FKs, not raw keys.
// transcript: full text, stored in DB for FTS indexing.
//   Large transcripts are acceptable — Postgres handles multi-MB text columns.
//   If transcript exceeds 1MB regularly, move to a separate lecture_transcripts
//   table with a 1:1 FK to keep the main lectures row lightweight.
// ─────────────────────────────────────────────────────────────────────────────
export const lectures = pgTable(
  "lectures",
  {
    id: idColumn(),
    slug: slugColumn(),
    ...canonicalSlugColumn(),

    // Core content
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    transcript: text("transcript"), // full transcript for FTS + accessibility
    featuredOrder: smallint("featured_order"),
    speakerName: varchar("speaker_name", {
      length: 255,
    }),
    searchKeywords: text("search_keywords"),

    // Associations
    scholarId: text("scholar_id").references(() => scholars.id, {
      onDelete: "restrict",
    }),
    categoryId: text("category_id").references(() => lectureCategories.id, {
      onDelete: "restrict",
    }),

    // Media assets (all optional — content may be metadata-only in draft)
    audioAssetId: text("audio_asset_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    videoAssetId: text("video_asset_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    thumbnailAssetId: text("thumbnail_asset_id").references(
      () => mediaAssets.id,
      { onDelete: "set null" },
    ),

    // Duration in seconds — denormalised from audio/video asset for fast display
    durationSecs: integer("duration_secs"),

    // Lifecycle
    status: contentStatusEnum("status").notNull().default("draft"),
    ...publishingColumns(),

    // Flags
    ...featuredColumn(),
    allowDownload: boolean("allow_download").notNull().default(true),

    // i18n
    ...defaultLanguageColumn(),

    // SEO
    ...seoColumns(),

    // Full text search vector — maintained by DB trigger
    // Weight breakdown: title=A, description=B, transcript=C
    searchVector: tsvector("search_vector"),

    lectureType: varchar("lecture_type", { length: 32 })
      .default("lecture")
      .notNull(),
    originalLanguage: varchar("original_language", { length: 10 })
      .default("en")
      .notNull(),

    transcriptStatus: varchar("transcript_status", { length: 32 })
      .default("none")
      .notNull(),
    downloadCount: bigint("download_count", { mode: "number" })
      .notNull()
      .default(0),

    // Denormalised view count — updated by background job from lecture_views
    ...viewCountColumn(),

    ...auditTimestamps(),
    ...softDelete(),
  },
  (t) => [
    uniqueIndex("lectures_slug_uidx").on(t.slug),
    index("lectures_scholar_id_idx").on(t.scholarId),
    index("lectures_category_id_idx").on(t.categoryId),
    index("lectures_status_idx").on(t.status),
    // Compound index for the most common public listing query:
    // WHERE status='published' AND deleted_at IS NULL ORDER BY published_at DESC
    index("lectures_status_published_at_idx").on(t.status, t.publishedAt),
    index("lectures_is_featured_idx").on(t.isFeatured),
    index("lectures_scheduled_at_idx").on(t.scheduledAt),
    index("lectures_deleted_at_idx").on(t.deletedAt),
    index("lectures_search_idx").using("gin", t.searchVector),
    index("lectures_duration_idx").on(t.durationSecs),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// LECTURE_TAGS
// Join table — lecture ↔ tag many-to-many
// ─────────────────────────────────────────────────────────────────────────────
export const lectureTags = pgTable(
  "lecture_tags",
  {
    lectureId: text("lecture_id")
      .notNull()
      .references(() => lectures.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    ...auditTimestamps(),
  },
  (t) => [
    primaryKey({ columns: [t.lectureId, t.tagId] }),
    index("lecture_tags_tag_id_idx").on(t.tagId),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// SERIES
//
// An ordered collection of lectures. A lecture can belong to multiple series.
// Series themselves are publishable content with a lifecycle status.
//
// Examples:
//   "Explanation of Kitab at-Tawheed" — 40 lectures in order
//   "Ramadan Reminders 2024"          — seasonal series
//   "Beginner's Guide to Islam"       — curated learning path
// ─────────────────────────────────────────────────────────────────────────────
export const series = pgTable(
  "series",
  {
    id: idColumn(),
    slug: slugColumn(),
    ...canonicalSlugColumn(),

    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),

    scholarId: text("scholar_id").references(() => scholars.id, {
      onDelete: "restrict",
    }),

    featuredOrder: smallint("featured_order"),
    // Cover image
    coverAssetId: text("cover_asset_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    coverAltText: varchar("cover_alt_text", { length: 500 }),

    // Lifecycle
    status: contentStatusEnum("status").notNull().default("draft"),
    ...publishingColumns(),

    // Flags
    ...featuredColumn(),

    // i18n
    ...defaultLanguageColumn(),

    // SEO
    ...seoColumns(),

    // Denormalised item count — updated on series_items insert/delete
    itemCount: smallint("item_count").notNull().default(0),

    ...auditTimestamps(),
    ...softDelete(),
  },
  (t) => [
    uniqueIndex("series_slug_uidx").on(t.slug),
    index("series_scholar_id_idx").on(t.scholarId),
    index("series_status_idx").on(t.status),
    index("series_deleted_at_idx").on(t.deletedAt),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// SERIES_ITEMS
//
// position: smallint (0-based). Admin reorders by updating all affected
// positions in a single transaction. Max 32,767 items per series — more
// than sufficient for any lecture series on this platform.
//
// Why not a linked-list?
// Linked-list ordering (prev_id/next_id) is O(n) to reconstruct and requires
// recursive queries. Positional integers are O(1) to read and O(n) to reorder —
// but reordering is rare and series are small. Simple wins here.
// ─────────────────────────────────────────────────────────────────────────────
export const seriesItems = pgTable(
  "series_items",
  {
    id: idColumn(),
    seriesId: text("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    lectureId: text("lecture_id")
      .notNull()
      .references(() => lectures.id, { onDelete: "cascade" }),
    position: smallint("position").notNull().default(0),
    notes: text("notes"), // admin note for this item in context of the series
    ...auditTimestamps(),
  },
  (t) => [
    // A lecture can only appear once per series
    uniqueIndex("series_items_series_lecture_uidx").on(t.seriesId, t.lectureId),
    // Fast ordered fetch for series page
    index("series_items_series_position_idx").on(t.seriesId, t.position),
    index("series_items_lecture_id_idx").on(t.lectureId),
  ],
);

export const seriesTags = pgTable(
  "series_tags",
  {
    seriesId: text("series_id")
      .notNull()
      .references(() => series.id, {
        onDelete: "cascade",
      }),

    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, {
        onDelete: "cascade",
      }),

    ...auditTimestamps(),
  },
  (t) => [
    primaryKey({
      columns: [t.seriesId, t.tagId],
    }),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// LECTURE_TRANSLATIONS
// Scaffolded for future multilingual support. All columns nullable —
// translations are added incrementally, not all at once.
// ─────────────────────────────────────────────────────────────────────────────
export const lectureTranslations = pgTable(
  "lecture_translations",
  {
    id: idColumn(),
    lectureId: text("lecture_id")
      .notNull()
      .references(() => lectures.id, { onDelete: "cascade" }),
    languageCode: languageCodeEnum("language_code").notNull(),

    // Translatable fields
    title: varchar("title", { length: 255 }),
    description: text("description"),
    transcript: text("transcript"),
    metaTitle: varchar("meta_title", { length: 60 }),
    metaDescription: varchar("meta_description", { length: 160 }),

    ...auditTimestamps(),
  },
  (t) => [
    uniqueIndex("lecture_translations_lecture_lang_uidx").on(
      t.lectureId,
      t.languageCode,
    ),
    index("lecture_translations_lecture_id_idx").on(t.lectureId),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const lectureCategoriesRelations = relations(
  lectureCategories,
  ({ one, many }) => ({
    parent: one(lectureCategories, {
      fields: [lectureCategories.parentId],
      references: [lectureCategories.id],
    }),
    children: many(lectureCategories),
    lectures: many(lectures),
  }),
);

export const lecturesRelations = relations(lectures, ({ one, many }) => ({
  scholar: one(scholars, {
    fields: [lectures.scholarId],
    references: [scholars.id],
  }),
  category: one(lectureCategories, {
    fields: [lectures.categoryId],
    references: [lectureCategories.id],
  }),
  audioAsset: one(mediaAssets, {
    fields: [lectures.audioAssetId],
    references: [mediaAssets.id],
  }),
  videoAsset: one(mediaAssets, {
    fields: [lectures.videoAssetId],
    references: [mediaAssets.id],
  }),
  thumbnailAsset: one(mediaAssets, {
    fields: [lectures.thumbnailAssetId],
    references: [mediaAssets.id],
  }),
  tags: many(lectureTags),
  seriesItems: many(seriesItems),
  translations: many(lectureTranslations),
}));

export const lectureTagsRelations = relations(lectureTags, ({ one }) => ({
  lecture: one(lectures, {
    fields: [lectureTags.lectureId],
    references: [lectures.id],
  }),
  tag: one(tags, { fields: [lectureTags.tagId], references: [tags.id] }),
}));

export const seriesRelations = relations(series, ({ one, many }) => ({
  scholar: one(scholars, {
    fields: [series.scholarId],
    references: [scholars.id],
  }),
  coverAsset: one(mediaAssets, {
    fields: [series.coverAssetId],
    references: [mediaAssets.id],
  }),
  items: many(seriesItems),
}));

export const seriesItemsRelations = relations(seriesItems, ({ one }) => ({
  series: one(series, {
    fields: [seriesItems.seriesId],
    references: [series.id],
  }),
  lecture: one(lectures, {
    fields: [seriesItems.lectureId],
    references: [lectures.id],
  }),
}));

export const lectureTranslationsRelations = relations(
  lectureTranslations,
  ({ one }) => ({
    lecture: one(lectures, {
      fields: [lectureTranslations.lectureId],
      references: [lectures.id],
    }),
  }),
);
