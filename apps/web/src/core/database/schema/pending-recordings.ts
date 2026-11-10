import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  varchar,
  date,
  jsonb,
} from "drizzle-orm/pg-core";

export const pendingRecordings = pgTable("pending_recordings", {
  id: text("id").primaryKey(),
  title: text("title"),
  scholarId: text("scholar_id"),
  recordedBy: text("recorded_by"),
  audioAssetId: text("audio_asset_id"),
  durationSecs: integer("duration_secs"),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  consentGiven: boolean("consent_given").notNull().default(false),
  consentAt: timestamp("consent_at", { withTimezone: true }),
  language: varchar("language", { length: 10 }),
  speakerName: varchar("speaker_name", { length: 255 }),
  recordedOn: date("recorded_on", { mode: "string" }),
  venue: text("venue"),
  appVersion: varchar("app_version", { length: 32 }),
  deviceModel: varchar("device_model", { length: 128 }),
  markers: jsonb("markers")
    .$type<Array<{ atMs: number; label: string }>>()
    .notNull()
    .default([]),
  trimStartMs: integer("trim_start_ms"),
  trimEndMs: integer("trim_end_ms"),
  rejectedReason: text("rejected_reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
