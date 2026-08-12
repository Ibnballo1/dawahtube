// src/features/library/schemas/library.schemas.ts
import { z } from "zod";

export const createBookSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(255),
  description: z.string().max(2000).optional(),

  authorName: z.string().max(255).optional(),
  translator: z.string().max(255).optional(),
  publishYear: z.number().int().min(0).max(new Date().getFullYear()).optional(),

  categoryId: z.string().optional(),

  pdfAssetId: z.string().min(1, "PDF file is required"),
  previewAssetId: z.string().optional(),
  coverAssetId: z.string().optional(),

  pageCount: z.number().int().min(1).optional(),
  language: z.enum(["en", "ar", "ha", "yo", "fr"]).default("en"),
  allowFreeDownload: z.boolean().default(true),

  status: z
    .enum(["draft", "review", "scheduled", "published", "archived"])
    .default("draft"),
  scheduledAt: z.coerce.date().optional(),

  defaultLanguage: z.string().max(10).default("en"),

  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),

  tagIds: z.array(z.string()).default([]),
});

export const updateBookSchema = createBookSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
