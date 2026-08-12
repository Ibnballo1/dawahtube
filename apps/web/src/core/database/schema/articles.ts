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
import { scholars } from "./scholars";
import { mediaAssets } from "./media-assets";
import { tags } from "./tags";
import { user } from "./auth";
import { customType } from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// ARTICLE_CATEGORIES
// Same self-referencing pattern as lecture_categories.
// ─────────────────────────────────────────────────────────────────────────────
export const articleCategories = pgTable(
  "article_categories",
  {
    id: idColumn(),
    slug: slugColumn(),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description"),
    parentId: varchar("parent_id", { length: 26 }).references(
      (): AnyPgColumn => articleCategories.id,
      { onDelete: "restrict" },
    ),
    position: smallint("position").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...auditTimestamps(),
  },
  (t) => [
    uniqueIndex("article_categories_slug_uidx").on(t.slug),
    index("article_categories_parent_id_idx").on(t.parentId),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// ARTICLES
//
// content: MDX string. Authored via Tiptap in admin, serialised to MDX,
//   rendered server-side via next-mdx-remote/rsc on the public page.
// excerpt: plain text summary — used in listings, OG cards, and FTS.
// readingTimeMins: estimated reading time — calculated on save, stored for
//   display. Calculation: word_count / 200 (average reading speed, rounded up).
// coverAssetId: hero image for the article.
// authorId: the user who wrote/uploaded this article (may differ from scholar).
//   An editor uploads an article by a scholar — scholarId = scholar,
//   authorId = editor user account.
// ─────────────────────────────────────────────────────────────────────────────
export const articles = pgTable(
  "articles",
  {
    id: idColumn(),
    slug: slugColumn(),
    ...canonicalSlugColumn(),

    title: varchar("title", { length: 255 }).notNull(),
    excerpt: text("excerpt"),
    content: text("content"), // MDX

    // Associations
    scholarId: varchar("scholar_id", { length: 26 }).references(
      () => scholars.id,
      { onDelete: "restrict" },
    ),
    categoryId: varchar("category_id", { length: 26 }).references(
      () => articleCategories.id,
      { onDelete: "restrict" },
    ),

    // The user account that manages this article in the admin
    authorId: varchar("author_id", { length: 26 }).references(() => user.id, {
      onDelete: "set null",
    }),

    // Cover image
    coverAssetId: varchar("cover_asset_id", { length: 26 }).references(
      () => mediaAssets.id,
      { onDelete: "set null" },
    ),

    // Computed content metadata
    readingTimeMins: smallint("reading_time_mins").notNull().default(1),
    wordCount: integer("word_count").notNull().default(0),

    // Lifecycle
    status: contentStatusEnum("status").notNull().default("draft"),
    ...publishingColumns(),

    // Flags
    ...featuredColumn(),

    // i18n
    ...defaultLanguageColumn(),

    // SEO
    ...seoColumns(),

    // Full text search vector — maintained by DB trigger
    // Weight breakdown: title=A, excerpt=B, content=C
    searchVector: tsvector("search_vector"),

    // Denormalised view count — updated by background job from article_views
    ...viewCountColumn(),

    ...auditTimestamps(),
    ...softDelete(),
  },
  (t) => [
    uniqueIndex("articles_slug_uidx").on(t.slug),
    index("articles_scholar_id_idx").on(t.scholarId),
    index("articles_category_id_idx").on(t.categoryId),
    index("articles_author_id_idx").on(t.authorId),
    index("articles_status_published_at_idx").on(t.status, t.publishedAt),
    index("articles_is_featured_idx").on(t.isFeatured),
    index("articles_scheduled_at_idx").on(t.scheduledAt),
    index("articles_deleted_at_idx").on(t.deletedAt),
    index("articles_search_idx").using("gin", t.searchVector),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// ARTICLE_TAGS
// ─────────────────────────────────────────────────────────────────────────────
export const articleTags = pgTable(
  "article_tags",
  {
    articleId: varchar("article_id", { length: 26 })
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: varchar("tag_id", { length: 26 })
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    ...auditTimestamps(),
  },
  (t) => [
    primaryKey({ columns: [t.articleId, t.tagId] }),
    index("article_tags_tag_id_idx").on(t.tagId),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// ARTICLE_TRANSLATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const articleTranslations = pgTable(
  "article_translations",
  {
    id: idColumn(),
    articleId: varchar("article_id", { length: 26 })
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    languageCode: languageCodeEnum("language_code").notNull(),

    title: varchar("title", { length: 255 }),
    excerpt: text("excerpt"),
    content: text("content"), // MDX
    metaTitle: varchar("meta_title", { length: 60 }),
    metaDescription: varchar("meta_description", { length: 160 }),

    ...auditTimestamps(),
  },
  (t) => [
    uniqueIndex("article_translations_article_lang_uidx").on(
      t.articleId,
      t.languageCode,
    ),
    index("article_translations_article_id_idx").on(t.articleId),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const articleCategoriesRelations = relations(
  articleCategories,
  ({ one, many }) => ({
    parent: one(articleCategories, {
      fields: [articleCategories.parentId],
      references: [articleCategories.id],
    }),
    children: many(articleCategories),
    articles: many(articles),
  }),
);

export const articlesRelations = relations(articles, ({ one, many }) => ({
  scholar: one(scholars, {
    fields: [articles.scholarId],
    references: [scholars.id],
  }),
  category: one(articleCategories, {
    fields: [articles.categoryId],
    references: [articleCategories.id],
  }),
  author: one(user, { fields: [articles.authorId], references: [user.id] }),
  coverAsset: one(mediaAssets, {
    fields: [articles.coverAssetId],
    references: [mediaAssets.id],
  }),
  tags: many(articleTags),
  translations: many(articleTranslations),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, { fields: [articleTags.tagId], references: [tags.id] }),
}));

export const articleTranslationsRelations = relations(
  articleTranslations,
  ({ one }) => ({
    article: one(articles, {
      fields: [articleTranslations.articleId],
      references: [articles.id],
    }),
  }),
);
