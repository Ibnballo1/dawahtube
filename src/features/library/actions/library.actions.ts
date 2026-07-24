// src/features/library/actions/library.actions.ts
"use server";

import { db } from "@core/database/client";
import { books, bookDownloads } from "@core/database/schema";
import { eq, sql, and } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createPresignedRead } from "@core/storage/presign";
import { headers } from "next/headers";
import auth from "@core/auth/config";

// ─── Request a fresh presigned URL for reading/downloading a book PDF ────────
//
// Called from the client when the reader clicks "Read now" or "Download".
// The actual R2 object key never appears in page source or build output —
// it's resolved server-side at the moment of the click, then a short-lived
// presigned GET URL (1 hour) is returned to the browser.
//
// This also records a book_download row when intent is 'download'.
// 'read' intent does NOT record a download — that's tracked as a view instead,
// since opening the inline viewer isn't the same as downloading the file.

const requestAccessSchema = z.object({
  bookId: z.string().min(1),
  intent: z.enum(["read", "download"]),
});

export async function requestBookAccess(
  input: z.infer<typeof requestAccessSchema>,
): Promise<
  { ok: true; url: string; expiresAt: string } | { ok: false; error: string }
> {
  const data = requestAccessSchema.safeParse(input);
  if (!data.success) return { ok: false, error: "Invalid request" };

  const book = await db.query.books.findFirst({
    where: and(eq(books.id, data.data.bookId), eq(books.status, "published")),
    with: {
      pdfAsset: { columns: { id: true, key: true, bucket: true } },
    },
  });

  if (!book?.pdfAsset) {
    return { ok: false, error: "This book is not currently available." };
  }

  // Gate non-free books behind authentication (free books are open to all)
  if (!book.allowFreeDownload) {
    const session = await auth.api
      .getSession({ headers: await headers() })
      .catch(() => null);
    if (!session?.user) {
      return { ok: false, error: "Please sign in to access this book." };
    }
  }

  try {
    const url = await createPresignedRead(
      book.pdfAsset.bucket as "books",
      book.pdfAsset.key,
    );

    if (data.data.intent === "download") {
      await recordDownload(book.id);
    }

    return {
      ok: true,
      url,
      expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    };
  } catch {
    return {
      ok: false,
      error: "Could not generate access link. Please try again.",
    };
  }
}

// ─── Internal: record a download event ────────────────────────────────────────
// Not exported as a standalone action — only called from requestBookAccess
// to guarantee a download is never recorded without a real presigned URL
// actually being issued.

async function recordDownload(bookId: string): Promise<void> {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  await db.insert(bookDownloads).values({
    id: `bd_${nanoid(16)}`,
    bookId,
    userId: session?.user?.id ?? null,
    sessionId: nanoid(21), // anonymous fallback; client-supplied sessionId not required here
  });

  // Increment denormalised view_count used as "download count" display for books
  await db
    .update(books)
    .set({ viewCount: sql`(${books.viewCount}::bigint + 1)::text` })
    .where(eq(books.id, bookId));
}

// ─── Note on page views ────────────────────────────────────────────────────────
// Books do not have a dedicated `book_views` analytics table in the Phase 2
// schema — only `book_downloads`. Unlike lectures/articles, simply opening a
// book's detail page is not tracked as a distinct metric; the download count
// (via requestBookAccess above) is the headline engagement signal for books.
// If page-view analytics are wanted later, add a `book_views` table following
// the same pattern as `lecture_views` / `article_views` in a new migration.

// ─── Revalidation helpers ─────────────────────────────────────────────────────

export async function revalidateBook(slug: string): Promise<void> {
  revalidateTag(`book-${slug}`, "max");
  revalidateTag("books", "max");
  revalidateTag("homepage-featured", "max");
}

export async function revalidateBookFilters(): Promise<void> {
  revalidateTag("book-filters", "max");
}
