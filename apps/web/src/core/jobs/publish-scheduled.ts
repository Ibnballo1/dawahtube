// src/core/jobs/publish-scheduled.ts
//
// Called every 5 minutes by cron-job.org via POST /api/cron/publish-scheduled.
// Finds all content where:
//   status = 'scheduled' AND scheduled_at <= now()
// and transitions them to status = 'published'.
//
// After publishing, it revalidates the relevant cache tags so the
// public site reflects the new content immediately.

import { db } from "@core/database/client";
import { lectures, articles, books } from "@core/database/schema";
import { eq, and, lte, isNull } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export interface PublishResult {
  published: number;
  errors: number;
  details: Array<{ type: string; id: string; slug: string; error?: string }>;
}

export async function publishScheduledContent(): Promise<PublishResult> {
  const now = new Date();
  let published = 0;
  let errors = 0;
  const details: PublishResult["details"] = [];

  // ── Lectures ──────────────────────────────────────────────────────────────
  const scheduledLectures = await db.query.lectures.findMany({
    where: and(
      eq(lectures.status, "scheduled"),
      lte(lectures.scheduledAt, now),
      isNull(lectures.deletedAt),
    ),
    columns: { id: true, slug: true, title: true },
  });

  for (const lecture of scheduledLectures) {
    try {
      await db
        .update(lectures)
        .set({
          status: "published",
          publishedAt: now,
          updatedAt: now,
        })
        .where(eq(lectures.id, lecture.id));

      revalidateTag(`lecture-${lecture.slug}`, "update");
      revalidateTag("lectures", "update");
      revalidateTag("homepage-featured", "update");

      details.push({ type: "lecture", id: lecture.id, slug: lecture.slug });
      published++;

      console.log(
        `[publish-scheduled] Published lecture: ${lecture.title} (${lecture.slug})`,
      );
    } catch (err) {
      errors++;
      details.push({
        type: "lecture",
        id: lecture.id,
        slug: lecture.slug,
        error: err instanceof Error ? err.message : "Unknown error",
      });
      console.error(
        `[publish-scheduled] Failed to publish lecture ${lecture.id}:`,
        err,
      );
    }
  }

  // ── Articles ──────────────────────────────────────────────────────────────
  const scheduledArticles = await db.query.articles.findMany({
    where: and(
      eq(articles.status, "scheduled"),
      lte(articles.scheduledAt, now),
      isNull(articles.deletedAt),
    ),
    columns: { id: true, slug: true, title: true },
  });

  for (const article of scheduledArticles) {
    try {
      await db
        .update(articles)
        .set({
          status: "published",
          publishedAt: now,
          updatedAt: now,
        })
        .where(eq(articles.id, article.id));

      revalidateTag(`article-${article.slug}`, "update");
      revalidateTag("articles", "update");
      revalidateTag("homepage-featured", "update");

      details.push({ type: "article", id: article.id, slug: article.slug });
      published++;

      console.log(
        `[publish-scheduled] Published article: ${article.title} (${article.slug})`,
      );
    } catch (err) {
      errors++;
      details.push({
        type: "article",
        id: article.id,
        slug: article.slug,
        error: err instanceof Error ? err.message : "Unknown error",
      });
      console.error(
        `[publish-scheduled] Failed to publish article ${article.id}:`,
        err,
      );
    }
  }

  // ── Books ─────────────────────────────────────────────────────────────────
  const scheduledBooks = await db.query.books.findMany({
    where: and(
      eq(books.status, "scheduled"),
      lte(books.scheduledAt, now),
      isNull(books.deletedAt),
    ),
    columns: { id: true, slug: true, title: true },
  });

  for (const book of scheduledBooks) {
    try {
      await db
        .update(books)
        .set({
          status: "published",
          publishedAt: now,
          updatedAt: now,
        })
        .where(eq(books.id, book.id));

      revalidateTag(`book-${book.slug}`, "update");
      revalidateTag("books", "update");
      revalidateTag("homepage-featured", "update");

      details.push({ type: "book", id: book.id, slug: book.slug });
      published++;

      console.log(
        `[publish-scheduled] Published book: ${book.title} (${book.slug})`,
      );
    } catch (err) {
      errors++;
      details.push({
        type: "book",
        id: book.id,
        slug: book.slug,
        error: err instanceof Error ? err.message : "Unknown error",
      });
      console.error(
        `[publish-scheduled] Failed to publish book ${book.id}:`,
        err,
      );
    }
  }

  // Revalidate admin stats if anything changed
  if (published > 0) {
    revalidateTag("admin-stats", "update");
  }

  console.log(
    `[publish-scheduled] Done — published: ${published}, errors: ${errors}`,
  );

  return { published, errors, details };
}
