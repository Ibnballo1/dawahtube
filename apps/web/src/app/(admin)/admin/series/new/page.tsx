// src/app/(admin)/admin/series/new/page.tsx
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { scholars, lectures, seriesItems } from "@core/database/schema";
import { eq, asc, isNull, notExists } from "drizzle-orm";
import { SeriesForm } from "@features/admin/components/client/forms/SeriesForm";

export const metadata: Metadata = { title: "New Series" };

export default async function NewSeriesPage() {
  const [scholarList, lectureList] = await Promise.all([
    db.query.scholars.findMany({
      where: eq(scholars.isActive, true),
      columns: { id: true, name: true, honorifics: true },
      orderBy: [asc(scholars.name)],
    }),
    db.query.lectures.findMany({
      where: (l, { isNull, and }) =>
        and(
          isNull(l.deletedAt),
          // Exclude lectures that already belong to a series via seriesItems
          notExists(
            db
              .select()
              .from(seriesItems)
              .where(eq(seriesItems.lectureId, l.id)),
          ),
        ),
      columns: {
        id: true,
        title: true,
        scholarId: true,
        status: true,
        publishedAt: true,
      },
      orderBy: (l, { asc }) => [asc(l.title)],
      limit: 200,
    }),
  ]);

  return <SeriesForm scholars={scholarList} availableLectures={lectureList} />;
}
