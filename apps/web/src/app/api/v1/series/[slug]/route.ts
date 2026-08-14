// src/app/api/v1/series/[slug]/route.ts
import { type NextRequest } from "next/server";
import { db } from "@core/database/client";
import { series, lectures } from "@core/database/schema";
import { eq, and, isNull, asc } from "drizzle-orm";
import { ok, err, withCors, OPTIONS } from "../../_helpers";

export { OPTIONS };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const seriesRow = await db.query.series.findFirst({
      where: and(
        eq(series.slug, slug),
        eq(series.status, "published"), // 1. Fixed: Use status instead of isActive
        isNull(series.deletedAt),
      ),
      with: {
        scholar: {
          columns: { id: true, slug: true, name: true, honorifics: true },
          with: {
            avatarAsset: { columns: { publicUrl: true } },
          },
        },
        coverAsset: { columns: { publicUrl: true, altText: true } }, // 2. Fixed: Use coverAsset instead of thumbnailAsset
        items: {
          orderBy: (items, { asc }) => [asc(items.position)], // 3. Order episodes by seriesItems.position
          with: {
            lecture: {
              with: {
                thumbnailAsset: { columns: { publicUrl: true, altText: true } },
                audioAsset: { columns: { id: true, durationSecs: true } },
              },
            },
          },
        },
      },
    });

    if (!seriesRow) return withCors(err("Series not found", 404));

    // 4. Map & filter published lectures from seriesItems
    const episodes = (seriesRow.items ?? [])
      .map((item) => ({
        item,
        lecture: item.lecture,
      }))
      .filter(
        ({ lecture }) =>
          lecture &&
          lecture.status === "published" &&
          lecture.deletedAt === null,
      );

    return withCors(
      ok({
        id: seriesRow.id,
        slug: seriesRow.slug,
        title: seriesRow.title,
        description: seriesRow.description,
        thumbnail: seriesRow.coverAsset?.publicUrl ?? null,
        scholar: seriesRow.scholar
          ? {
              id: seriesRow.scholar.id,
              slug: seriesRow.scholar.slug,
              displayName: [
                seriesRow.scholar.honorifics,
                seriesRow.scholar.name,
              ]
                .filter(Boolean)
                .join(" "),
              avatar: seriesRow.scholar.avatarAsset?.publicUrl ?? null,
            }
          : null,
        episodeCount: episodes.length,
        episodes: episodes.map(({ item, lecture }, i) => ({
          id: lecture.id,
          slug: lecture.slug,
          title: lecture.title,
          description: lecture.description,
          position: item.position ?? i + 1,
          durationSecs:
            lecture.durationSecs ?? lecture.audioAsset?.durationSecs ?? null,
          publishedAt: lecture.publishedAt,
          hasAudio: !!lecture.audioAsset,
          thumbnail: lecture.thumbnailAsset?.publicUrl ?? null,
        })),
      }),
    );
  } catch (e) {
    console.error("[GET /api/v1/series/:slug]", e);
    return withCors(err("Failed to fetch series", 500));
  }
}
