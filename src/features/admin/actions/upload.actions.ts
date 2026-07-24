// src/features/admin/actions/upload.actions.ts
"use server";
//
// Step 1 of the upload flow: admin client requests a presigned PUT URL.
// The client then uploads directly to R2 using that URL.
// Step 2 is confirmUpload() in src/core/storage/confirm-upload.ts.

import { z } from "zod";
import { requirePermission } from "@core/auth/guard";
import { PERMISSIONS } from "@core/auth/permissions";
import {
  createPresignedUpload,
  getBucketForType,
  generateKey,
} from "@core/storage";

const requestUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(500 * 1024 * 1024), // 500 MB max
  uploadType: z.enum([
    "audio",
    "pdf",
    "image",
    "thumbnail",
    "avatar",
    "banner",
    "cover",
  ]),
});

export type RequestUploadInput = z.infer<typeof requestUploadSchema>;

// ─── Allowed MIME types per upload type ───────────────────────────────────────

const ALLOWED_MIMES: Record<string, string[]> = {
  audio: [
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
  ],
  pdf: ["application/pdf"],
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  thumbnail: ["image/jpeg", "image/png", "image/webp"],
  avatar: ["image/jpeg", "image/png", "image/webp"],
  banner: ["image/jpeg", "image/png", "image/webp"],
  cover: ["image/jpeg", "image/png", "image/webp"],
};

export async function requestUploadUrl(
  input: RequestUploadInput,
): Promise<
  | { ok: true; uploadUrl: string; key: string; bucket: string }
  | { ok: false; error: string }
> {
  // Any admin role can upload
  await requirePermission(PERMISSIONS.LECTURE_CREATE);

  const data = requestUploadSchema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { filename, mimeType, sizeBytes, uploadType } = data.data;

  // Validate MIME type for this upload type
  const allowed = ALLOWED_MIMES[uploadType] ?? [];
  if (!allowed.includes(mimeType)) {
    return {
      ok: false,
      error: `File type "${mimeType}" is not allowed for ${uploadType} uploads. Allowed: ${allowed.join(", ")}`,
    };
  }

  const bucket = getBucketForType(uploadType);
  const key = generateKey(uploadType, filename);

  try {
    const uploadUrl = await createPresignedUpload({
      bucket,
      key,
      contentType: mimeType,
      maxBytes: sizeBytes,
    });

    return { ok: true, uploadUrl, key, bucket };
  } catch (err) {
    console.error("[requestUploadUrl] Failed to generate presigned URL:", err);
    return {
      ok: false,
      error: "Failed to generate upload URL. Check R2 configuration.",
    };
  }
}
