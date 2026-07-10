// src/features/lectures/schemas/lecture.schemas.ts
import { z } from "zod";

// ─── Create / update lecture ──────────────────────────────────────────────────

export const createLectureSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().max(5000).optional(),
  transcript: z.string().max(100_000).optional(),

  scholarId: z.string().min(1, "Scholar is required"),
  categoryId: z.string().optional(),

  audioAssetId: z.string().optional(),
  videoAssetId: z.string().optional(),
  thumbnailAssetId: z.string().optional(),

  durationSecs: z.number().int().min(0).optional(),
  allowDownload: z.boolean().default(true),

  status: z
    .enum(["draft", "review", "scheduled", "published", "archived"])
    .default("draft"),
  scheduledAt: z.coerce.date().optional(),

  defaultLanguage: z.string().max(10).default("en"),

  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),

  tagIds: z.array(z.string()).default([]),
});

export const updateLectureSchema = createLectureSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateLectureInput = z.infer<typeof createLectureSchema>;
export type UpdateLectureInput = z.infer<typeof updateLectureSchema>;

// ─── Publish lecture ──────────────────────────────────────────────────────────

export const publishLectureSchema = z.object({
  id: z.string().min(1),
  scheduledAt: z.coerce.date().optional(),
});

// ─── Reorder series items ─────────────────────────────────────────────────────

export const reorderSeriesSchema = z.object({
  seriesId: z.string().min(1),
  items: z
    .array(
      z.object({
        lectureId: z.string(),
        position: z.number().int().min(0),
      }),
    )
    .min(1),
});

export type ReorderSeriesInput = z.infer<typeof reorderSeriesSchema>;
