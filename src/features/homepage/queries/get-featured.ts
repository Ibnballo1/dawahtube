// src/features/homepage/queries/get-featured.ts
import { db } from "@core/database/client";
import { unstable_cache } from "next/cache";

export const getFeaturedLectures = unstable_cache(
  async () => {
    return db.query.featuredSlots.findMany({
      where: (s, { eq, and, isNull, or, lte, gte, sql }) =>
        and(
          eq(s.slotKey, "featured_lectures"),
          eq(s.active, true),
          or(isNull(s.validUntil), gte(s.validUntil, sql`now()`)),
        ),
      with: { lecture: { with: { scholar: true, category: true } } },
      orderBy: (s, { asc }) => [asc(s.position)],
      limit: 6,
    });
  },
  ["featured-lectures"],
  {
    tags: ["homepage-featured", "featured-featured_lectures"],
    revalidate: 3600,
  },
);
