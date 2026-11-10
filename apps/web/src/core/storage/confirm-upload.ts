// src/core/storage/confirm-upload.ts
"use server";
//
// Step 2 of the upload flow. The browser has already PUT the file to R2
// using a presigned URL; this registers it in media_assets.
//
// Every Server Action is a public POST endpoint, so nothing the client says
// is trusted here:
//   1. the caller must be signed in and hold upload permission
//   2. the object must really exist in R2 (HeadObject)
//   3. size and content type come from R2, not from the client
//   4. the key must look like one generateKey() issues, and can be
//      registered only once
//   5. private buckets (uploads, books) never get a public URL

import { headers } from "next/headers";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "@core/database/client";
import { mediaAssets } from "@core/database/schema";
import auth from "@core/auth/config";
import { requirePermission } from "@core/auth/guard";
import { PERMISSIONS } from "@core/auth/permissions";
import { getPublicUrl } from "./presign";
import { r2, BUCKETS } from "./r2-client";

type Bucket = "media" | "uploads" | "books";

type AssetType =
  | "audio"
  | "video"
  | "image"
  | "pdf"
  | "thumbnail"
  | "avatar"
  | "cover"
  | "og_image";

const MAX_BYTES = 500 * 1024 * 1024; // same cap as requestUploadUrl

const confirmSchema = z.object({
  key: z.string().min(1).max(512),
  bucket: z.enum(["media", "uploads", "books"]),
  mimeType: z.string().min(1), // client claim; only a fallback if R2 has none
  sizeBytes: z.number().int().positive().max(MAX_BYTES), // must match R2
  filename: z.string().min(1).max(255),
  altText: z.string().max(500).optional(),
  durationSecs: z.number().int().positive().optional(),
});

export type ConfirmUploadInput = z.infer<typeof confirmSchema>;

export type ConfirmUploadResult =
  | { ok: true; assetId: string; publicUrl: string | null }
  | { ok: false; error: string };

// Keep in sync with ALLOWED_MIMES in upload.actions.ts
const ALLOWED_MIME: Record<Bucket, string[]> = {
  uploads: [
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
  ],
  books: ["application/pdf"],
  media: ["image/jpeg", "image/png", "image/webp", "image/gif"],
};

// Folders generateKey() in r2-client.ts produces, per bucket
const KEY_PREFIXES: Record<Bucket, string[]> = {
  uploads: ["audio/"],
  books: ["books/"],
  media: ["images/", "thumbnails/", "avatars/", "banners/", "covers/"],
};

function assetTypeFor(contentType: string): AssetType {
  if (contentType.startsWith("audio/")) return "audio";
  if (contentType === "application/pdf") return "pdf";
  return "image";
}

async function headObject(
  bucket: Bucket,
  key: string,
): Promise<{ size: number; contentType: string | undefined } | null> {
  try {
    const head = await r2.send(
      new HeadObjectCommand({ Bucket: BUCKETS[bucket], Key: key }),
    );
    return { size: head.ContentLength ?? 0, contentType: head.ContentType };
  } catch {
    return null;
  }
}

export async function confirmUpload(
  input: ConfirmUploadInput,
): Promise<ConfirmUploadResult> {
  // 1. Auth: same permission as requestUploadUrl
  await requirePermission(PERMISSIONS.LECTURE_CREATE);

  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);
  if (!session?.user) return { ok: false, error: "Not signed in" };
  const userId = session.user.id;

  const data = confirmSchema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const {
    key,
    bucket,
    mimeType: claimedMime,
    sizeBytes,
    filename,
    altText,
    durationSecs,
  } = data.data;

  // 2. Key shape
  if (
    key.includes("..") ||
    !KEY_PREFIXES[bucket].some((prefix) => key.startsWith(prefix))
  ) {
    return { ok: false, error: "Invalid upload key" };
  }

  // 3. Already registered? A retry by the same user is idempotent.
  const existing = await db.query.mediaAssets.findFirst({
    where: and(eq(mediaAssets.bucket, bucket), eq(mediaAssets.key, key)),
    columns: { id: true, publicUrl: true, uploaderUserId: true },
  });
  if (existing) {
    if (existing.uploaderUserId === userId) {
      return {
        ok: true,
        assetId: existing.id,
        publicUrl: existing.publicUrl ?? null,
      };
    }
    return { ok: false, error: "This file has already been registered" };
  }

  // 4. The object must really be in R2, and its size must match
  const head = await headObject(bucket, key);
  if (!head || head.size <= 0) {
    return {
      ok: false,
      error:
        "The uploaded file was not found in storage. Please upload it again.",
    };
  }
  if (head.size !== sizeBytes) {
    return {
      ok: false,
      error: "The uploaded file looks incomplete. Please upload it again.",
    };
  }

  // 5. Trust R2's content type, not the client's
  const contentType = (head.contentType ?? claimedMime)
    .split(";")[0]!
    .trim()
    .toLowerCase();
  if (!ALLOWED_MIME[bucket].includes(contentType)) {
    return {
      ok: false,
      error: `File type "${contentType}" is not allowed in this bucket.`,
    };
  }

  // 6. Only the public media bucket gets a public URL
  const publicUrl = bucket === "media" ? getPublicUrl(key, bucket) : null;

  const id = `ast_${nanoid(16)}`;

  try {
    await db.insert(mediaAssets).values({
      id,
      key,
      bucket,
      mimeType: contentType,
      sizeBytes: head.size,
      originalFilename: filename,
      altText: altText ?? filename,
      publicUrl,
      assetType: assetTypeFor(contentType),
      durationSecs: durationSecs ?? null,
      uploaderUserId: userId,
      // Admin uploads have no processing worker yet, so they are usable
      // immediately. The recorder flow (uploaded -> processing -> ready)
      // will set its own status.
      status: "ready",
    });

    return { ok: true, assetId: id, publicUrl };
  } catch (err) {
    // Unique index on (bucket, key) lost a race with another registration
    if ((err as { cause?: { code?: string } }).cause?.code === "23505") {
      return { ok: false, error: "This file has already been registered" };
    }
    console.error("[confirmUpload] DB insert failed:", err);
    return { ok: false, error: "Failed to register upload. Please try again." };
  }
}
