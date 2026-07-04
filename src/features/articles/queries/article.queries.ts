// src/features/articles/queries/article.queries.ts
import { db } from "@core/database/client";
import { unstable_cache } from "next/cache";
import {
  articles,
  articleCategories,
  scholars,
  articleTags,
  tags,
} from "@core/database/schema";
import { eq, and, isNull, desc, asc, count, sql } from "drizzle-orm";
import type {
  ArticleFilters,
  ArticleListResult,
  ArticleDetail,
} from "../types/article.types";

const PAGE_SIZE = 12;

// ─── Listing query ────────────────────────────────────────────────────────────

export async function getArticles(
  filters: ArticleFilters = {},
): Promise<ArticleListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [
    eq(articles.status, "published"),
    isNull(articles.deletedAt),
  ];

  if (filters.query) {
    conditions.push(
      sql`${articles.searchVector} @@ websearch_to_tsquery('simple', ${filters.query})`,
    );
  }

  if (filters.categoryId) {
    conditions.push(eq(articles.categoryId, filters.categoryId));
  }

  if (filters.scholarId) {
    conditions.push(eq(articles.scholarId, filters.scholarId));
  }

  if (filters.tagSlug) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${articleTags} at
        JOIN ${tags} t ON t.id = at.tag_id
        WHERE at.article_id = ${articles.id}
        AND t.slug = ${filters.tagSlug}
      )`,
    );
  }

  const orderBy = (() => {
    switch (filters.sort) {
      case "oldest":
        return [asc(articles.publishedAt)];
      case "popular":
        return [desc(sql`${articles.viewCount}::bigint`)];
      case "reading-time-asc":
        return [asc(articles.readingTimeMins)];
      case "reading-time-desc":
        return [desc(articles.readingTimeMins)];
      case "newest":
      default:
        return [desc(articles.publishedAt)];
    }
  })();

  const where = and(...conditions);

  const [totalResult, rows] = await Promise.all([
    db.select({ count: count() }).from(articles).where(where),
    db.query.articles.findMany({
      where,
      orderBy,
      limit: PAGE_SIZE,
      offset,
      with: {
        scholar: {
          columns: { id: true, slug: true, name: true, honorifics: true },
          with: {
            avatarAsset: { columns: { publicUrl: true, altText: true } },
          },
        },
        category: { columns: { id: true, slug: true, name: true } },
        coverAsset: { columns: { publicUrl: true, altText: true } },
        tags: {
          with: { tag: { columns: { id: true, slug: true, label: true } } },
        },
      },
    }),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    articles: rows as unknown as ArticleListResult["articles"],
    total,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// ─── Detail query ─────────────────────────────────────────────────────────────

export const getArticleBySlug = unstable_cache(
  async (slug: string): Promise<ArticleDetail | null> => {
    const article = await db.query.articles.findFirst({
      where: (a) =>
        and(eq(a.slug, slug), eq(a.status, "published"), isNull(a.deletedAt)),
      with: {
        scholar: { with: { avatarAsset: true } },
        category: true,
        author: { columns: { id: true, name: true } },
        coverAsset: true,
        tags: {
          with: { tag: { columns: { id: true, slug: true, label: true } } },
        },
      },
    });

    return (article as ArticleDetail | undefined) ?? null;
  },
  ["article-detail"],
  {
    tags: ["articles"],
    revalidate: 3600,
  } as Parameters<typeof unstable_cache>[2],
);

// ─── Canonical slug lookup (for 301 redirects) ───────────────────────────────

export async function getArticleByCanonicalSlug(
  canonicalSlug: string,
): Promise<{ slug: string } | null> {
  const row = await db.query.articles.findFirst({
    where: (a) =>
      and(
        eq(a.canonicalSlug, canonicalSlug),
        eq(a.status, "published"),
        isNull(a.deletedAt),
      ),
    columns: { slug: true },
  });
  return row ?? null;
}

// ─── Related articles ─────────────────────────────────────────────────────────

export const getRelatedArticles = unstable_cache(
  async (
    articleId: string,
    categoryId: string | null,
    scholarId: string | null,
  ) => {
    const conditions = [
      eq(articles.status, "published"),
      isNull(articles.deletedAt),
      sql`${articles.id} != ${articleId}`,
    ];

    if (scholarId) {
      conditions.push(eq(articles.scholarId, scholarId));
    } else if (categoryId) {
      conditions.push(eq(articles.categoryId, categoryId));
    }

    return db.query.articles.findMany({
      where: and(...conditions),
      orderBy: [desc(articles.publishedAt)],
      limit: 4,
      with: {
        scholar: {
          columns: { id: true, slug: true, name: true, honorifics: true },
          with: {
            avatarAsset: { columns: { publicUrl: true, altText: true } },
          },
        },
        coverAsset: { columns: { publicUrl: true, altText: true } },
      },
    });
  },
  ["related-articles"],
  {
    tags: ["related-articles"],
    revalidate: 3600,
  },
);

// ─── Filter options ───────────────────────────────────────────────────────────

export const getArticleFilterOptions = unstable_cache(
  async () => {
    const [categoryRows, scholarRows] = await Promise.all([
      db
        .select({
          id: articleCategories.id,
          slug: articleCategories.slug,
          name: articleCategories.name,
          count: sql<number>`count(${articles.id})::int`,
        })
        .from(articleCategories)
        .leftJoin(
          articles,
          and(
            eq(articles.categoryId, articleCategories.id),
            eq(articles.status, "published"),
            isNull(articles.deletedAt),
          ),
        )
        .where(eq(articleCategories.isActive, true))
        .groupBy(
          articleCategories.id,
          articleCategories.slug,
          articleCategories.name,
        )
        .orderBy(asc(articleCategories.name)),

      db
        .select({
          id: scholars.id,
          slug: scholars.slug,
          name: scholars.name,
          honorifics: scholars.honorifics,
          count: sql<number>`count(${articles.id})::int`,
        })
        .from(scholars)
        .leftJoin(
          articles,
          and(
            eq(articles.scholarId, scholars.id),
            eq(articles.status, "published"),
            isNull(articles.deletedAt),
          ),
        )
        .where(and(eq(scholars.isActive, true), isNull(scholars.deletedAt)))
        .groupBy(scholars.id, scholars.slug, scholars.name, scholars.honorifics)
        .having(sql`count(${articles.id}) > 0`)
        .orderBy(asc(scholars.name)),
    ]);

    return { categories: categoryRows, scholars: scholarRows };
  },
  ["article-filter-options"],
  { tags: ["article-filters"], revalidate: 86400 },
);

// ─── generateStaticParams helper ─────────────────────────────────────────────

export async function getAllPublishedArticleSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: articles.slug })
    .from(articles)
    .where(and(eq(articles.status, "published"), isNull(articles.deletedAt)));

  return rows.map((r) => r.slug);
}
