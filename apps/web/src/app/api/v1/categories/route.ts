// src/app/api/v1/categories/route.ts
import { type NextRequest } from "next/server";
import { db } from "@core/database/client";
import { lectureCategories } from "@core/database/schema";
import { eq, asc } from "drizzle-orm";
import { ok, err, withCors, OPTIONS } from "../_helpers";

export { OPTIONS };

export async function GET(_req: NextRequest) {
  try {
    const rows = await db.query.lectureCategories.findMany({
      where: eq(lectureCategories.isActive, true),
      orderBy: [asc(lectureCategories.name)],
      columns: {
        id: true,
        slug: true,
        name: true,
        description: true,
        position: true,
      },
    });

    return withCors(ok(rows));
  } catch (e) {
    console.error("[GET /api/v1/categories]", e);
    return withCors(err("Failed to fetch categories", 500));
  }
}
