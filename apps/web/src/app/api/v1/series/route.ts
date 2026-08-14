// src/app/api/v1/series/route.ts
import { type NextRequest } from "next/server";
import { db } from "@core/database/client";
import { series } from "@core/database/schema";
import { eq, and, isNull, desc, count } from "drizzle-orm";
import {
  paginated,
  err,
  withCors,
  OPTIONS,
  parsePagination,
} from "../_helpers";

export { OPTIONS };

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const { page, limit, offset } = parsePagination(sp);
    const scholarSlug = sp.get("scholarSlug");

    // 1. Fixed: Filter by status = 'published' instead of isActive
    const conditions = [
      eq(series.status, "published"),
      isNull(series.deletedAt),
    ];

    const where = and(...conditions);

    const [totalResult, rows] = await Promise.all([
      db.select({ count: count() }).from(series).where(where),
      db.query.series.findMany({
        where,
        orderBy: [desc(series.createdAt)],
        limit,
        offset,
        with: {
          scholar: {
            columns: { id: true, slug: true, name: true, honorifics: true },
            with: {
              avatarAsset: { columns: { publicUrl: true } },
            },
          },
          // 2. Fixed: Use coverAsset instead of thumbnailAsset
          coverAsset: { columns: { publicUrl: true, altText: true } },
        },
      }),
    ]);

    const total = totalResult[0]?.count ?? 0;

    let items = rows.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      description: s.description,
      // 3. Fixed: Use itemCount instead of lectureCount
      lectureCount: s.itemCount ?? 0,
      thumbnail: s.coverAsset?.publicUrl ?? null,
      scholar: s.scholar
        ? {
            id: s.scholar.id,
            slug: s.scholar.slug,
            displayName: [s.scholar.honorifics, s.scholar.name]
              .filter(Boolean)
              .join(" "),
            avatar: s.scholar.avatarAsset?.publicUrl ?? null,
          }
        : null,
    }));

    // Filter by scholar slug in-memory
    if (scholarSlug) {
      items = items.filter((s) => s.scholar?.slug === scholarSlug);
    }

    return withCors(paginated(items, total, page, limit));
  } catch (e) {
    console.error("[GET /api/v1/series]", e);
    return withCors(err("Failed to fetch series", 500));
  }
}
