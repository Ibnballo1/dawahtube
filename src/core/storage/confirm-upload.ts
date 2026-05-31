// src/core/storage/confirm-upload.ts
// Called by the admin client after the browser PUT to R2 succeeds.
// Writes the media_assets row and returns the asset id.
"use server";
import { db } from "@core/database/client";
import { mediaAssets } from "@core/database/schema";
import { auth } from "@/core/auth/config";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKETS } from "./r2-client";
import { getPublicUrl } from "./presign";
import { nanoid } from "nanoid";
import { z } from "zod";

const confirmSchema = z.object({
  key: z.string().min(1),
  bucket: z.enum(["media", "uploads", "books"]),
  assetType: z.enum([
    "audio",
    "video",
    "image",
    "pdf",
    "thumbnail",
    "avatar",
    "cover",
    "og_image",
  ]),
  mimeType: z.string(),
  altText: z.string().optional(),
});

export async function confirmUpload(input: z.infer<typeof confirmSchema>) {
  const session = await auth.getSession();
  if (!session?.user) throw new Error("UNAUTHENTICATED");

  const data = confirmSchema.parse(input);

  // Verify the object actually exists in R2 before writing DB record
  const head = await r2.send(
    new HeadObjectCommand({
      Bucket: BUCKETS[data.bucket],
      Key: data.key,
    }),
  );

  const isPublic = data.bucket === "media";
  const publicUrl = isPublic ? getPublicUrl(data.key) : null;

  const [asset] = await db
    .insert(mediaAssets)
    .values({
      id: `mas_${nanoid(16)}`,
      uploaderUserId: session.user.id,
      bucket: data.bucket,
      key: data.key,
      publicUrl,
      assetType: data.assetType,
      mimeType: data.mimeType,
      sizeBytes: head.ContentLength ?? 0,
      status: "ready",
      altText: data.altText ?? null,
      metadata: {},
    })
    .returning();

  return asset;
}
