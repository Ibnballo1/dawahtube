// src/app/api/v1/recorder/presign/route.ts
//
// POST /api/v1/recorder/presign
// Body: { clientSubmissionId: uuid, mimeType: "audio/aac" | "audio/mp4", sizeBytes: number }
//
// Returns a presigned PUT URL for:
//   recordings/{userId}/{clientSubmissionId}/original.{aac|m4a}
// in the PRIVATE uploads bucket.
//
// If that key was already confirmed, no new URL is issued (this stops a
// recorder overwriting the original of a recording an admin may already have
// approved). The app gets { alreadyUploaded: true, assetId } and skips ahead
// to POST /recorder/recordings.

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@core/database/client";
import { mediaAssets } from "@core/database/schema";
import { createPresignedUpload } from "@core/storage";
import { rateLimit } from "@core/ratelimit/client";
import { ok, err, withCors, OPTIONS } from "../../_helpers";
import {
  recordingKey,
  recordingMimeSchema,
  requireRecorder,
  sizeBytesSchema,
  submissionIdSchema,
} from "../_shared";

export { OPTIONS };

const bodySchema = z.object({
  clientSubmissionId: submissionIdSchema,
  mimeType: recordingMimeSchema,
  sizeBytes: sizeBytesSchema,
});

export async function POST(req: NextRequest) {
  const rl = await rateLimit("api", req);
  if (!rl.ok) return rl.response!;

  const session = await requireRecorder(req);
  if (session instanceof NextResponse) return withCors(session);

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return withCors(
      err(parsed.error.issues[0]?.message ?? "Invalid request", 400),
    );
  }

  const { clientSubmissionId, mimeType, sizeBytes } = parsed.data;
  const key = recordingKey(session.userId, clientSubmissionId, mimeType);

  try {
    // Already confirmed? Never issue a second URL for the same key.
    const existing = await db.query.mediaAssets.findFirst({
      where: and(eq(mediaAssets.bucket, "uploads"), eq(mediaAssets.key, key)),
      columns: { id: true },
    });
    if (existing) {
      return withCors(ok({ alreadyUploaded: true, assetId: existing.id }));
    }

    const uploadUrl = await createPresignedUpload({
      bucket: "uploads",
      key,
      contentType: mimeType,
      maxBytes: sizeBytes,
    });

    return withCors(
      ok({
        alreadyUploaded: false,
        uploadUrl,
        method: "PUT",
        // The PUT must send exactly this Content-Type or R2 rejects it
        headers: { "Content-Type": mimeType },
        key,
      }),
    );
  } catch (e) {
    console.error("[POST /api/v1/recorder/presign]", e);
    return withCors(err("Could not create an upload URL", 500));
  }
}
