// src/features/search/queries/search.queries.ts

import { db } from "@core/database/client";
import { lectures, articles, books, scholars } from "@core/database/schema";
import { eq, and, isNull, desc, sql, count, or, ilike } from "drizzle-orm";

import type {
  SearchResults,
  LectureSearchResult,
  ArticleSearchResult,
  BookSearchResult,
  ScholarSearchResult,
} from "../types/search.types";

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Number of results shown per content type when searching "all".
 *
 * Example:
 *   /search?q=tawheed
 *
 * Returns up to:
 *   5 lectures
 *   5 articles
 *   5 books
 *   5 scholars
 */
const PER_TYPE_LIMIT = 5;

/**
 * Number of results per page when filtering to a single content type.
 *
 * Example:
 *   /search?q=tawheed&type=lectures&page=2
 */
const PAGE_LIMIT = 12;

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC SEARCH FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

export async function search(
  query: string,
  type: "all" | "lectures" | "articles" | "books" | "scholars" = "all",
  page: number = 1,
): Promise<SearchResults> {
  // Preserve the original query for the response while using a cleaned
  // version internally for database searching.
  const trimmedQuery = query.trim();

  // Empty search should never hit the database.
  if (!trimmedQuery) {
    return emptyResults(query);
  }

  // Protect against invalid page numbers.
  const safePage = Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1);

  const offset = (safePage - 1) * PAGE_LIMIT;

  return executeSearch(trimmedQuery, type, offset);
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH EXECUTION
// ─────────────────────────────────────────────────────────────────────────────

async function executeSearch(
  query: string,
  type: "all" | "lectures" | "articles" | "books" | "scholars",
  offset: number,
): Promise<SearchResults> {
  /**
   * PostgreSQL full-text search.
   *
   * websearch_to_tsquery() is preferable for user-entered search text because
   * it understands normal search syntax more naturally than plainto_tsquery().
   *
   * Example:
   *   "tawheed"
   *   "importance of salah"
   *   "Quran OR Sunnah"
   */
  const tsQuery = sql`
    websearch_to_tsquery('simple', ${query})
  `;

  /**
   * ILIKE fallback/partial matching.
   *
   * This means a query such as:
   *
   *   "foundation"
   *
   * can still find:
   *
   *   "The Foundations of Islaam"
   *
   * even when PostgreSQL FTS does not produce the desired match.
   */
  const likePattern = `%${query}%`;

  // ───────────────────────────────────────────────────────────────────────────
  // WHERE CONDITIONS
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * IMPORTANT:
   *
   * FTS and ILIKE are intentionally combined with OR.
   *
   * We do NOT run FTS first and only run ILIKE when FTS returns zero rows.
   *
   * This gives us:
   *
   *   FTS        → good relevance
   *   ILIKE      → good partial matching
   *
   * together.
   */

  const lectureWhere = and(
    eq(lectures.status, "published"),
    isNull(lectures.deletedAt),
    or(
      sql`${lectures.searchVector} @@ ${tsQuery}`,
      ilike(lectures.title, likePattern),
      ilike(lectures.description, likePattern),
    ),
  );

  const articleWhere = and(
    eq(articles.status, "published"),
    isNull(articles.deletedAt),
    or(
      sql`${articles.searchVector} @@ ${tsQuery}`,
      ilike(articles.title, likePattern),
      ilike(articles.excerpt, likePattern),
    ),
  );

  const bookWhere = and(
    eq(books.status, "published"),
    isNull(books.deletedAt),
    or(
      sql`${books.searchVector} @@ ${tsQuery}`,
      ilike(books.title, likePattern),
      ilike(books.authorName, likePattern),
      ilike(books.description, likePattern),
    ),
  );

  const scholarWhere = and(
    eq(scholars.isActive, true),
    isNull(scholars.deletedAt),
    or(
      sql`${scholars.searchVector} @@ ${tsQuery}`,
      ilike(scholars.name, likePattern),
      ilike(scholars.arabicName, likePattern),
      ilike(scholars.nationality, likePattern),
      ilike(scholars.biography, likePattern),
    ),
  );

  // ───────────────────────────────────────────────────────────────────────────
  // LIMITS / OFFSETS
  // ───────────────────────────────────────────────────────────────────────────

  const lectureLimit = type === "lectures" ? PAGE_LIMIT : PER_TYPE_LIMIT;

  const articleLimit = type === "articles" ? PAGE_LIMIT : PER_TYPE_LIMIT;

  const bookLimit = type === "books" ? PAGE_LIMIT : PER_TYPE_LIMIT;

  const scholarLimit = type === "scholars" ? PAGE_LIMIT : PER_TYPE_LIMIT;

  const lectureOffset = type === "lectures" ? offset : 0;
  const articleOffset = type === "articles" ? offset : 0;
  const bookOffset = type === "books" ? offset : 0;
  const scholarOffset = type === "scholars" ? offset : 0;

  // ───────────────────────────────────────────────────────────────────────────
  // EXECUTE SEARCHES IN PARALLEL
  // ───────────────────────────────────────────────────────────────────────────
  //
  // We keep the existing behaviour here intentionally:
  //
  //   - all four content types are queried
  //   - when type !== "all", only the selected type receives pagination
  //
  // This preserves the current SearchResults shape and avoids introducing
  // conditional Promise.all complexity that could accidentally change the API.
  //
  // If performance becomes important at a much larger scale, these queries can
  // later be split into type-specific execution paths.
  // ───────────────────────────────────────────────────────────────────────────

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
    // ─────────────────────────────────────────────────────────────────────────
    // LECTURES
    // ─────────────────────────────────────────────────────────────────────────

    db.query.lectures.findMany({
      where: lectureWhere,

      /**
       * Ranking strategy:
       *
       * 1. Records matching FTS receive ts_rank().
       * 2. ILIKE-only matches receive rank 0.
       * 3. More recent published content wins when relevance is equal.
       *
       * This gives us relevance without excluding partial matches.
       */
      orderBy: [
        desc(
          sql`
            CASE
              WHEN ${lectures.searchVector} IS NOT NULL
                AND ${lectures.searchVector} @@ ${tsQuery}
              THEN ts_rank(
                ${lectures.searchVector},
                ${tsQuery}
              )
              ELSE 0
            END
          `,
        ),
        desc(lectures.publishedAt),
      ],

      limit: lectureLimit,
      offset: lectureOffset,

      with: {
        scholar: {
          columns: {
            name: true,
            honorifics: true,
          },
        },

        category: {
          columns: {
            name: true,
          },
        },

        thumbnailAsset: {
          columns: {
            publicUrl: true,
          },
        },
      },
    }),

    db
      .select({
        count: count(),
      })
      .from(lectures)
      .where(lectureWhere),

    // ─────────────────────────────────────────────────────────────────────────
    // ARTICLES
    // ─────────────────────────────────────────────────────────────────────────

    db.query.articles.findMany({
      where: articleWhere,

      orderBy: [
        desc(
          sql`
            CASE
              WHEN ${articles.searchVector} IS NOT NULL
                AND ${articles.searchVector} @@ ${tsQuery}
              THEN ts_rank(
                ${articles.searchVector},
                ${tsQuery}
              )
              ELSE 0
            END
          `,
        ),
        desc(articles.publishedAt),
      ],

      limit: articleLimit,
      offset: articleOffset,

      with: {
        scholar: {
          columns: {
            name: true,
            honorifics: true,
          },
        },

        category: {
          columns: {
            name: true,
          },
        },

        coverAsset: {
          columns: {
            publicUrl: true,
          },
        },
      },
    }),

    db
      .select({
        count: count(),
      })
      .from(articles)
      .where(articleWhere),

    // ─────────────────────────────────────────────────────────────────────────
    // BOOKS
    // ─────────────────────────────────────────────────────────────────────────

    db.query.books.findMany({
      where: bookWhere,

      orderBy: [
        desc(
          sql`
            CASE
              WHEN ${books.searchVector} IS NOT NULL
                AND ${books.searchVector} @@ ${tsQuery}
              THEN ts_rank(
                ${books.searchVector},
                ${tsQuery}
              )
              ELSE 0
            END
          `,
        ),
        desc(books.publishedAt),
      ],

      limit: bookLimit,
      offset: bookOffset,

      with: {
        coverAsset: {
          columns: {
            publicUrl: true,
          },
        },
      },
    }),

    db
      .select({
        count: count(),
      })
      .from(books)
      .where(bookWhere),

    // ─────────────────────────────────────────────────────────────────────────
    // SCHOLARS
    // ─────────────────────────────────────────────────────────────────────────

    db.query.scholars.findMany({
      where: scholarWhere,

      orderBy: [
        desc(
          sql`
            CASE
              WHEN ${scholars.searchVector} IS NOT NULL
                AND ${scholars.searchVector} @@ ${tsQuery}
              THEN ts_rank(
                ${scholars.searchVector},
                ${tsQuery}
              )
              ELSE 0
            END
          `,
        ),
        desc(scholars.lectureCount),
      ],

      limit: scholarLimit,
      offset: scholarOffset,

      with: {
        avatarAsset: {
          columns: {
            publicUrl: true,
          },
        },
      },
    }),

    db
      .select({
        count: count(),
      })
      .from(scholars)
      .where(scholarWhere),
  ]);

  // ───────────────────────────────────────────────────────────────────────────
  // SHAPE LECTURE RESULTS
  // ───────────────────────────────────────────────────────────────────────────

  const mappedLectures: LectureSearchResult[] = lectureRows.map((lecture) => ({
    kind: "lecture" as const,

    id: lecture.id,
    slug: lecture.slug,
    title: lecture.title,
    description: lecture.description,

    durationSecs: lecture.durationSecs,
    publishedAt: lecture.publishedAt,

    scholarName: lecture.scholar
      ? [lecture.scholar.honorifics, lecture.scholar.name]
          .filter(Boolean)
          .join(" ")
      : null,

    categoryName: lecture.category?.name ?? null,

    thumbnailUrl: lecture.thumbnailAsset?.publicUrl ?? null,
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // SHAPE ARTICLE RESULTS
  // ───────────────────────────────────────────────────────────────────────────

  const mappedArticles: ArticleSearchResult[] = articleRows.map((article) => ({
    kind: "article" as const,

    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,

    readingTimeMins: article.readingTimeMins,
    publishedAt: article.publishedAt,

    scholarName: article.scholar
      ? [article.scholar.honorifics, article.scholar.name]
          .filter(Boolean)
          .join(" ")
      : null,

    categoryName: article.category?.name ?? null,

    coverUrl: article.coverAsset?.publicUrl ?? null,
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // SHAPE BOOK RESULTS
  // ───────────────────────────────────────────────────────────────────────────

  const mappedBooks: BookSearchResult[] = bookRows.map((book) => ({
    kind: "book" as const,

    id: book.id,
    slug: book.slug,
    title: book.title,

    authorName: book.authorName,
    pageCount: book.pageCount,
    language: book.language,

    coverUrl: book.coverAsset?.publicUrl ?? null,

    isFree: book.allowFreeDownload,
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // SHAPE SCHOLAR RESULTS
  // ───────────────────────────────────────────────────────────────────────────

  const mappedScholars: ScholarSearchResult[] = scholarRows.map((scholar) => ({
    kind: "scholar" as const,

    id: scholar.id,
    slug: scholar.slug,
    name: scholar.name,

    honorifics: scholar.honorifics,
    arabicName: scholar.arabicName,
    nationality: scholar.nationality,

    lectureCount: scholar.lectureCount,
    articleCount: scholar.articleCount,

    avatarUrl: scholar.avatarAsset?.publicUrl ?? null,
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // TOTALS
  // ───────────────────────────────────────────────────────────────────────────
  //
  // Number() makes the result explicitly compatible with SearchResults.total
  // even if the database driver's count representation changes.
  // ───────────────────────────────────────────────────────────────────────────

  const lectureTotal = Number(lectureCount[0]?.count ?? 0);
  const articleTotal = Number(articleCount[0]?.count ?? 0);
  const bookTotal = Number(bookCount[0]?.count ?? 0);
  const scholarTotal = Number(scholarCount[0]?.count ?? 0);

  // ───────────────────────────────────────────────────────────────────────────
  // FINAL RESULT
  // ───────────────────────────────────────────────────────────────────────────

  return {
    query,

    lectures: {
      items: mappedLectures,
      total: lectureTotal,
    },

    articles: {
      items: mappedArticles,
      total: articleTotal,
    },

    books: {
      items: mappedBooks,
      total: bookTotal,
    },

    scholars: {
      items: mappedScholars,
      total: scholarTotal,
    },

    total: lectureTotal + articleTotal + bookTotal + scholarTotal,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY RESULT
// ─────────────────────────────────────────────────────────────────────────────

function emptyResults(query: string): SearchResults {
  const empty = {
    items: [],
    total: 0,
  };

  return {
    query,

    lectures: empty,
    articles: empty,
    books: empty,
    scholars: empty,

    total: 0,
  };
}
