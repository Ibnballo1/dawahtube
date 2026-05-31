import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  smallint,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  text,
} from "drizzle-orm/pg-core";
import { featuredEntityTypeEnum } from "./enums";
import { idColumn, auditTimestamps } from "./helpers";
import { user } from "./auth";

// ─────────────────────────────────────────────────────────────────────────────
// FEATURED_SLOTS
//
// Controls every piece of featured content on the homepage.
// Each slot has a key that maps to a homepage section and a position
// within that section.
//
// slot_key examples:
//   'hero_lecture'        → single hero lecture at the top (position 0 only)
//   'featured_lectures'   → up to 6 lecture cards (positions 0–5)
//   'featured_scholars'   → up to 4 scholar cards (positions 0–3)
//   'featured_articles'   → up to 4 article cards (positions 0–3)
//   'library_highlights'  → up to 4 book cards    (positions 0–3)
//   'daily_reminder'      → single reminder        (position 0 only)
//
// entity_type + entity_id: polymorphic reference — no DB-level FK.
//   Application validates entity existence before insert.
//
// valid_from / valid_until: optional scheduling window.
//   NULL valid_until means "no expiry". A scheduled reminder for Ramadan
//   might have valid_until set to Ramadan's last day.
//
// set_by: which admin set this slot (audit trail on the slot itself,
//   independent of the main audit_logs table).
// ─────────────────────────────────────────────────────────────────────────────
export const featuredSlots = pgTable(
  "featured_slots",
  {
    id: idColumn(),
    slotKey: varchar("slot_key", { length: 64 }).notNull(),
    position: smallint("position").notNull().default(0),

    entityType: featuredEntityTypeEnum("entity_type").notNull(),
    entityId: text("entity_id").notNull(),

    isActive: boolean("is_active").notNull().default(true),
    validFrom: timestamp("valid_from", { withTimezone: true, mode: "date" })
      .notNull()
      .default(sql`now()`),
    validUntil: timestamp("valid_until", { withTimezone: true, mode: "date" }),

    setBy: varchar("set_by", { length: 26 }).references(() => user.id, {
      onDelete: "set null",
    }),

    ...auditTimestamps(),
  },
  (t) => [
    // One entity per slot+position combination.
    // Upsert on this constraint to replace a slot without checking first.
    uniqueIndex("featured_slots_key_position_uidx").on(t.slotKey, t.position),

    // Fast lookup for homepage query:
    // WHERE slot_key = ? AND is_active = true AND valid_until IS NULL OR valid_until > now()
    index("featured_slots_key_active_idx").on(t.slotKey, t.isActive),

    // Find all slots featuring a specific entity (e.g. before deleting it)
    index("featured_slots_entity_idx").on(t.entityType, t.entityId),
  ],
);
