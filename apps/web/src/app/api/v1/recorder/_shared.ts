// src/app/api/v1/recorder/_shared.ts
//
// Shared pieces for the recorder routes (presign, confirm, recordings).
//
// Upload flow the recorder app follows:
//   1. POST /recorder/presign     -> presigned PUT URL for a deterministic key
//   2. PUT the file straight to R2
//   3. POST /recorder/confirm     -> verify the object in R2, register media_asset
//   4. POST /recorder/recordings  -> create the pending_recordings row
//
// Every step is idempotent on clientSubmissionId (a UUID made on the phone),
// so the app can safely retry after a crash or a dropped connection.

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { PERMISSIONS } from "@core/auth/permissions";
import { err, requireApiPermission } from "../_helpers";

// ─── Limits and formats ───────────────────────────────────────────────────────

export const MAX_RECORDING_BYTES = 300 * 1024 * 1024; // 300 MB

export const RECORDING_MIMES = ["audio/aac", "audio/mp4"] as const;
export type RecordingMime = (typeof RECORDING_MIMES)[number];

const EXT: Record<RecordingMime, string> = {
  "audio/aac": "aac", // ADTS
  "audio/mp4": "m4a",
};

// ─── Key scheme ───────────────────────────────────────────────────────────────
// The key is derived on the server from the caller's id and the submission id.
// The client never supplies a key, so a recorder can only ever read or write
// objects under their own prefix, and ownership is provable from the key alone.

export function recordingKeyPrefix(
  userId: string,
  submissionId: string,
): string {
  return `recordings/${userId}/${submissionId}/`;
}

export function recordingKey(
  userId: string,
  submissionId: string,
  mime: RecordingMime,
): string {
  return `${recordingKeyPrefix(userId, submissionId)}original.${EXT[mime]}`;
}

// ─── Shared validation ────────────────────────────────────────────────────────

export const recordingMimeSchema = z.enum(RECORDING_MIMES);
export const submissionIdSchema = z.string().uuid();
export const sizeBytesSchema = z
  .number()
  .int()
  .positive()
  .max(MAX_RECORDING_BYTES);

// Seconds, rounded. The app measures this itself; it is informational only.
export const durationSecsSchema = z
  .number()
  .min(0.5)
  .max(12 * 60 * 60)
  .transform((n) => Math.round(n));

// ─── Permission gate ──────────────────────────────────────────────────────────
// Requires `recording:submit`, held by the `recorder`, `admin` and
// `super_admin` roles (see DEFAULT_ROLES in permissions.ts).
// 401 = not signed in, 403 = signed in but not an approved recorder.

export async function requireRecorder(
  req: NextRequest,
): Promise<{ userId: string; role: string } | NextResponse> {
  const result = await requireApiPermission(req, PERMISSIONS.RECORDING_SUBMIT);

  if (result instanceof NextResponse && result.status === 403) {
    return err("Your account has not been approved to record yet", 403);
  }
  return result;
}
