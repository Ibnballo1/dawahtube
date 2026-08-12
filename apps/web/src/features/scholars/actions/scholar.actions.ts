// src/features/scholars/actions/scholar.actions.ts
"use server";

import { revalidateTag } from "next/cache";
import { db } from "@core/database/client";
import { scholars } from "@core/database/schema";
import { eq, sql } from "drizzle-orm";

export async function revalidateScholar(slug: string): Promise<void> {
  revalidateTag(`scholar-${slug}`, "max");
  revalidateTag("scholars", "max");
  revalidateTag("homepage-featured", "max");
}

// Syncs lecture_count / article_count denormalised columns
export async function syncScholarCounts(scholarId: string): Promise<void> {
  await db.execute(sql`
    UPDATE scholars
    SET
      lecture_count = (
        SELECT count(*) FROM lectures
        WHERE scholar_id = ${scholarId}
          AND status = 'published'
          AND deleted_at IS NULL
      ),
      article_count = (
        SELECT count(*) FROM articles
        WHERE scholar_id = ${scholarId}
          AND status = 'published'
          AND deleted_at IS NULL
      ),
      updated_at = now()
    WHERE id = ${scholarId}
  `);

  const scholar = await db.query.scholars.findFirst({
    where: eq(scholars.id, scholarId),
    columns: { slug: true },
  });

  if (scholar?.slug) {
    revalidateTag(`scholar-${scholar.slug}`, "max");
    revalidateTag(`scholar-content-${scholarId}`, "max");
  }
}
