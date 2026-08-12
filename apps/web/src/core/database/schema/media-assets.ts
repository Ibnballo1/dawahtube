import {
  pgTable,
  varchar,
  text,
  integer,
  jsonb,
  index,
  bigint,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { mediaAssetStatusEnum, mediaAssetTypeEnum } from "./enums";
import { idColumn, auditTimestamps, softDelete } from "./helpers";
import { user } from "./auth";

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA_ASSETS
//
// Every file in R2 has exactly one corresponding row here.
// Content tables (lectures, articles, books, scholars) reference media_assets
// by FK rather than storing raw R2 keys. This enables:
//   - Centralised file management and deduplication
//   - Orphan detection (assets with no content FK references)
//   - File replacement without breaking content references
//   - Usage tracking per asset
//
// Bucket values: 'media' | 'uploads' | 'books'
//   media   → dawahtube-media   (public CDN)
//   uploads → dawahtube-uploads (private, presigned read)
//   books   → dawahtube-books   (private, presigned read)
//
// publicUrl is only set for the 'media' bucket.
// For private buckets, URLs are generated on-demand via presigned GET.
// ─────────────────────────────────────────────────────────────────────────────
export const mediaAssets = pgTable(
  "media_assets",
  {
    id: idColumn(),

    // Uploader — nullable on cascade delete (user might be removed, keep asset)
    uploaderUserId: text("uploader_user_id").references(() => user.id, {
      onDelete: "set null",
    }),

    // R2 location
    bucket: varchar("bucket", { length: 32 }).notNull(), // 'media'|'uploads'|'books'
    key: text("key").notNull(), // full R2 object key
    publicUrl: text("public_url"), // null for private buckets

    // Classification
    assetType: mediaAssetTypeEnum("asset_type").notNull(),
    status: mediaAssetStatusEnum("status").notNull().default("pending"),

    // File metadata
    mimeType: varchar("mime_type", { length: 128 }).notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull().default(0),
    checksum: varchar("checksum", {
      length: 64,
    }),
    originalFilename: text("original_filename").notNull(),

    // Media-type specific metadata
    durationSecs: integer("duration_secs"), // audio / video
    width: integer("width"), // image / video
    height: integer("height"), // image / video

    // Accessibility
    altText: varchar("alt_text", { length: 500 }),

    // Catch-all for future metadata (codec, bitrate, exif, etc.)
    // jsonb is faster to read than json and supports GIN indexing
    metadata: jsonb("metadata").notNull().default({}),
    attachedEntityType: varchar("attached_entity_type", { length: 50 }),

    attachedEntityId: text("attached_entity_id"),
    downloadCount: integer("download_count").default(0).notNull(),

    ...auditTimestamps(),
    ...softDelete(),
  },
  (t) => [
    // Unique key per bucket — R2 enforces uniqueness but we mirror it here
    // for fast application-layer lookups and to prevent duplicate inserts.
    // Use a partial unique index to allow soft-deleted assets to be re-used.
    // Note: Drizzle generates this as a standard unique index; the WHERE clause
    // on deleted_at IS NULL must be added via a raw SQL migration step.
    // See: migrations/0002_indexes.sql for the partial unique index.
    index("media_assets_bucket_key_idx").on(t.bucket, t.key),
    index("media_assets_type_status_idx").on(t.assetType, t.status),
    index("media_assets_uploader_idx").on(t.uploaderUserId),
    index("media_assets_deleted_at_idx").on(t.deletedAt),
    index("media_assets_checksum_idx").on(t.checksum),

    index("media_assets_status_idx").on(t.status),

    index("media_assets_asset_type_idx").on(t.assetType),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const mediaAssetsRelations = relations(mediaAssets, ({ one }) => ({
  uploader: one(user, {
    fields: [mediaAssets.uploaderUserId],
    references: [user.id],
  }),
}));
