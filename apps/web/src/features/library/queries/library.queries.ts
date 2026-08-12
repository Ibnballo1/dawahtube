// src/features/library/queries/library.queries.ts
import { db } from "@core/database/client";
import { unstable_cache } from "next/cache";
import { books, bookCategories, bookTags, tags } from "@core/database/schema";
import { eq, and, isNull, desc, asc, count, sql } from "drizzle-orm";
import type {
  BookFilters,
  BookListResult,
  BookDetail,
} from "../types/library.types";

const PAGE_SIZE = 16; // Books are denser/smaller cards — more per page than lectures

// ─── Listing query ────────────────────────────────────────────────────────────

export async function getBooks(
  filters: BookFilters = {},
): Promise<BookListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [eq(books.status, "published"), isNull(books.deletedAt)];

  if (filters.query) {
    conditions.push(
      sql`${books.searchVector} @@ websearch_to_tsquery('simple', ${filters.query})`,
    );
  }

  if (filters.categoryId) {
    conditions.push(eq(books.categoryId, filters.categoryId));
  }

  if (filters.freeOnly) {
    conditions.push(eq(books.allowFreeDownload, true));
  }

  if (filters.language) {
    conditions.push(eq(books.language, filters.language));
  }

  if (filters.tagSlug) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${bookTags} bt
        JOIN ${tags} t ON t.id = bt.tag_id
        WHERE bt.book_id = ${books.id}
        AND t.slug = ${filters.tagSlug}
      )`,
    );
  }

  const orderBy = (() => {
    switch (filters.sort) {
      case "oldest":
        return [asc(books.publishedAt)];
      case "popular":
        return [desc(sql`${books.viewCount}::bigint`)];
      case "title-asc":
        return [asc(books.title)];
      case "pages-asc":
        return [asc(books.pageCount)];
      case "pages-desc":
        return [desc(books.pageCount)];
      case "newest":
      default:
        return [desc(books.publishedAt)];
    }
  })();

  const where = and(...conditions);

  const [totalResult, rows] = await Promise.all([
    db.select({ count: count() }).from(books).where(where),
    db.query.books.findMany({
      where,
      orderBy,
      limit: PAGE_SIZE,
      offset,
      with: {
        category: { columns: { id: true, slug: true, name: true } },
        coverAsset: { columns: { publicUrl: true, altText: true } },
        tags: {
          with: { tag: { columns: { id: true, slug: true, name: true } } },
        },
      },
    }),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    books: rows as BookListResult["books"],
    total,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// ─── Detail query ─────────────────────────────────────────────────────────────
// Note: pdfAsset.key is fetched here but MUST NEVER be sent to the client
// directly — it's used server-side only to generate a fresh presigned URL
// on demand via the requestBookAccess Server Action.

// ─── Detail query ─────────────────────────────────────────────────────────────

export const getBookBySlug = (slug: string) =>
  unstable_cache(
    async (): Promise<BookDetail | null> => {
      const book = await db.query.books.findFirst({
        where: (b) =>
          and(eq(b.slug, slug), eq(b.status, "published"), isNull(b.deletedAt)),
        with: {
          category: true,
          pdfAsset: {
            columns: {
              id: true,
              key: true,
              bucket: true,
              sizeBytes: true,
              mimeType: true,
            },
          },
          previewAsset: {
            columns: { id: true, key: true, bucket: true },
          },
          coverAsset: true,
          tags: {
            with: { tag: { columns: { id: true, slug: true, name: true } } },
          },
        },
      });

      return (book as BookDetail | undefined) ?? null;
    },
    // ✅ The slug goes here to isolate individual book cache entries!
    ["book-detail", slug],
    {
      // ✅ Use a generalized tag name for collection-wide purging if needed
      tags: ["books"],
      revalidate: 3600,
    },
  )(); // Execute the wrapper outer scope immediately

// ─── Related books ─────────────────────────────────────────────────────────────

export const getRelatedBooks = (bookId: string, categoryId: string | null) =>
  unstable_cache(
    async () => {
      const conditions = [
        eq(books.status, "published"),
        isNull(books.deletedAt),
        sql`${books.id} != ${bookId}`,
      ];

      if (categoryId) {
        conditions.push(eq(books.categoryId, categoryId));
      }

      return db.query.books.findMany({
        where: and(...conditions),
        orderBy: [desc(books.publishedAt)],
        limit: 4,
        with: {
          coverAsset: { columns: { publicUrl: true, altText: true } },
        },
      });
    },
    // ✅ Push tracking IDs directly into the cache signature array keys
    ["related-books", bookId, categoryId ?? "no-category"],
    {
      tags: ["related-books"],
      revalidate: 3600,
    },
  )();

// ─── Canonical slug lookup ────────────────────────────────────────────────────

export async function getBookByCanonicalSlug(
  canonicalSlug: string,
): Promise<{ slug: string } | null> {
  const row = await db.query.books.findFirst({
    where: (b) =>
      and(
        eq(b.canonicalSlug, canonicalSlug),
        eq(b.status, "published"),
        isNull(b.deletedAt),
      ),
    columns: { slug: true },
  });
  return row ?? null;
}

// ─── Filter options ───────────────────────────────────────────────────────────

export const getBookFilterOptions = unstable_cache(
  async () => {
    const [categoryRows, languageRows] = await Promise.all([
      db
        .select({
          id: bookCategories.id,
          slug: bookCategories.slug,
          name: bookCategories.name,
          count: sql<number>`count(${books.id})::int`,
        })
        .from(bookCategories)
        .leftJoin(
          books,
          and(
            eq(books.categoryId, bookCategories.id),
            eq(books.status, "published"),
            isNull(books.deletedAt),
          ),
        )
        .where(eq(bookCategories.isActive, true))
        .groupBy(bookCategories.id, bookCategories.slug, bookCategories.name)
        .orderBy(asc(bookCategories.name)),

      db
        .select({
          language: books.language,
          count: sql<number>`count(*)::int`,
        })
        .from(books)
        .where(and(eq(books.status, "published"), isNull(books.deletedAt)))
        .groupBy(books.language)
        .orderBy(desc(sql`count(*)`)),
    ]);

    return { categories: categoryRows, languages: languageRows };
  },
  ["book-filter-options"],
  { tags: ["book-filters"], revalidate: 86400 },
);

// ─── generateStaticParams helper ─────────────────────────────────────────────

export async function getAllPublishedBookSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: books.slug })
    .from(books)
    .where(and(eq(books.status, "published"), isNull(books.deletedAt)));

  return rows.map((r) => r.slug);
}
