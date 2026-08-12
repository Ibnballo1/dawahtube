// src/features/articles/schemas/article.schemas.ts
import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  excerpt: z.string().max(500).optional(),
  content: z.string().max(100_000).optional(), // MDX source

  scholarId: z.string().optional(),
  categoryId: z.string().optional(),
  authorId: z.string().optional(),

  coverAssetId: z.string().optional(),

  status: z
    .enum(["draft", "review", "scheduled", "published", "archived"])
    .default("draft"),
  scheduledAt: z.coerce.date().optional(),

  defaultLanguage: z.string().max(10).default("en"),

  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),

  tagIds: z.array(z.string()).default([]),
});

export const updateArticleSchema = createArticleSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;

// ─── Derived content metadata ─────────────────────────────────────────────────
// Called server-side whenever article content is saved, to keep
// word_count and reading_time_mins in sync with the MDX source.

export function calculateContentMetadata(mdxContent: string): {
  wordCount: number;
  readingTimeMins: number;
} {
  // Strip MDX/markdown syntax for a cleaner word count
  const plainText = mdxContent
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/<[^>]+>/g, "") // JSX/HTML tags
    .replace(/[#*_`~>\-]/g, "") // markdown symbols
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // links → text only
    .trim();

  const words = plainText.split(/\s+/).filter(Boolean).length;
  const readingTimeMins = Math.max(1, Math.ceil(words / 200));

  return { wordCount: words, readingTimeMins };
}
