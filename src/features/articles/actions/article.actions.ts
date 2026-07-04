// src/features/articles/actions/article.actions.ts
"use server";

import { db } from "@core/database/client";
import { articleViews, articles } from "@core/database/schema";
import { eq, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { nanoid } from "nanoid";
import { z } from "zod";

const trackViewSchema = z.object({
  articleId: z.string().min(1),
  sessionId: z.string().min(1).max(64),
});

export async function trackArticleView(
  input: z.infer<typeof trackViewSchema>,
): Promise<{ ok: boolean }> {
  const data = trackViewSchema.safeParse(input);
  if (!data.success) return { ok: false };

  try {
    await db
      .insert(articleViews)
      .values({
        id: `av_${nanoid(16)}`,
        articleId: data.data.articleId,
        sessionId: data.data.sessionId,
      })
      .onConflictDoNothing({
        target: [articleViews.articleId, articleViews.sessionId],
      });

    await db
      .update(articles)
      .set({ viewCount: sql`(${articles.viewCount}::bigint + 1)::text` })
      .where(eq(articles.id, data.data.articleId));

    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function revalidateArticle(slug: string): Promise<void> {
  revalidateTag(`article-${slug}`, "max");
  revalidateTag("articles", "max");
  revalidateTag("homepage-featured", "max");
}

export async function revalidateArticleFilters(): Promise<void> {
  revalidateTag("article-filters", "max");
}
