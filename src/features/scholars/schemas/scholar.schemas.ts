// src/features/scholars/schemas/scholar.schemas.ts
import { z } from "zod";

export const createScholarSchema = z.object({
  name: z.string().min(2).max(255),
  arabicName: z.string().max(255).optional(),
  honorifics: z.string().max(128).optional(),
  nationality: z.string().max(64).optional(),
  location: z.string().max(128).optional(),
  biography: z.string().max(10_000).optional(),

  avatarAssetId: z.string().optional(),
  bannerAssetId: z.string().optional(),

  websiteUrl: z.string().url().optional().or(z.literal("")),
  twitterHandle: z.string().max(64).optional(),

  userId: z.string().optional(),
  isActive: z.boolean().default(true),

  defaultLanguage: z.string().max(10).default("en"),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
});

export const updateScholarSchema = createScholarSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateScholarInput = z.infer<typeof createScholarSchema>;
export type UpdateScholarInput = z.infer<typeof updateScholarSchema>;
