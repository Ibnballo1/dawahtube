// src/app/api/v1/scholars/[slug]/lectures/route.ts
import { type NextRequest } from "next/server";
import { db } from "@core/database/client";
import { scholars, lectures } from "@core/database/schema";
import { eq, and, isNull, desc, count, ilike, or, sql } from "drizzle-orm";
import {
  paginated,
  err,
  withCors,
  OPTIONS,
  parsePagination,
} from "../../../_helpers";

export { OPTIONS };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const sp = req.nextUrl.searchParams;
    const { page, limit, offset } = parsePagination(sp);
    const q = sp.get("q")?.trim();

    // Resolve scholar ID from slug
    const scholar = await db.query.scholars.findFirst({
      where: and(
        eq(scholars.slug, slug),
        eq(scholars.isActive, true),
        isNull(scholars.deletedAt),
      ),
      columns: { id: true },
    });

    if (!scholar) return withCors(err("Scholar not found", 404));

    const conditions = [
      eq(lectures.scholarId, scholar.id),
      eq(lectures.status, "published"),
      isNull(lectures.deletedAt),
    ];

    if (q) {
      conditions.push(
        or(
          sql`${lectures.searchVector} @@ websearch_to_tsquery('simple', ${q})`,
          ilike(lectures.title, `%${q}%`),
        )!,
      );
    }

    const where = and(...conditions);

    const [totalResult, rows] = await Promise.all([
      db.select({ count: count() }).from(lectures).where(where),
      db.query.lectures.findMany({
        where,
        orderBy: [desc(lectures.publishedAt)],
        limit,
        offset,
        with: {
          category: { columns: { id: true, slug: true, name: true } },
          thumbnailAsset: { columns: { publicUrl: true, altText: true } },
          audioAsset: { columns: { id: true, durationSecs: true } },
          seriesItems: {
            columns: {
              id: true,
              position: true,
            },
            with: {
              series: {
                columns: {
                  id: true,
                  slug: true,
                  title: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const total = totalResult[0]?.count ?? 0;

    const items = rows.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      description: l.description,
      durationSecs: l.durationSecs ?? l.audioAsset?.durationSecs ?? null,
      publishedAt: l.publishedAt,
      viewCount: l.viewCount,
      allowDownload: l.allowDownload,
      language: l.defaultLanguage,
      hasAudio: !!l.audioAsset,
      category: l.category ?? null,
      thumbnail: l.thumbnailAsset?.publicUrl ?? null,
      series: l.seriesItems.map((item) => ({
        id: item.series.id,
        slug: item.series.slug,
        title: item.series.title,
        position: item.position,
      })),
    }));

    return withCors(paginated(items, total, page, limit));
  } catch (e) {
    console.error("[GET /api/v1/scholars/:slug/lectures]", e);
    return withCors(err("Failed to fetch scholar lectures", 500));
  }
}
