// src/features/admin/queries/analytics.queries.ts
import { db } from "@core/database/client";
import { lectures, articles, books, scholars } from "@core/database/schema";
import { eq, and, isNull, desc, sum, count } from "drizzle-orm";

export async function getTopLectures(limit = 10) {
  return db.query.lectures.findMany({
    where: and(eq(lectures.status, "published"), isNull(lectures.deletedAt)),
    orderBy: [desc(lectures.viewCount)],
    limit,
    with: {
      scholar: {
        columns: { id: true, slug: true, name: true, honorifics: true },
      },
      thumbnailAsset: { columns: { publicUrl: true } },
    },
    columns: {
      id: true,
      slug: true,
      title: true,
      viewCount: true,
      publishedAt: true,
    },
  });
}

export async function getTopArticles(limit = 10) {
  return db.query.articles.findMany({
    where: and(eq(articles.status, "published"), isNull(articles.deletedAt)),
    orderBy: [desc(articles.viewCount)],
    limit,
    with: {
      scholar: {
        columns: { id: true, slug: true, name: true, honorifics: true },
      },
    },
    columns: {
      id: true,
      slug: true,
      title: true,
      viewCount: true,
      publishedAt: true,
    },
  });
}

export async function getTopScholars(limit = 10) {
  const rows = await db
    .select({
      scholarId: lectures.scholarId,
      totalViews: sum(lectures.viewCount).mapWith(Number),
      lectureCount: count(lectures.id),
    })
    .from(lectures)
    .where(and(eq(lectures.status, "published"), isNull(lectures.deletedAt)))
    .groupBy(lectures.scholarId)
    .orderBy(desc(sum(lectures.viewCount)))
    .limit(limit);

  if (!rows.length) return [];

  const scholarIds = rows
    .map((r) => r.scholarId)
    .filter((id): id is string => !!id);
  const scholarDetails = await db.query.scholars.findMany({
    where: (s, { inArray }) => inArray(s.id, scholarIds),
    columns: { id: true, slug: true, name: true, honorifics: true },
    with: { avatarAsset: { columns: { publicUrl: true } } },
  });
  const scholarMap = Object.fromEntries(scholarDetails.map((s) => [s.id, s]));

  return rows
    .filter((r) => r.scholarId && scholarMap[r.scholarId])
    .map((r) => ({
      scholar: scholarMap[r.scholarId!]!,
      totalViews: r.totalViews ?? 0,
      lectureCount: r.lectureCount ?? 0,
    }));
}

export async function getPlatformTotals() {
  const [lv, av, bv, pl, pa, pb, ts] = await Promise.all([
    db
      .select({ total: sum(lectures.viewCount).mapWith(Number) })
      .from(lectures)
      .where(and(eq(lectures.status, "published"), isNull(lectures.deletedAt))),
    db
      .select({ total: sum(articles.viewCount).mapWith(Number) })
      .from(articles)
      .where(and(eq(articles.status, "published"), isNull(articles.deletedAt))),
    db
      .select({ total: sum(books.viewCount).mapWith(Number) })
      .from(books)
      .where(and(eq(books.status, "published"), isNull(books.deletedAt))),
    db
      .select({ count: count() })
      .from(lectures)
      .where(and(eq(lectures.status, "published"), isNull(lectures.deletedAt))),
    db
      .select({ count: count() })
      .from(articles)
      .where(and(eq(articles.status, "published"), isNull(articles.deletedAt))),
    db
      .select({ count: count() })
      .from(books)
      .where(and(eq(books.status, "published"), isNull(books.deletedAt))),
    db
      .select({ count: count() })
      .from(scholars)
      .where(and(eq(scholars.isActive, true), isNull(scholars.deletedAt))),
  ]);
  return {
    lectureViews: lv[0]?.total ?? 0,
    articleViews: av[0]?.total ?? 0,
    bookDownloads: bv[0]?.total ?? 0,
    publishedLectures: pl[0]?.count ?? 0,
    publishedArticles: pa[0]?.count ?? 0,
    publishedBooks: pb[0]?.count ?? 0,
    totalScholars: ts[0]?.count ?? 0,
  };
}

export async function getRecentlyPublished(limit = 8) {
  const [rl, ra] = await Promise.all([
    db.query.lectures.findMany({
      where: and(eq(lectures.status, "published"), isNull(lectures.deletedAt)),
      orderBy: [desc(lectures.publishedAt)],
      limit,
      columns: {
        id: true,
        slug: true,
        title: true,
        viewCount: true,
        publishedAt: true,
      },
      with: { scholar: { columns: { name: true, honorifics: true } } },
    }),
    db.query.articles.findMany({
      where: and(eq(articles.status, "published"), isNull(articles.deletedAt)),
      orderBy: [desc(articles.publishedAt)],
      limit,
      columns: {
        id: true,
        slug: true,
        title: true,
        viewCount: true,
        publishedAt: true,
      },
      with: { scholar: { columns: { name: true, honorifics: true } } },
    }),
  ]);
  return [
    ...rl.map((l) => ({ ...l, type: "lecture" as const })),
    ...ra.map((a) => ({ ...a, type: "article" as const })),
  ]
    .sort(
      (a, b) =>
        new Date(b.publishedAt ?? 0).getTime() -
        new Date(a.publishedAt ?? 0).getTime(),
    )
    .slice(0, limit);
}
