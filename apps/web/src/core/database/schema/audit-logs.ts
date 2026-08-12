import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { auditActionEnum } from "./enums";
import { idColumn } from "./helpers";
import { user } from "./auth";

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT_LOGS
//
// Immutable record of all admin mutations on the platform.
// No updated_at — these rows must never change.
// No deleted_at — these rows must never be soft-deleted.
//
// Enforcement strategy (Amendment 5):
//   1. No updateAuditLog / deleteAuditLog functions exported from logger.ts
//   2. DB user is REVOKE'd of UPDATE and DELETE on this table
//      (see docs/database-permissions.md)
//   3. No Drizzle migrations will ever add ON DELETE CASCADE to this table
//
// Schema of before/after columns:
//   Both are jsonb snapshots of the full entity row before and after the change.
//   before = null for 'create' actions.
//   after  = null for 'delete' actions.
//   For 'update', both are present — diffing happens in the admin UI layer.
//
// metadata column holds:
//   { ip: string, userAgent: string, ...extra context }
// ─────────────────────────────────────────────────────────────────────────────
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: idColumn(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),

    action: auditActionEnum("action").notNull(),
    entity: varchar("entity", { length: 64 }).notNull(), // 'lecture', 'article', etc.
    entityId: text("entity_id").notNull(),

    before: jsonb("before"), // entity snapshot before mutation
    after: jsonb("after"), // entity snapshot after mutation
    metadata: jsonb("metadata").notNull().default({}),

    // createdAt only — no updatedAt on immutable rows
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index("audit_logs_user_id_idx").on(t.userId),
    index("audit_logs_entity_idx").on(t.entity, t.entityId),
    index("audit_logs_action_idx").on(t.action),
    // Time-range queries for audit dashboard:
    // "show all actions in the last 30 days"
    index("audit_logs_created_at_idx").on(t.createdAt),
    // Composite for "all actions on this specific entity, newest first"
    index("audit_logs_entity_created_at_idx").on(
      t.entity,
      t.entityId,
      t.createdAt,
    ),
  ],
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(user, { fields: [auditLogs.userId], references: [user.id] }),
}));
