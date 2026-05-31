import { pgEnum } from "drizzle-orm/pg-core";

// ─── Content lifecycle ──────────────────────────────────────────────────────
// draft      → being authored, invisible publicly
// review     → submitted for editorial check
// scheduled  → approved, waiting for scheduled_at timestamp
// published  → live and publicly visible
// archived   → hidden from public, retained for history
export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "review",
  "scheduled",
  "published",
  "archived",
]);

// ─── Media asset lifecycle ──────────────────────────────────────────────────
// pending    → presigned URL issued, upload not yet confirmed
// uploaded   → browser PUT succeeded, metadata not verified
// processing → post-upload processing (thumbnail gen, transcode)
// ready      → fully available for use
// failed     → upload or processing error
export const mediaAssetStatusEnum = pgEnum("media_asset_status", [
  "pending",
  "uploaded",
  "processing",
  "ready",
  "failed",
]);

// ─── Media asset type ───────────────────────────────────────────────────────
export const mediaAssetTypeEnum = pgEnum("media_asset_type", [
  "audio",
  "video",
  "image",
  "pdf",
  "thumbnail",
  "avatar",
  "cover",
  "og_image",
]);

// ─── Audit actions ──────────────────────────────────────────────────────────
export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "publish",
  "unpublish",
  "restore",
  "login",
  "logout",
  "permission_change",
  "featured_update",
]);

// ─── Supported languages (BCP 47) ──────────────────────────────────────────
// Ordered by expected usage on the platform.
// Add new codes here + a migration; all other code stays unchanged.
export const languageCodeEnum = pgEnum("language_code", [
  "en", // English   — default
  "ar", // Arabic    — primary Islamic source language
  "ha", // Hausa     — northern Nigeria
  "yo", // Yoruba    — south-west Nigeria
  "fr", // French    — west Africa expansion
]);

// ─── Featured slot entity types ────────────────────────────────────────────
// Polymorphic reference — FK not enforced at DB level, enforced in application.
export const featuredEntityTypeEnum = pgEnum("featured_entity_type", [
  "lecture",
  "article",
  "book",
  "scholar",
  "reminder",
]);
