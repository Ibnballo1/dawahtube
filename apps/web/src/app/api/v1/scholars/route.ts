// src/app/api/v1/scholars/route.ts
import { type NextRequest } from "next/server";
import { db } from "@core/database/client";
import { scholars } from "@core/database/schema";
import { eq, and, isNull, asc, desc, count, sql, ilike, or } from "drizzle-orm";
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
    const { page, limit, offset } = parsePagination(sp, 20);
    const q = sp.get("q")?.trim();
    const nationality = sp.get("nationality");
    const sort = sp.get("sort") ?? "name";

    const conditions = [
      eq(scholars.isActive, true),
      isNull(scholars.deletedAt),
    ];

    if (q) {
      conditions.push(
        or(
          sql`${scholars.searchVector} @@ websearch_to_tsquery('simple', ${q})`,
          ilike(scholars.name, `%${q}%`),
          ilike(scholars.arabicName, `%${q}%`),
        )!,
      );
    }

    if (nationality) conditions.push(eq(scholars.nationality, nationality));

    const where = and(...conditions);
    const orderBy =
      sort === "lectures"
        ? [desc(scholars.lectureCount)]
        : [asc(scholars.name)];

    const [totalResult, rows] = await Promise.all([
      db.select({ count: count() }).from(scholars).where(where),
      db.query.scholars.findMany({
        where,
        orderBy,
        limit,
        offset,
        with: {
          avatarAsset: { columns: { publicUrl: true, altText: true } },
        },
      }),
    ]);

    const total = totalResult[0]?.count ?? 0;

    const items = rows.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      displayName: [s.honorifics, s.name].filter(Boolean).join(" "),
      arabicName: s.arabicName,
      honorifics: s.honorifics,
      nationality: s.nationality,
      location: s.location,
      lectureCount: s.lectureCount,
      articleCount: s.articleCount,
      isFeatured: s.isFeatured,
      avatar: s.avatarAsset?.publicUrl ?? null,
    }));

    return withCors(paginated(items, total, page, limit));
  } catch (e) {
    console.error("[GET /api/v1/scholars]", e);
    return withCors(err("Failed to fetch scholars", 500));
  }
}
