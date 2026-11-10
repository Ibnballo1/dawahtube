// src/app/api/v1/recorder/confirm/route.ts
//
// POST /api/v1/recorder/confirm
// Body: {
//   clientSubmissionId: uuid,
//   mimeType: "audio/aac" | "audio/mp4",
//   sizeBytes: number,            // what the app uploaded; must match R2
//   durationSecs?: number,
//   sha256?: string,              // hex, 64 chars; stored, NOT verified (see below)
//   filename?: string
// }
//
// The app never sends a key. The server rebuilds it from the caller's id and
// clientSubmissionId, so a recorder cannot register anyone else's object.
//
// Checks, in order:
//   1. caller is an approved recorder
//   2. the object exists in the private uploads bucket (HeadObject)
//   3. R2's size equals the claimed size (catches truncated uploads)
//   4. R2's content type equals the claimed one and is an allowed audio type
//
// sha256 is stored in media_assets.checksum for duplicate detection later.
// It is the app's claim: hashing up to 300 MB inside a serverless function
// is not worth it, so it is not verified server-side.
//
// Status is "ready" because v1 has no processing worker. When one exists,
// set "uploaded" here and let the worker move it to "ready".

import { NextResponse, type NextRequest } from "next/server";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@core/database/client";
import { mediaAssets } from "@core/database/schema";
import { r2, BUCKETS } from "@core/storage/r2-client";
import { rateLimit } from "@core/ratelimit/client";
import { ok, err, withCors, OPTIONS } from "../../_helpers";
import {
  durationSecsSchema,
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
  durationSecs: durationSecsSchema.optional(),
  sha256: z
    .string()
    .regex(/^[a-fA-F0-9]{64}$/)
    .optional(),
  filename: z.string().trim().max(255).optional(),
});

async function headUpload(
  key: string,
): Promise<{ size: number; contentType: string | undefined } | null> {
  try {
    const head = await r2.send(
      new HeadObjectCommand({ Bucket: BUCKETS.uploads, Key: key }),
    );
    return { size: head.ContentLength ?? 0, contentType: head.ContentType };
  } catch {
    return null;
  }
}

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

  const {
    clientSubmissionId,
    mimeType,
    sizeBytes,
    durationSecs,
    sha256,
    filename,
  } = parsed.data;
  const userId = session.userId;
  const key = recordingKey(userId, clientSubmissionId, mimeType);

  try {
    // Idempotent: a retry after a dropped response returns the same asset
    const existing = await db.query.mediaAssets.findFirst({
      where: and(eq(mediaAssets.bucket, "uploads"), eq(mediaAssets.key, key)),
      columns: { id: true },
    });
    if (existing) {
      return withCors(ok({ assetId: existing.id, alreadyConfirmed: true }));
    }

    const head = await headUpload(key);
    if (!head || head.size <= 0) {
      return withCors(
        err("The uploaded file was not found. Please upload it again.", 404),
      );
    }
    if (head.size !== sizeBytes) {
      return withCors(
        err("The uploaded file looks incomplete. Please upload it again.", 400),
      );
    }

    const contentType = (head.contentType ?? "")
      .split(";")[0]!
      .trim()
      .toLowerCase();
    if (contentType !== mimeType) {
      return withCors(
        err("The uploaded file type does not match what was requested.", 400),
      );
    }

    const id = `ast_${nanoid(16)}`;
    const originalFilename = filename ?? key.split("/").pop()!;

    try {
      await db.insert(mediaAssets).values({
        id,
        key,
        bucket: "uploads",
        mimeType: contentType,
        sizeBytes: head.size,
        originalFilename,
        altText: originalFilename,
        publicUrl: null, // uploads bucket stays private
        assetType: "audio",
        durationSecs: durationSecs ?? null,
        checksum: sha256?.toLowerCase() ?? null,
        uploaderUserId: userId,
        status: "ready",
      });
    } catch (e) {
      // Two concurrent confirms: the unique (bucket, key) index let one win
      if ((e as { cause?: { code?: string } }).cause?.code === "23505") {
        const winner = await db.query.mediaAssets.findFirst({
          where: and(
            eq(mediaAssets.bucket, "uploads"),
            eq(mediaAssets.key, key),
          ),
          columns: { id: true },
        });
        if (winner) {
          return withCors(ok({ assetId: winner.id, alreadyConfirmed: true }));
        }
      }
      throw e;
    }

    return withCors(
      ok({ assetId: id, sizeBytes: head.size, alreadyConfirmed: false }, 201),
    );
  } catch (e) {
    console.error("[POST /api/v1/recorder/confirm]", e);
    return withCors(err("Could not confirm the upload", 500));
  }
}
