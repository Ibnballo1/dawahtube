// src/app/api/v1/lectures/[id]/stream-url/route.ts
//
// Returns a short-lived presigned GET URL for the lecture audio file.
// The mobile app calls this before passing the URL to TrackPlayer.
//
// Why separate from the lecture detail endpoint?
//   - Presigned URLs expire in 1 hour — don't cache them with lecture data
//   - The mobile app caches this response with a 50-min TTL via TanStack Query
//   - Keeps the audio key out of the main lecture response

import { type NextRequest } from "next/server";
import { db } from "@core/database/client";
import { lectures } from "@core/database/schema";
import { eq, and, isNull } from "drizzle-orm";
import { createPresignedRead, getPublicUrl } from "@core/storage/presign";
import { ok, err, withCors, OPTIONS } from "../../../_helpers";

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
        audioAsset: {
          columns: { id: true, key: true, bucket: true, publicUrl: true },
        },
      },
    });

    if (!lecture) return withCors(err("Lecture not found", 404));
    if (!lecture.audioAsset)
      return withCors(err("No audio available for this lecture", 404));

    const asset = lecture.audioAsset;

    // If audio is in the public media bucket — return the CDN URL directly
    // (no presigning needed, no expiry, faster)
    if (asset.bucket === "media" && asset.publicUrl) {
      return withCors(
        ok({
          url: asset.publicUrl,
          expiresAt: null, // public URL never expires
          type: "public",
        }),
      );
    }

    // Private bucket (uploads) — generate a presigned URL
    const url = await createPresignedRead(
      asset.bucket as "uploads" | "media" | "books",
      asset.key,
      3600, // 1 hour
    );

    return withCors(
      ok({
        url,
        expiresAt: new Date(Date.now() + 50 * 60 * 1000).toISOString(), // 50 min (safe TTL)
        type: "presigned",
      }),
    );
  } catch (e) {
    console.error("[GET /api/v1/lectures/:id/stream-url]", e);
    return withCors(err("Failed to generate stream URL", 500));
  }
}
