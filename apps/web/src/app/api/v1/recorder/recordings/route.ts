// src/app/api/v1/recorder/recordings/route.ts
//
// POST /api/v1/recorder/recordings
// Body: {
//   clientSubmissionId: uuid,
//   assetId: string,                // from /recorder/confirm
//   consentGiven: true,             // required: the speaker agreed to be recorded
//   scholarId?: string,             // either scholarId or speakerName is required
//   speakerName?: string,
//   title?: string,
//   language?: "en" | "ar" | "ha" | "yo" | "fr",
//   recordedOn?: "YYYY-MM-DD",
//   venue?: string,
//   notes?: string,
//   durationSecs?: number,
//   markers?: [{ atMs: number, label: string }],
//   trimStartMs?: number, trimEndMs?: number,
//   appVersion?: string, deviceModel?: string
// }
//
// Validates that the asset really belongs to THIS recorder and THIS submission
// (not an admin lecture's audio, not someone else's upload), then creates the
// row with status "pending" so it appears in /admin/pending-recordings.
//
// Idempotent: one row per audio asset (unique index). A retry returns the
// existing row with { duplicate: true } instead of creating a second one.

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { db } from "@core/database/client";
import {
  mediaAssets,
  pendingRecordings,
  scholars,
} from "@core/database/schema";
import { writeAuditLog } from "@core/audit/logger";
import { rateLimit } from "@core/ratelimit/client";
import { ok, err, withCors, OPTIONS } from "../../_helpers";
import {
  durationSecsSchema,
  recordingKeyPrefix,
  requireRecorder,
  submissionIdSchema,
} from "../_shared";

export { OPTIONS };

const markerSchema = z.object({
  atMs: z.number().int().min(0),
  label: z.string().trim().max(100),
});

const bodySchema = z.object({
  clientSubmissionId: submissionIdSchema,
  assetId: z.string().min(1).max(64),
  consentGiven: z.boolean(),
  scholarId: z.string().min(1).max(64).optional(),
  speakerName: z.string().trim().min(1).max(255).optional(),
  title: z.string().trim().max(255).optional(),
  language: z.enum(["en", "ar", "ha", "yo", "fr"]).optional(),
  recordedOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  venue: z.string().trim().max(255).optional(),
  notes: z.string().trim().max(1000).optional(),
  durationSecs: durationSecsSchema.optional(),
  markers: z.array(markerSchema).max(200).default([]),
  trimStartMs: z.number().int().min(0).optional(),
  trimEndMs: z.number().int().min(0).optional(),
  appVersion: z.string().max(32).optional(),
  deviceModel: z.string().max(128).optional(),
});

// Real calendar date, not in the future (one day of slack for time zones)
function isValidRecordedOn(value: string): boolean {
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value)
    return false;
  return d.getTime() <= Date.now() + 24 * 60 * 60 * 1000;
}

export async function POST(req: NextRequest) {
  const rl = await rateLimit("api", req);
  if (!rl.ok) return rl.response!;

  const session = await requireRecorder(req);
  if (session instanceof NextResponse) return withCors(session);
  const userId = session.userId;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return withCors(
      err(parsed.error.issues[0]?.message ?? "Invalid request", 400),
    );
  }
  const b = parsed.data;

  // ── Business rules ──────────────────────────────────────────────────────────
  if (!b.consentGiven) {
    return withCors(
      err(
        "The speaker's consent is required before submitting a recording",
        400,
      ),
    );
  }
  if (!b.scholarId && !b.speakerName) {
    return withCors(err("Choose a scholar or enter the speaker's name", 400));
  }
  if (
    b.trimStartMs !== undefined &&
    b.trimEndMs !== undefined &&
    b.trimStartMs >= b.trimEndMs
  ) {
    return withCors(err("Trim start must be before trim end", 400));
  }
  if (b.recordedOn && !isValidRecordedOn(b.recordedOn)) {
    return withCors(err("Recording date is not valid", 400));
  }

  try {
    // ── Scholar must exist and be active ──────────────────────────────────────
    if (b.scholarId) {
      const scholar = await db.query.scholars.findFirst({
        where: and(
          eq(scholars.id, b.scholarId),
          eq(scholars.isActive, true),
          isNull(scholars.deletedAt),
        ),
        columns: { id: true },
      });
      if (!scholar) return withCors(err("Scholar not found", 400));
    }

    // ── The asset must be this recorder's upload for this submission ──────────
    const asset = await db.query.mediaAssets.findFirst({
      where: eq(mediaAssets.id, b.assetId),
      columns: {
        id: true,
        key: true,
        bucket: true,
        assetType: true,
        uploaderUserId: true,
        status: true,
        durationSecs: true,
      },
    });

    // Same answer whether it is missing or someone else's: no probing
    if (!asset || asset.uploaderUserId !== userId) {
      return withCors(err("Uploaded file not found", 404));
    }
    if (
      asset.bucket !== "uploads" ||
      asset.assetType !== "audio" ||
      !asset.key.startsWith(recordingKeyPrefix(userId, b.clientSubmissionId))
    ) {
      return withCors(err("This file does not belong to this submission", 400));
    }
    if (asset.status !== "ready") {
      return withCors(err("The uploaded file is still being processed", 409));
    }

    // ── Idempotency: one row per audio asset ──────────────────────────────────
    const existing = await db.query.pendingRecordings.findFirst({
      where: eq(pendingRecordings.audioAssetId, asset.id),
      columns: { id: true, status: true },
    });
    if (existing) {
      return withCors(
        ok({ id: existing.id, status: existing.status, duplicate: true }),
      );
    }

    const id = `rec_${nanoid(16)}`;

    try {
      await db.insert(pendingRecordings).values({
        id,
        title: b.title ?? null,
        scholarId: b.scholarId ?? null,
        speakerName: b.speakerName ?? null,
        recordedBy: userId,
        audioAssetId: asset.id,
        durationSecs: b.durationSecs ?? asset.durationSecs ?? null,
        notes: b.notes ?? null,
        language: b.language ?? null,
        recordedOn: b.recordedOn ?? null,
        venue: b.venue ?? null,
        consentGiven: true,
        consentAt: new Date(),
        markers: b.markers,
        trimStartMs: b.trimStartMs ?? null,
        trimEndMs: b.trimEndMs ?? null,
        appVersion: b.appVersion ?? null,
        deviceModel: b.deviceModel ?? null,
        status: "pending", // v1 has no worker: straight to admin review
      });
    } catch (e) {
      // Lost a race with a concurrent retry: return the winner
      if ((e as { cause?: { code?: string } }).cause?.code === "23505") {
        const winner = await db.query.pendingRecordings.findFirst({
          where: eq(pendingRecordings.audioAssetId, asset.id),
          columns: { id: true, status: true },
        });
        if (winner) {
          return withCors(
            ok({ id: winner.id, status: winner.status, duplicate: true }),
          );
        }
      }
      throw e;
    }

    // Best effort: neither of these should fail the submission
    try {
      await writeAuditLog({
        action: "create",
        entity: "pending_recording",
        entityId: id,
      });
    } catch (e) {
      console.error("[recorder/recordings] audit log failed:", e);
    }
    revalidatePath("/admin/pending-recordings");

    return withCors(ok({ id, status: "pending", duplicate: false }, 201));
  } catch (e) {
    console.error("[POST /api/v1/recorder/recordings]", e);
    return withCors(err("Could not save the recording", 500));
  }
}
