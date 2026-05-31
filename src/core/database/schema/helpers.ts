import { sql } from "drizzle-orm";
import { timestamp, varchar, text, boolean, bigint } from "drizzle-orm/pg-core";

// ─── Primary key convention ─────────────────────────────────────────────────
// Format: {3-letter prefix}_{nanoid(16)}   e.g. lec_01jxyz1234abcdef
// Prefix makes FK debug trivial — you instantly know which table an id belongs to.
// nanoid(16) provides 1.4 × 10²⁸ unique values — collision-safe at any scale.
// NOT using uuid_generate_v4() because:
//   1. Application controls ID generation (portable, no DB extension dependency)
//   2. Prefixed IDs are self-documenting in logs and API responses
export function idColumn() {
  return text("id").primaryKey();
}

// ─── Audit timestamps ───────────────────────────────────────────────────────
// Every table gets created_at / updated_at.
// updated_at uses DEFAULT now() + must be set explicitly on UPDATE —
// Drizzle's .$onUpdate() handles this in the ORM layer.
// We deliberately avoid DB-level triggers for updated_at to keep migrations
// clean and the update logic visible in application code.
export function auditTimestamps() {
  return {
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .default(sql`now()`)
      .$onUpdate(() => new Date()),
  };
}

// ─── Soft delete ────────────────────────────────────────────────────────────
// All content tables use soft delete.
// Hard delete is reserved for PII removal (GDPR) only.
// Queries must always filter: WHERE deleted_at IS NULL
// Drizzle's query builder does NOT auto-filter — add it explicitly in every query.
export function softDelete() {
  return {
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  };
}

// ─── Slug column ────────────────────────────────────────────────────────────
// 255 chars: handles longest Arabic transliterations + numeric suffix collisions.
// UNIQUE constraint added per-table, not here — Drizzle requires it on the table.
export function slugColumn() {
  return varchar("slug", { length: 255 }).notNull();
}

// ─── Canonical slug (redirect tracking) ────────────────────────────────────
// Stores the original slug when an admin renames content.
// Middleware checks this for 301 redirects to preserve SEO equity.
export function canonicalSlugColumn() {
  return {
    canonicalSlug: varchar("canonical_slug", {
      length: 255,
    }),
  };
}

// ─── SEO metadata columns ───────────────────────────────────────────────────
// Explicit SEO fields on every public content table.
// Falls back to title/excerpt if null — handled in metadata generation.
export function seoColumns() {
  return {
    metaTitle: varchar("meta_title", { length: 60 }),
    metaDescription: varchar("meta_description", { length: 160 }),
  };
}

// ─── Multilingual default ───────────────────────────────────────────────────
// Marks the language the content was authored in.
// Translation tables reference this; 'en' is the platform default.
export function defaultLanguageColumn() {
  return {
    defaultLanguage: varchar("default_language", {
      length: 10,
    })
      .notNull()
      .default("en"),
  };
}

// ─── Published scheduling columns ───────────────────────────────────────────
// published_at: when the content went live (set by publish action)
// scheduled_at: when the cron job should flip status to 'published'
export function publishingColumns() {
  return {
    publishedAt: timestamp("published_at", {
      withTimezone: true,
      mode: "date",
    }),
    scheduledAt: timestamp("scheduled_at", {
      withTimezone: true,
      mode: "date",
    }),
  };
}

// ─── Featured flag ──────────────────────────────────────────────────────────
// Quick boolean used by homepage CMS as a secondary signal.
// Primary featured management is via featured_slots table.
export function featuredColumn() {
  return {
    isFeatured: boolean("is_featured").notNull().default(false),
  };
}

// ─── View / download counter cache ─────────────────────────────────────────
// Denormalised count — updated by a periodic background job that
// aggregates from the analytics tables. Fast to read, eventually consistent.
// NOT maintained by triggers (avoids lock contention on hot rows).
export function viewCountColumn() {
  return {
    viewCount: bigint("view_count", {
      mode: "number",
    })
      .notNull()
      .default(0),
  };
}
