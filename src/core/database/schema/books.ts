import {
  pgTable,
  varchar,
  text,
  integer,
  smallint,
  boolean,
  index,
  uniqueIndex,
  primaryKey,
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
import { mediaAssets } from "./media-assets";
import { tags } from "./tags";
import { customType } from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// BOOK_CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
export const bookCategories = pgTable(
  "book_categories",
  {
    id: idColumn(),
    slug: slugColumn(),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description"),
    parentId: varchar("parent_id", { length: 26 }).references(
      (): AnyPgColumn => bookCategories.id,
      { onDelete: "restrict" },
    ),
    position: smallint("position").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...auditTimestamps(),
  },
  (t) => [
    uniqueIndex("book_categories_slug_uidx").on(t.slug),
    index("book_categories_parent_id_idx").on(t.parentId),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// BOOKS
//
// A book is a PDF document in the Islamic library.
// The PDF is stored in the dawahtube-books R2 bucket (private).
// Reads are served via presigned GET URLs with a 1-hour expiry.
//
// previewAssetId: a public low-res preview PDF (first few pages) for
//   anonymous users. Full PDF requires sign-in or is freely available
//   based on allowFreeDownload.
//
// authorName: denormalised — the historical author of the book
//   (e.g. "Ibn Taymiyyah"). This is NOT a FK to scholars — scholars
//   are living/contemporary figures on the platform. Historical authors
//   are referenced by name only.
//
// translator: name of the English/Hausa translator if applicable.
//
// pageCount: extracted from PDF metadata on upload.
// publishYear: the original publication year of the book (not upload year).
// ─────────────────────────────────────────────────────────────────────────────
export const books = pgTable(
  "books",
  {
    id: idColumn(),
    slug: slugColumn(),
    ...canonicalSlugColumn(),

    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),

    // Authorship (historical, not platform user)
    authorName: varchar("author_name", { length: 255 }),
    translator: varchar("translator", { length: 255 }),
    publishYear: smallint("publish_year"),

    // Category
    categoryId: varchar("category_id", { length: 26 }).references(
      () => bookCategories.id,
      { onDelete: "restrict" },
    ),

    // PDF assets
    pdfAssetId: varchar("pdf_asset_id", { length: 26 }).references(
      () => mediaAssets.id,
      { onDelete: "restrict" },
    ),
    previewAssetId: varchar("preview_asset_id", { length: 26 }).references(
      () => mediaAssets.id,
      { onDelete: "set null" },
    ),
    coverAssetId: varchar("cover_asset_id", { length: 26 }).references(
      () => mediaAssets.id,
      { onDelete: "set null" },
    ),

    // Book metadata
    pageCount: integer("page_count"),
    language: varchar("language", { length: 10 }).notNull().default("en"),
    allowFreeDownload: boolean("allow_free_download").notNull().default(true),

    // Lifecycle
    status: contentStatusEnum("status").notNull().default("draft"),
    ...publishingColumns(),

    // Flags
    ...featuredColumn(),

    // i18n
    ...defaultLanguageColumn(),

    // SEO
    ...seoColumns(),

    // Full text search vector — title=A, author=A, description=B
    searchVector: tsvector("search_vector"),

    // Denormalised download count
    ...viewCountColumn(),

    ...auditTimestamps(),
    ...softDelete(),
  },
  (t) => [
    uniqueIndex("books_slug_uidx").on(t.slug),
    index("books_category_id_idx").on(t.categoryId),
    index("books_author_name_idx").on(t.authorName),
    index("books_status_published_at_idx").on(t.status, t.publishedAt),
    index("books_is_featured_idx").on(t.isFeatured),
    index("books_allow_free_download_idx").on(t.allowFreeDownload),
    index("books_deleted_at_idx").on(t.deletedAt),
    index("books_search_idx").using("gin", t.searchVector),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// BOOK_TAGS
// ─────────────────────────────────────────────────────────────────────────────
export const bookTags = pgTable(
  "book_tags",
  {
    bookId: varchar("book_id", { length: 26 })
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    tagId: varchar("tag_id", { length: 26 })
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    ...auditTimestamps(),
  },
  (t) => [
    primaryKey({ columns: [t.bookId, t.tagId] }),
    index("book_tags_tag_id_idx").on(t.tagId),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// BOOK_TRANSLATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const bookTranslations = pgTable(
  "book_translations",
  {
    id: idColumn(),
    bookId: varchar("book_id", { length: 26 })
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    languageCode: languageCodeEnum("language_code").notNull(),

    title: varchar("title", { length: 255 }),
    description: text("description"),
    metaTitle: varchar("meta_title", { length: 60 }),
    metaDescription: varchar("meta_description", { length: 160 }),

    ...auditTimestamps(),
  },
  (t) => [
    uniqueIndex("book_translations_book_lang_uidx").on(
      t.bookId,
      t.languageCode,
    ),
    index("book_translations_book_id_idx").on(t.bookId),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const bookCategoriesRelations = relations(
  bookCategories,
  ({ one, many }) => ({
    parent: one(bookCategories, {
      fields: [bookCategories.parentId],
      references: [bookCategories.id],
    }),
    children: many(bookCategories),
    books: many(books),
  }),
);

export const booksRelations = relations(books, ({ one, many }) => ({
  category: one(bookCategories, {
    fields: [books.categoryId],
    references: [bookCategories.id],
  }),
  pdfAsset: one(mediaAssets, {
    fields: [books.pdfAssetId],
    references: [mediaAssets.id],
  }),
  previewAsset: one(mediaAssets, {
    fields: [books.previewAssetId],
    references: [mediaAssets.id],
  }),
  coverAsset: one(mediaAssets, {
    fields: [books.coverAssetId],
    references: [mediaAssets.id],
  }),
  tags: many(bookTags),
  translations: many(bookTranslations),
}));

export const bookTagsRelations = relations(bookTags, ({ one }) => ({
  book: one(books, { fields: [bookTags.bookId], references: [books.id] }),
  tag: one(tags, { fields: [bookTags.tagId], references: [tags.id] }),
}));

export const bookTranslationsRelations = relations(
  bookTranslations,
  ({ one }) => ({
    book: one(books, {
      fields: [bookTranslations.bookId],
      references: [books.id],
    }),
  }),
);
