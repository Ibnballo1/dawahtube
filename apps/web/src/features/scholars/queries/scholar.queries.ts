// src/features/scholars/queries/scholar.queries.ts
import { db } from "@core/database/client";
import { unstable_cache } from "next/cache";
import { scholars, lectures, articles } from "@core/database/schema";
import { eq, and, isNull, desc, asc, count, sql } from "drizzle-orm";
import type {
  ScholarFilters,
  ScholarListResult,
  ScholarProfile,
  ScholarContentResult,
} from "../types/scholar.types";

const PAGE_SIZE = 16;

// ─── Directory listing ────────────────────────────────────────────────────────

export async function getScholars(
  filters: ScholarFilters = {},
): Promise<ScholarListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [eq(scholars.isActive, true), isNull(scholars.deletedAt)];

  if (filters.query) {
    conditions.push(
      sql`${scholars.searchVector} @@ websearch_to_tsquery('simple', ${filters.query})`,
    );
  }

  if (filters.nationality) {
    conditions.push(eq(scholars.nationality, filters.nationality));
  }

  const orderBy = (() => {
    switch (filters.sort) {
      case "name-desc":
        return [desc(scholars.name)];
      case "lectures-desc":
        return [desc(scholars.lectureCount)];
      case "newest":
        return [desc(scholars.createdAt)];
      default:
        return [asc(scholars.name)];
    }
  })();

  const where = and(...conditions);

  const [totalResult, rows] = await Promise.all([
    db.select({ count: count() }).from(scholars).where(where),
    db.query.scholars.findMany({
      where,
      orderBy,
      limit: PAGE_SIZE,
      offset,
      with: { avatarAsset: { columns: { publicUrl: true, altText: true } } },
    }),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    scholars: rows as ScholarListResult["scholars"],
    total,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// ─── Profile query ────────────────────────────────────────────────────────────

export const getScholarBySlug = unstable_cache(
  async (slug: string): Promise<ScholarProfile | null> => {
    const scholar = await db.query.scholars.findFirst({
      where: (s) =>
        and(eq(s.slug, slug), eq(s.isActive, true), isNull(s.deletedAt)),
      with: { avatarAsset: true, bannerAsset: true },
    });
    return (scholar as ScholarProfile | undefined) ?? null;
  },
  ["scholar-profile"],
  {
    tags: ["scholars"],
    revalidate: 3600,
  },
);

// ─── Scholar content (lectures + articles) ────────────────────────────────────

export const getScholarContent = unstable_cache(
  async (scholarId: string): Promise<ScholarContentResult> => {
    const [lectureRows, articleRows] = await Promise.all([
      db.query.lectures.findMany({
        where: (l) =>
          and(
            eq(l.scholarId, scholarId),
            eq(l.status, "published"),
            isNull(l.deletedAt),
          ),
        orderBy: (l) => [desc(l.publishedAt)],
        limit: 20,
        with: {
          category: { columns: { id: true, slug: true, name: true } },
          thumbnailAsset: { columns: { publicUrl: true, altText: true } },
          audioAsset: { columns: { id: true, durationSecs: true } },
        },
      }),
      db.query.articles.findMany({
        where: (a) =>
          and(
            eq(a.scholarId, scholarId),
            eq(a.status, "published"),
            isNull(a.deletedAt),
          ),
        orderBy: (a) => [desc(a.publishedAt)],
        limit: 20,
        with: {
          category: { columns: { id: true, slug: true, name: true } },
          coverAsset: { columns: { publicUrl: true, altText: true } },
        },
      }),
    ]);

    return {
      lectures: lectureRows as ScholarContentResult["lectures"],
      articles: articleRows as ScholarContentResult["articles"],
      totalLectures: lectureRows.length,
      totalArticles: articleRows.length,
    };
  },
  ["scholar-content"],
  {
    tags: ["scholars"],
    revalidate: 3600,
  },
);

// ─── Filter options ───────────────────────────────────────────────────────────

export const getScholarFilterOptions = unstable_cache(
  async () => {
    const rows = await db
      .select({
        nationality: scholars.nationality,
        count: sql<number>`count(*)::int`,
      })
      .from(scholars)
      .where(
        and(
          eq(scholars.isActive, true),
          isNull(scholars.deletedAt),
          sql`${scholars.nationality} IS NOT NULL`,
        ),
      )
      .groupBy(scholars.nationality)
      .orderBy(desc(sql`count(*)`));

    return rows.filter(
      (r): r is { nationality: string; count: number } =>
        r.nationality !== null,
    );
  },
  ["scholar-filter-options"],
  { tags: ["scholar-filters"], revalidate: 86400 },
);

// ─── generateStaticParams helper ─────────────────────────────────────────────

export async function getAllActiveScholarSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: scholars.slug })
    .from(scholars)
    .where(and(eq(scholars.isActive, true), isNull(scholars.deletedAt)));
  return rows.map((r) => r.slug);
}

// ─── Canonical slug lookup ────────────────────────────────────────────────────

export async function getScholarByCanonicalSlug(
  canonicalSlug: string,
): Promise<{ slug: string } | null> {
  const row = await db.query.scholars.findFirst({
    where: (s) =>
      and(
        eq(s.canonicalSlug, canonicalSlug),
        eq(s.isActive, true),
        isNull(s.deletedAt),
      ),
    columns: { slug: true },
  });
  return row ?? null;
}
