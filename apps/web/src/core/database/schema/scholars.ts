import {
  pgTable,
  varchar,
  text,
  integer,
  boolean,
  index,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { languageCodeEnum } from "./enums";
import {
  idColumn,
  auditTimestamps,
  softDelete,
  slugColumn,
  canonicalSlugColumn,
  seoColumns,
  defaultLanguageColumn,
} from "./helpers";
import { user } from "./auth";
import { mediaAssets } from "./media-assets";
import { customType } from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// SCHOLARS
//
// A scholar is a knowledge authority on the platform — lectures, articles,
// and series are associated with scholars. A scholar does NOT necessarily
// have a user account (most scholars are referenced entities, not users).
// A future `scholar_user_id` FK could link a scholar to a registered user
// for verified-scholar features.
//
// Avatar and banner reference media_assets rather than storing raw URLs —
// this enables image replacement without touching the scholar row.
// ─────────────────────────────────────────────────────────────────────────────
export const scholars = pgTable(
  "scholars",
  {
    id: idColumn(),
    slug: slugColumn(),
    ...canonicalSlugColumn(),

    // Core identity
    name: varchar("name", { length: 255 }).notNull(),
    arabicName: varchar("arabic_name", { length: 255 }),
    honorifics: varchar("honorifics", { length: 128 }), // e.g. "Shaykh", "Dr."
    nationality: varchar("nationality", { length: 64 }),
    location: varchar("location", { length: 128 }), // e.g. "Lagos, Nigeria"

    // Biography — stored as MDX for rich content support
    biography: text("biography"),
    knownFor: varchar("known_for", { length: 255 }),

    // Media references
    avatarAssetId: text("avatar_asset_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    bannerAssetId: text("banner_asset_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    socialLinks: jsonb("social_links").default({}).notNull(),

    // Platform presence
    websiteUrl: text("website_url"),
    twitterHandle: varchar("twitter_handle", { length: 64 }),

    // Optional link to a registered user account
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),

    // Visibility
    isActive: boolean("is_active").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    featuredOrder: integer("featured_order"),

    // i18n
    ...defaultLanguageColumn(),

    // SEO
    ...seoColumns(),

    // Full text search — maintained by trigger (see migrations/0002_search_vectors.sql)
    // 'simple' config: preserves names without stemming
    searchVector: tsvector("search_vector"),

    // Denormalised counts — updated by background job
    lectureCount: integer("lecture_count").notNull().default(0),
    articleCount: integer("article_count").notNull().default(0),
    seriesCount: integer("series_count").notNull().default(0),

    birthYear: integer("birth_year"),
    deathYear: integer("death_year"),
    countryCode: varchar("country_code", {
      length: 2,
    }),
    scholarType: varchar("scholar_type", { length: 32 })
      .default("scholar")
      .notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),

    ...auditTimestamps(),
    ...softDelete(),
  },
  (t) => [
    uniqueIndex("scholars_slug_uidx").on(t.slug!),
    index("scholars_name_idx").on(t.name!),
    index("scholars_is_active_idx").on(t.isActive!),
    index("scholars_is_featured_idx").on(t.isFeatured!),
    index("scholars_deleted_at_idx").on(t.deletedAt!),
    index("scholars_search_idx").using("gin", t.searchVector!),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// SCHOLAR_TRANSLATIONS
// Scaffolded now — populated when multilingual content is introduced.
// Unique constraint on (scholar_id, language_code) ensures one translation
// per language per scholar.
// ─────────────────────────────────────────────────────────────────────────────
export const scholarTranslations = pgTable(
  "scholar_translations",
  {
    id: text("id").primaryKey(),
    scholarId: text("scholar_id")
      .notNull()
      .references(() => scholars.id!, { onDelete: "cascade" }),
    languageCode: languageCodeEnum("language_code").notNull(),
    slug: varchar("slug", {
      length: 255,
    }),

    // Translatable fields
    name: varchar("name", { length: 255 }),
    arabicName: varchar("arabic_name", { length: 255 }),
    biography: text("biography"), // MDX
    metaTitle: varchar("meta_title", { length: 60 }),
    metaDescription: varchar("meta_description", { length: 160 }),

    ...auditTimestamps(),
  },
  (t) => [
    uniqueIndex("scholar_translations_scholar_lang_uidx").on(
      t.scholarId,
      t.languageCode,
    ),
    index("scholar_translations_scholar_id_idx").on(t.scholarId),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const scholarsRelations = relations(scholars, ({ one, many }) => ({
  avatarAsset: one(mediaAssets, {
    fields: [scholars.avatarAssetId!],
    references: [mediaAssets.id],
  }),
  bannerAsset: one(mediaAssets, {
    fields: [scholars.bannerAssetId!],
    references: [mediaAssets.id],
  }),
  user: one(user, { fields: [scholars.userId!], references: [user.id] }),
  translations: many(scholarTranslations),
  // Back-references populated by lecture/article relations:
  // lectures:  many(lectures)
  // articles:  many(articles)
  // series:    many(series)
}));

export const scholarTranslationsRelations = relations(
  scholarTranslations,
  ({ one }) => ({
    scholar: one(scholars, {
      fields: [scholarTranslations.scholarId!],
      references: [scholars.id!],
    }),
  }),
);
