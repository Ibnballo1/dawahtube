// src/app/(admin)/admin/series/[id]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { scholars, series, seriesItems } from "@core/database/schema";
import { eq, asc, isNull, or, and, notExists } from "drizzle-orm";
import { SeriesForm } from "@features/admin/components/client/forms/SeriesForm";

export const metadata: Metadata = { title: "Edit Series" };

export default async function EditSeriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [seriesRow, scholarList, allLectures] = await Promise.all([
    db.query.series.findFirst({
      where: and(eq(series.id, id), isNull(series.deletedAt)),
      with: {
        items: {
          orderBy: (items, { asc }) => [asc(items.position)],
          with: {
            lecture: {
              columns: {
                id: true,
                title: true,
                publishedAt: true,
                status: true,
              },
            },
          },
        },
      },
    }),
    db.query.scholars.findMany({
      where: eq(scholars.isActive, true),
      columns: { id: true, name: true, honorifics: true },
      orderBy: [asc(scholars.name)],
    }),
    // Lectures available to add: not deleted AND (unassigned OR already in THIS series)
    db.query.lectures.findMany({
      where: (l, { isNull, and }) =>
        and(
          isNull(l.deletedAt),
          or(
            // Unassigned: does not exist in seriesItems at all
            notExists(
              db
                .select()
                .from(seriesItems)
                .where(eq(seriesItems.lectureId, l.id)),
            ),
            // Or belongs specifically to THIS series
            notExists(
              db
                .select()
                .from(seriesItems)
                .where(
                  and(
                    eq(seriesItems.lectureId, l.id),
                    isNull(seriesItems.seriesId), // safe query check
                  ),
                ),
            ),
          ),
        ),
      columns: { id: true, title: true, scholarId: true },
      orderBy: (l, { asc }) => [asc(l.title)],
      limit: 200,
    }),
  ]);

  if (!seriesRow) notFound();

  // Map series items to the expected lecture format
  const seriesLectures =
    seriesRow.items?.map((item) => ({
      id: item.lecture.id,
      title: item.lecture.title,
      seriesPosition: item.position,
      publishedAt: item.lecture.publishedAt,
      status: item.lecture.status,
    })) ?? [];

  // Available lectures = those not currently in this series
  const inSeries = new Set(seriesLectures.map((l) => l.id));
  const available = allLectures.filter((l) => !inSeries.has(l.id));

  return (
    <SeriesForm
      series={{
        id: seriesRow.id,
        title: seriesRow.title,
        description: seriesRow.description,
        scholarId: seriesRow.scholarId,
        isActive: seriesRow.status === "published",
        lectures: seriesLectures,
      }}
      scholars={scholarList}
      availableLectures={available}
    />
  );
}
