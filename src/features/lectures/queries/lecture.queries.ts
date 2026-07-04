// src/features/lectures/queries/lecture.queries.ts
import { db } from "@core/database/client";
import { unstable_cache } from "next/cache";
import {
  lectures,
  scholars,
  lectureCategories,
  mediaAssets,
  lectureTags,
  tags,
  seriesItems,
  series,
} from "@core/database/schema";
import {
  eq,
  and,
  isNull,
  ilike,
  or,
  desc,
  asc,
  count,
  sql,
  inArray,
} from "drizzle-orm";
import type {
  LectureFilters,
  LectureListResult,
  LectureDetail,
  LectureSeriesContext,
} from "../types/lecture.types";

const PAGE_SIZE = 12;

// ─── Listing query ────────────────────────────────────────────────────────────

export async function getLectures(
  filters: LectureFilters = {},
): Promise<LectureListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * PAGE_SIZE;

  // ── Build WHERE conditions ────────────────────────────────────────────────
  const conditions = [
    eq(lectures.status, "published"),
    isNull(lectures.deletedAt),
  ];

  if (filters.query) {
    // Use the FTS search_vector for keyword queries
    conditions.push(
      sql`${lectures.searchVector} @@ websearch_to_tsquery('simple', ${filters.query})`,
    );
  }

  if (filters.categoryId) {
    conditions.push(eq(lectures.categoryId, filters.categoryId));
  }

  if (filters.scholarId) {
    conditions.push(eq(lectures.scholarId, filters.scholarId));
  }

  // ── Build ORDER BY ────────────────────────────────────────────────────────
  const orderBy = (() => {
    switch (filters.sort) {
      case "oldest":
        return [asc(lectures.publishedAt)];
      case "popular":
        return [desc(sql`${lectures.viewCount}::bigint`)];
      case "duration-asc":
        return [asc(lectures.durationSecs)];
      case "duration-desc":
        return [desc(lectures.durationSecs)];
      case "newest":
      default:
        return [desc(lectures.publishedAt)];
    }
  })();

  // ── Tag filter — requires a subquery join ────────────────────────────────
  // Tags use a join table, so we filter with an EXISTS subquery when needed
  if (filters.tagSlug) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${lectureTags} lt
        JOIN ${tags} t ON t.id = lt.tag_id
        WHERE lt.lecture_id = ${lectures.id}
        AND t.slug = ${filters.tagSlug}
      )`,
    );
  }

  const where = and(...conditions);

  // ── Run count + data in parallel ──────────────────────────────────────────
  const [totalResult, rows] = await Promise.all([
    db.select({ count: count() }).from(lectures).where(where),
    db.query.lectures.findMany({
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
        thumbnailAsset: { columns: { publicUrl: true, altText: true } },
        audioAsset: { columns: { id: true, durationSecs: true } },
        tags: {
          with: { tag: { columns: { id: true, slug: true, name: true } } },
        },
      },
    }),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    lectures: rows as LectureListResult["lectures"],
    total,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// ─── Detail query ─────────────────────────────────────────────────────────────

export const getLectureBySlug = unstable_cache(
  async (slug: string): Promise<LectureDetail | null> => {
    const lecture = await db.query.lectures.findFirst({
      where: (l) =>
        and(eq(l.slug, slug), eq(l.status, "published"), isNull(l.deletedAt)),
      with: {
        scholar: { with: { avatarAsset: true } },
        category: true,
        audioAsset: true,
        videoAsset: true,
        thumbnailAsset: { columns: { publicUrl: true, altText: true } },
        tags: {
          with: { tag: { columns: { id: true, slug: true, label: true } } },
        },
        seriesItems: {
          with: {
            series: {
              columns: { id: true, slug: true, title: true },
            },
          },
        },
      },
    });

    return (lecture as LectureDetail | undefined) ?? null;
  },
  ["lecture-detail"],
  {
    tags: ["lectures"],
    revalidate: 3600,
  } as unknown as Parameters<typeof unstable_cache>[2],
);

// ─── Historical canonical slug lookup ────────────────────────────────────────
// Used by the detail page to detect renamed slugs and issue 301 redirects.

export async function getLectureByCanonicalSlug(
  canonicalSlug: string,
): Promise<{ slug: string } | null> {
  const row = await db.query.lectures.findFirst({
    where: (l) =>
      and(
        eq(l.canonicalSlug, canonicalSlug),
        eq(l.status, "published"),
        isNull(l.deletedAt),
      ),
    columns: { slug: true },
  });
  return row ?? null;
}

// ─── Series context for a lecture ────────────────────────────────────────────

export const getLectureSeriesContext = unstable_cache(
  async (lectureId: string): Promise<LectureSeriesContext | null> => {
    // Find any series this lecture belongs to (use first one if multiple)
    const item = await db.query.seriesItems.findFirst({
      where: eq(seriesItems.lectureId, lectureId),
      with: {
        series: {
          columns: {
            id: true,
            slug: true,
            title: true,
            itemCount: true,
          },
        },
      },
      orderBy: [asc(seriesItems.position)],
    });

    if (!item?.series) return null;

    // Fetch all items in this series for prev/next navigation
    const allItems = await db.query.seriesItems.findMany({
      where: eq(seriesItems.seriesId, item.seriesId),
      orderBy: [asc(seriesItems.position)],
      with: {
        lecture: {
          columns: {
            id: true,
            slug: true,
            title: true,
            durationSecs: true,
          },
        },
      },
    });

    const navItems = allItems.map((si) => ({
      position: si.position,
      lectureId: si.lectureId,
      slug: si.lecture.slug,
      title: si.lecture.title,
      durationSecs: si.lecture.durationSecs,
    }));

    const currentIndex = navItems.findIndex((n) => n.lectureId === lectureId);

    return {
      series: item.series,
      position: item.position,
      prev: currentIndex > 0 ? (navItems[currentIndex - 1] ?? null) : null,
      next:
        currentIndex < navItems.length - 1
          ? (navItems[currentIndex + 1] ?? null)
          : null,
      items: navItems,
    };
  },
  ["lecture-series-context"],
  {
    tags: ["lecture-series-context"],
    revalidate: 3600,
  },
);

// ─── Related lectures ─────────────────────────────────────────────────────────

export const getRelatedLectures = unstable_cache(
  async (
    lectureId: string,
    categoryId: string | null,
    scholarId: string | null,
  ) => {
    // Strategy: same scholar first, then same category, exclude current
    const conditions = [
      eq(lectures.status, "published"),
      isNull(lectures.deletedAt),
      sql`${lectures.id} != ${lectureId}`,
    ];

    if (scholarId) {
      conditions.push(eq(lectures.scholarId, scholarId));
    } else if (categoryId) {
      conditions.push(eq(lectures.categoryId, categoryId));
    }

    const rows = await db.query.lectures.findMany({
      where: and(...conditions),
      orderBy: [desc(lectures.publishedAt)],
      limit: 4,
      with: {
        scholar: {
          columns: { id: true, slug: true, name: true, honorifics: true },
          with: {
            avatarAsset: { columns: { publicUrl: true, altText: true } },
          },
        },
        thumbnailAsset: { columns: { publicUrl: true, altText: true } },
      },
    });

    return rows;
  },
  ["related-lectures"],
  {
    tags: ["related-lectures"],
    revalidate: 3600,
  },
);

// ─── Filter options (categories + scholars with counts) ───────────────────────

export const getLectureFilterOptions = unstable_cache(
  async () => {
    const [categoryRows, scholarRows] = await Promise.all([
      db
        .select({
          id: lectureCategories.id,
          slug: lectureCategories.slug,
          name: lectureCategories.name,
          count: sql<number>`count(${lectures.id})::int`,
        })
        .from(lectureCategories)
        .leftJoin(
          lectures,
          and(
            eq(lectures.categoryId, lectureCategories.id),
            eq(lectures.status, "published"),
            isNull(lectures.deletedAt),
          ),
        )
        .where(eq(lectureCategories.isActive, true))
        .groupBy(
          lectureCategories.id,
          lectureCategories.slug,
          lectureCategories.name,
        )
        .orderBy(asc(lectureCategories.name)),

      db
        .select({
          id: scholars.id,
          slug: scholars.slug,
          name: scholars.name,
          honorifics: scholars.honorifics,
          count: sql<number>`count(${lectures.id})::int`,
        })
        .from(scholars)
        .leftJoin(
          lectures,
          and(
            eq(lectures.scholarId, scholars.id),
            eq(lectures.status, "published"),
            isNull(lectures.deletedAt),
          ),
        )
        .where(and(eq(scholars.isActive, true), isNull(scholars.deletedAt)))
        .groupBy(scholars.id, scholars.slug, scholars.name, scholars.honorifics)
        .having(sql`count(${lectures.id}) > 0`)
        .orderBy(asc(scholars.name)),
    ]);

    return { categories: categoryRows, scholars: scholarRows };
  },
  ["lecture-filter-options"],
  { tags: ["lecture-filters"], revalidate: 86400 },
);

// ─── generateStaticParams helper ─────────────────────────────────────────────

export async function getAllPublishedLectureSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: lectures.slug })
    .from(lectures)
    .where(and(eq(lectures.status, "published"), isNull(lectures.deletedAt)));

  return rows.map((r) => r.slug);
}
