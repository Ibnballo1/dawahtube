// src/app/api/v1/lectures/[id]/route.ts
import { type NextRequest } from "next/server";
import { db } from "@core/database/client";
import { lectures } from "@core/database/schema";
import { eq, and, isNull } from "drizzle-orm";
import { ok, err, withCors, OPTIONS } from "../../_helpers";

export { OPTIONS };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const lecture = await db.query.lectures.findFirst({
      where: and(
        eq(lectures.id, id),
        eq(lectures.status, "published"),
        isNull(lectures.deletedAt),
      ),
      with: {
        scholar: {
          columns: {
            id: true,
            slug: true,
            name: true,
            honorifics: true,
            arabicName: true,
          },
          with: {
            avatarAsset: {
              columns: {
                publicUrl: true,
                altText: true,
              },
            },
          },
        },

        category: {
          columns: {
            id: true,
            slug: true,
            name: true,
          },
        },

        thumbnailAsset: {
          columns: {
            publicUrl: true,
            altText: true,
          },
        },

        audioAsset: {
          columns: {
            id: true,
            durationSecs: true,
            sizeBytes: true,
          },
        },

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
    });

    if (!lecture) return withCors(err("Lecture not found", 404));

    return withCors(
      ok({
        id: lecture.id,
        slug: lecture.slug,
        title: lecture.title,
        description: lecture.description,
        transcript: lecture.transcript,
        durationSecs:
          lecture.durationSecs ?? lecture.audioAsset?.durationSecs ?? null,
        publishedAt: lecture.publishedAt,
        viewCount: lecture.viewCount,
        allowDownload: lecture.allowDownload,
        language: lecture.defaultLanguage,
        // Audio stream URL is fetched separately via /stream-url
        // to keep presigned URL generation on-demand and short-lived.
        hasAudio: !!lecture.audioAsset,
        audioSizeBytes: lecture.audioAsset?.sizeBytes ?? null,
        scholar: lecture.scholar
          ? {
              id: lecture.scholar.id,
              slug: lecture.scholar.slug,
              name: lecture.scholar.name,
              displayName: [lecture.scholar.honorifics, lecture.scholar.name]
                .filter(Boolean)
                .join(" "),
              arabicName: lecture.scholar.arabicName,
              avatar: lecture.scholar.avatarAsset?.publicUrl ?? null,
            }
          : null,
        category: lecture.category
          ? {
              id: lecture.category.id,
              slug: lecture.category.slug,
              name: lecture.category.name,
            }
          : null,
        thumbnail: lecture.thumbnailAsset?.publicUrl ?? null,
        series: lecture.seriesItems.map((item) => ({
          id: item.series.id,
          slug: item.series.slug,
          title: item.series.title,
          position: item.position,
        })),
      }),
    );
  } catch (e) {
    console.error("[GET /api/v1/lectures/:id]", e);
    return withCors(err("Failed to fetch lecture", 500));
  }
}
