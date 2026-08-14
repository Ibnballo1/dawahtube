// src/app/api/v1/lectures/route.ts
import { type NextRequest } from "next/server";
import { db } from "@core/database/client";
import { lectures } from "@core/database/schema";
import { eq, and, isNull, desc, asc, count, sql, ilike, or } from "drizzle-orm";
import {
  ok,
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

    const q = sp.get("q")?.trim();
    const scholarSlug = sp.get("scholarSlug");
    const categorySlug = sp.get("categorySlug");
    const seriesSlug = sp.get("seriesSlug");
    const language = sp.get("language");
    const sort = sp.get("sort") ?? "newest";

    // ── Build where conditions ───────────────────────────────────────────────
    const conditions = [
      eq(lectures.status, "published"),
      isNull(lectures.deletedAt),
    ];

    if (q) {
      conditions.push(
        or(
          sql`${lectures.searchVector} @@ websearch_to_tsquery('simple', ${q})`,
          ilike(lectures.title, `%${q}%`),
          ilike(lectures.description, `%${q}%`),
        )!,
      );
    }

    if (language) conditions.push(eq(lectures.defaultLanguage, language));

    // Scholar and category filtering via joins done in findMany with where
    const where = and(...conditions);

    // ── Order ───────────────────────────────────────────────────────────────
    const orderBy =
      sort === "popular"
        ? [desc(lectures.viewCount)]
        : sort === "oldest"
          ? [asc(lectures.publishedAt)]
          : [desc(lectures.publishedAt)];

    // ── Query ────────────────────────────────────────────────────────────────
    const [totalResult, rows] = await Promise.all([
      db.select({ count: count() }).from(lectures).where(where),
      db.query.lectures.findMany({
        where,
        orderBy,
        limit,
        offset,
        with: {
          scholar: {
            columns: { id: true, slug: true, name: true, honorifics: true },
          },
          category: {
            columns: { id: true, slug: true, name: true },
          },
          thumbnailAsset: {
            columns: { publicUrl: true, altText: true },
          },
          audioAsset: {
            columns: { id: true, durationSecs: true },
          },
        },
      }),
    ]);

    // ── Filter by scholar slug (post-query if needed) ─────────────────────
    // We filter in-memory to avoid a join — scholar slug lookups are fast
    // since scholar lists are small.
    let filtered = rows;

    if (scholarSlug) {
      filtered = filtered.filter((l) => l.scholar?.slug === scholarSlug);
    }
    if (categorySlug) {
      filtered = filtered.filter((l) => l.category?.slug === categorySlug);
    }

    const total = totalResult[0]?.count ?? 0;

    // ── Shape response ───────────────────────────────────────────────────────
    const items = filtered.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      description: l.description,
      durationSecs: l.durationSecs ?? l.audioAsset?.durationSecs ?? null,
      publishedAt: l.publishedAt,
      viewCount: l.viewCount,
      allowDownload: l.allowDownload,
      language: l.defaultLanguage,
      scholar: l.scholar
        ? {
            id: l.scholar.id,
            slug: l.scholar.slug,
            name: l.scholar.name,
            displayName: [l.scholar.honorifics, l.scholar.name]
              .filter(Boolean)
              .join(" "),
          }
        : null,
      category: l.category
        ? { id: l.category.id, slug: l.category.slug, name: l.category.name }
        : null,
      thumbnail: l.thumbnailAsset?.publicUrl ?? null,
      // Audio URL is NOT returned here for security.
      // Use GET /api/v1/lectures/:id/stream-url for a presigned URL.
    }));

    return withCors(paginated(items, total, page, limit));
  } catch (e) {
    console.error("[GET /api/v1/lectures]", e);
    return withCors(err("Failed to fetch lectures", 500));
  }
}
