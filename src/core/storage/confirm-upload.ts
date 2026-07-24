// src/core/storage/confirm-upload.ts
"use server";

import { db } from "@core/database/client";
import { mediaAssets } from "@core/database/schema";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getPublicUrl } from "./presign";

const confirmSchema = z.object({
  key: z.string().min(1),
  bucket: z.enum(["media", "uploads", "books"]),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  filename: z.string().min(1),
  altText: z.string().optional(),
  durationSecs: z.number().int().positive().optional(),
});

export type ConfirmUploadInput = z.infer<typeof confirmSchema>;

export async function confirmUpload(
  input: ConfirmUploadInput,
): Promise<
  | { ok: true; assetId: string; publicUrl: string | null }
  | { ok: false; error: string }
> {
  const data = confirmSchema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { key, bucket, mimeType, sizeBytes, filename, altText, durationSecs } =
    data.data;

  let assetType:
    | "audio"
    | "video"
    | "image"
    | "pdf"
    | "thumbnail"
    | "avatar"
    | "cover"
    | "og_image";

  if (mimeType.startsWith("audio/")) {
    assetType = "audio";
  } else if (mimeType === "application/pdf") {
    assetType = "pdf";
  } else if (mimeType.startsWith("image/")) {
    assetType = "image";
  } else {
    assetType = "image";
  }

  // ✅ FIX: Generate public URL for media AND uploads buckets
  const publicUrl =
    bucket === "media" || bucket === "uploads" || bucket === "books"
      ? getPublicUrl(key, bucket)
      : null;

  const id = `ast_${nanoid(16)}`;

  try {
    await db.insert(mediaAssets).values({
      id,
      key,
      bucket,
      mimeType,
      sizeBytes,
      originalFilename: filename,
      altText: altText ?? filename,
      publicUrl,
      assetType,
      durationSecs: durationSecs ?? null,
      status: "ready",
    });

    return { ok: true, assetId: id, publicUrl };
  } catch (err) {
    console.error("[confirmUpload] DB insert failed:", err);
    return { ok: false, error: "Failed to register upload. Please try again." };
  }
}
