// src/app/api/v1/search/route.ts
import { type NextRequest } from "next/server";
import { db } from "@core/database/client";
import { lectures, scholars, series } from "@core/database/schema";
import { eq, and, isNull, desc, count, sql, ilike, or } from "drizzle-orm";
import { ok, err, withCors, OPTIONS, parsePagination } from "../_helpers";

export { OPTIONS };

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const q = sp.get("q")?.trim();
    const type = sp.get("type") ?? "all"; // all | lectures | scholars | series
    const { page, limit, offset } = parsePagination(sp, 10, 20);

    if (!q)
      return withCors(ok({ lectures: [], scholars: [], series: [], total: 0 }));

    const tsQuery = sql`websearch_to_tsquery('simple', ${q})`;
    const likeTerm = `%${q}%`;

    // ── Lectures ────────────────────────────────────────────────────────────
    const lectureWhere = and(
      eq(lectures.status, "published"),
      isNull(lectures.deletedAt),
      or(
        sql`${lectures.searchVector} @@ ${tsQuery}`,
        ilike(lectures.title, likeTerm),
        ilike(lectures.description, likeTerm),
      ),
    );

    // ── Scholars ─────────────────────────────────────────────────────────────
    const scholarWhere = and(
      eq(scholars.isActive, true),
      isNull(scholars.deletedAt),
      or(
        sql`${scholars.searchVector} @@ ${tsQuery}`,
        ilike(scholars.name, likeTerm),
      ),
    );

    // ── Series ────────────────────────────────────────────────────────────────
    // 1. Fixed: Use status = 'published' instead of isActive
    const seriesWhere = and(
      eq(series.status, "published"),
      isNull(series.deletedAt),
      or(ilike(series.title, likeTerm), ilike(series.description, likeTerm)),
    );

    const shouldFetch = (t: string) => type === "all" || type === t;

    const [
      lectureRows,
      lectureCount,
      scholarRows,
      scholarCount,
      seriesRows,
      seriesCount,
    ] = await Promise.all([
      shouldFetch("lectures")
        ? db.query.lectures.findMany({
            where: lectureWhere,
            orderBy: [
              desc(
                sql`CASE WHEN ${lectures.searchVector} IS NOT NULL THEN ts_rank(${lectures.searchVector}, ${tsQuery}) ELSE 0 END`,
              ),
              desc(lectures.publishedAt),
            ],
            limit,
            offset,
            with: {
              scholar: {
                columns: { slug: true, name: true, honorifics: true },
              },
              thumbnailAsset: { columns: { publicUrl: true } },
              audioAsset: { columns: { durationSecs: true } },
            },
          })
        : Promise.resolve([]),

      shouldFetch("lectures")
        ? db.select({ count: count() }).from(lectures).where(lectureWhere)
        : Promise.resolve([{ count: 0 }]),

      shouldFetch("scholars")
        ? db.query.scholars.findMany({
            where: scholarWhere,
            orderBy: [desc(scholars.lectureCount)],
            limit: type === "scholars" ? limit : 5,
            offset: type === "scholars" ? offset : 0,
            with: { avatarAsset: { columns: { publicUrl: true } } },
          })
        : Promise.resolve([]),

      shouldFetch("scholars")
        ? db.select({ count: count() }).from(scholars).where(scholarWhere)
        : Promise.resolve([{ count: 0 }]),

      shouldFetch("series")
        ? db.query.series.findMany({
            where: seriesWhere,
            orderBy: [desc(series.createdAt)],
            limit: type === "series" ? limit : 5,
            offset: type === "series" ? offset : 0,
            // 2. Fixed: Relation name is coverAsset on series, not thumbnailAsset
            with: { coverAsset: { columns: { publicUrl: true } } },
          })
        : Promise.resolve([]),

      shouldFetch("series")
        ? db.select({ count: count() }).from(series).where(seriesWhere)
        : Promise.resolve([{ count: 0 }]),
    ]);

    const lTotal = lectureCount[0]?.count ?? 0;
    const sTotal = scholarCount[0]?.count ?? 0;
    const rTotal = seriesCount[0]?.count ?? 0;

    return withCors(
      ok({
        query: q,
        total: lTotal + sTotal + rTotal,
        lectures: lectureRows.map((l) => ({
          id: l.id,
          slug: l.slug,
          title: l.title,
          durationSecs: l.durationSecs ?? l.audioAsset?.durationSecs ?? null,
          thumbnail: l.thumbnailAsset?.publicUrl ?? null,
          scholar: l.scholar
            ? {
                slug: l.scholar.slug,
                displayName: [l.scholar.honorifics, l.scholar.name]
                  .filter(Boolean)
                  .join(" "),
              }
            : null,
        })),
        lecturesTotal: lTotal,
        scholars: scholarRows.map((s) => ({
          id: s.id,
          slug: s.slug,
          displayName: [s.honorifics, s.name].filter(Boolean).join(" "),
          lectureCount: s.lectureCount,
          avatar: s.avatarAsset?.publicUrl ?? null,
        })),
        scholarsTotal: sTotal,
        series: seriesRows.map((s) => ({
          id: s.id,
          slug: s.slug,
          title: s.title,
          // 3. Fixed: Use itemCount and coverAsset
          lectureCount: s.itemCount ?? 0,
          thumbnail: s.coverAsset?.publicUrl ?? null,
        })),
        seriesTotal: rTotal,
        meta: {
          page,
          limit,
          hasNext: type === "lectures" ? page * limit < lTotal : false,
        },
      }),
    );
  } catch (e) {
    console.error("[GET /api/v1/search]", e);
    return withCors(err("Search failed", 500));
  }
}
