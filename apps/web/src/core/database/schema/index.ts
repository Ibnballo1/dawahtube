// ─────────────────────────────────────────────────────────────────────────────
// DATABASE SCHEMA — BARREL EXPORT
//
// Import order matters for Drizzle's relation resolution.
// Tables with no FK dependencies come first.
// Tables that depend on others come after.
//
// To add a new domain:
//   1. Create src/core/database/schema/{domain}.ts
//   2. Add export * from './{domain}' below
//   3. Run: npm run db:generate
// ─────────────────────────────────────────────────────────────────────────────

// 1. Enums and helpers — no table dependencies
export * from "./enums";
export * from "./helpers";

// 2. Identity — no content dependencies
export * from "./auth";

// 3. Storage — depends on users
export * from "./media-assets";

// 4. Shared taxonomy — no content dependencies
export * from "./tags";

// 5. Scholars — depends on users, media_assets
export * from "./scholars";

// 6. Content domains — depend on scholars, media_assets, tags
export * from "./lectures";
export * from "./articles";
export * from "./books";
export * from "./reminders";

// 7. Homepage CMS — depends on users (set_by)
export * from "./featured-slots";

// 8. Analytics — depends on all content tables
export * from "./analytics";

// 9. Audit — depends on users
export * from "./audit-logs";
