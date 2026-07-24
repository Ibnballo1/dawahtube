// src/features/search/queries/search.queries.ts
import { db } from "@core/database/client";
import { lectures, articles, books, scholars } from "@core/database/schema";
import { eq, and, isNull, desc, sql, count } from "drizzle-orm";
import type {
  SearchResults,
  LectureSearchResult,
  ArticleSearchResult,
  BookSearchResult,
  ScholarSearchResult,
} from "../types/search.types";

const PER_TYPE_LIMIT = 5; // results per type when showing "all"
const PAGE_LIMIT = 12; // results when filtered to a single type

// ─── Main search function ─────────────────────────────────────────────────────
// Runs all four queries in parallel regardless of selected type,
// so tab counts are always accurate.

export async function search(
  query: string,
  type: "all" | "lectures" | "articles" | "books" | "scholars" = "all",
  page: number = 1,
): Promise<SearchResults> {
  if (!query.trim()) {
    return emptyResults(query);
  }

  // Safe FTS query — websearch_to_tsquery handles special chars gracefully
  const tsQuery = sql`websearch_to_tsquery('simple', ${query})`;
  const offset = (page - 1) * PAGE_LIMIT;

  const [
    lectureRows,
    lectureCount,
    articleRows,
    articleCount,
    bookRows,
    bookCount,
    scholarRows,
    scholarCount,
  ] = await Promise.all([
    // ── Lectures ──────────────────────────────────────────────────────────
    db.query.lectures.findMany({
      where: and(
        eq(lectures.status, "published"),
        isNull(lectures.deletedAt),
        sql`${lectures.searchVector} @@ ${tsQuery}`,
      ),
      orderBy: [
        // Rank by relevance first, then recency
        desc(sql`ts_rank(${lectures.searchVector}, ${tsQuery})`),
        desc(lectures.publishedAt),
      ],
      limit: type === "lectures" ? PAGE_LIMIT : PER_TYPE_LIMIT,
      offset: type === "lectures" ? offset : 0,
      with: {
        scholar: { columns: { name: true, honorifics: true } },
        category: { columns: { name: true } },
        thumbnailAsset: { columns: { publicUrl: true } },
      },
    }),

    db
      .select({ count: count() })
      .from(lectures)
      .where(
        and(
          eq(lectures.status, "published"),
          isNull(lectures.deletedAt),
          sql`${lectures.searchVector} @@ ${tsQuery}`,
        ),
      ),

    // ── Articles ───────────────────────────────────────────────────────────
    db.query.articles.findMany({
      where: and(
        eq(articles.status, "published"),
        isNull(articles.deletedAt),
        sql`${articles.searchVector} @@ ${tsQuery}`,
      ),
      orderBy: [
        desc(sql`ts_rank(${articles.searchVector}, ${tsQuery})`),
        desc(articles.publishedAt),
      ],
      limit: type === "articles" ? PAGE_LIMIT : PER_TYPE_LIMIT,
      offset: type === "articles" ? offset : 0,
      with: {
        scholar: { columns: { name: true, honorifics: true } },
        category: { columns: { name: true } },
        coverAsset: { columns: { publicUrl: true } },
      },
    }),

    db
      .select({ count: count() })
      .from(articles)
      .where(
        and(
          eq(articles.status, "published"),
          isNull(articles.deletedAt),
          sql`${articles.searchVector} @@ ${tsQuery}`,
        ),
      ),

    // ── Books ──────────────────────────────────────────────────────────────
    db.query.books.findMany({
      where: and(
        eq(books.status, "published"),
        isNull(books.deletedAt),
        sql`${books.searchVector} @@ ${tsQuery}`,
      ),
      orderBy: [
        desc(sql`ts_rank(${books.searchVector}, ${tsQuery})`),
        desc(books.publishedAt),
      ],
      limit: type === "books" ? PAGE_LIMIT : PER_TYPE_LIMIT,
      offset: type === "books" ? offset : 0,
      with: {
        coverAsset: { columns: { publicUrl: true } },
      },
    }),

    db
      .select({ count: count() })
      .from(books)
      .where(
        and(
          eq(books.status, "published"),
          isNull(books.deletedAt),
          sql`${books.searchVector} @@ ${tsQuery}`,
        ),
      ),

    // ── Scholars ───────────────────────────────────────────────────────────
    db.query.scholars.findMany({
      where: and(
        eq(scholars.isActive, true),
        isNull(scholars.deletedAt),
        sql`${scholars.searchVector} @@ ${tsQuery}`,
      ),
      orderBy: [
        desc(sql`ts_rank(${scholars.searchVector}, ${tsQuery})`),
        desc(scholars.lectureCount),
      ],
      limit: type === "scholars" ? PAGE_LIMIT : PER_TYPE_LIMIT,
      offset: type === "scholars" ? offset : 0,
      with: {
        avatarAsset: { columns: { publicUrl: true } },
      },
    }),

    db
      .select({ count: count() })
      .from(scholars)
      .where(
        and(
          eq(scholars.isActive, true),
          isNull(scholars.deletedAt),
          sql`${scholars.searchVector} @@ ${tsQuery}`,
        ),
      ),
  ]);

  // ── Shape results ───────────────────────────────────────────────────────────

  const mappedLectures: LectureSearchResult[] = lectureRows.map((l) => ({
    kind: "lecture" as const,
    id: l.id,
    slug: l.slug,
    title: l.title,
    description: l.description,
    durationSecs: l.durationSecs,
    publishedAt: l.publishedAt,
    scholarName: l.scholar
      ? [l.scholar.honorifics, l.scholar.name].filter(Boolean).join(" ")
      : null,
    categoryName: l.category?.name ?? null,
    thumbnailUrl: l.thumbnailAsset?.publicUrl ?? null,
  }));

  const mappedArticles: ArticleSearchResult[] = articleRows.map((a) => ({
    kind: "article" as const,
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    readingTimeMins: a.readingTimeMins,
    publishedAt: a.publishedAt,
    scholarName: a.scholar
      ? [a.scholar.honorifics, a.scholar.name].filter(Boolean).join(" ")
      : null,
    categoryName: a.category?.name ?? null,
    coverUrl: a.coverAsset?.publicUrl ?? null,
  }));

  const mappedBooks: BookSearchResult[] = bookRows.map((b) => ({
    kind: "book" as const,
    id: b.id,
    slug: b.slug,
    title: b.title,
    authorName: b.authorName,
    pageCount: b.pageCount,
    language: b.language,
    coverUrl: b.coverAsset?.publicUrl ?? null,
    isFree: b.allowFreeDownload,
  }));

  const mappedScholars: ScholarSearchResult[] = scholarRows.map((s) => ({
    kind: "scholar" as const,
    id: s.id,
    slug: s.slug,
    name: s.name,
    honorifics: s.honorifics,
    arabicName: s.arabicName,
    nationality: s.nationality,
    lectureCount: s.lectureCount,
    articleCount: s.articleCount,
    avatarUrl: s.avatarAsset?.publicUrl ?? null,
  }));

  const lTotal = lectureCount[0]?.count ?? 0;
  const aTotal = articleCount[0]?.count ?? 0;
  const bTotal = bookCount[0]?.count ?? 0;
  const sTotal = scholarCount[0]?.count ?? 0;

  return {
    query,
    lectures: { items: mappedLectures, total: lTotal },
    articles: { items: mappedArticles, total: aTotal },
    books: { items: mappedBooks, total: bTotal },
    scholars: { items: mappedScholars, total: sTotal },
    total: lTotal + aTotal + bTotal + sTotal,
  };
}

function emptyResults(query: string): SearchResults {
  const empty = { items: [], total: 0 };
  return {
    query,
    lectures: empty,
    articles: empty,
    books: empty,
    scholars: empty,
    total: 0,
  };
}
