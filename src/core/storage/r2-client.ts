// src/core/storage/r2-client.ts
//
// Cloudflare R2 is S3-compatible, so we use the AWS SDK with R2's endpoint.
// The client is a module-level singleton — safe to reuse across requests.
//
// Three buckets:
//   dawahtube-media   — public  (thumbnails, cover images, avatars, banners)
//   dawahtube-uploads — private (lecture audio files, intermediate uploads)
//   dawahtube-books   — private (PDFs — access via presigned GET URLs only)

import { S3Client } from "@aws-sdk/client-s3";

function createR2Client() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    // Return a placeholder in build/dev when env vars aren't set yet.
    // Actual uploads will fail with a clear error rather than crashing at import.
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Missing R2 environment variables: CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY",
      );
    }
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId ?? "placeholder",
      secretAccessKey: secretAccessKey ?? "placeholder",
    },
  });
}

export const r2 = createR2Client();

// ─── Bucket names ─────────────────────────────────────────────────────────────

export const BUCKETS = {
  media: process.env.R2_BUCKET_MEDIA ?? "dawahtube-media",
  uploads: process.env.R2_BUCKET_UPLOADS ?? "dawahtube-uploads",
  books: process.env.R2_BUCKET_BOOKS ?? "dawahtube-books",
} as const;

export type BucketName = keyof typeof BUCKETS;

// ─── Key generators ───────────────────────────────────────────────────────────
// Consistent key patterns for each asset type.

export function generateKey(
  type: "audio" | "pdf" | "image" | "thumbnail" | "avatar" | "banner" | "cover",
  filename: string,
): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "bin";
  const ts = Date.now();
  const random = Math.random().toString(36).slice(2, 8);

  const folders: Record<string, string> = {
    audio: "audio",
    pdf: "books",
    image: "images",
    thumbnail: "thumbnails",
    avatar: "avatars",
    banner: "banners",
    cover: "covers",
  };

  return `${folders[type] ?? "misc"}/${ts}-${random}.${ext}`;
}

// ─── Which bucket each type belongs to ───────────────────────────────────────

export function getBucketForType(
  type: "audio" | "pdf" | "image" | "thumbnail" | "avatar" | "banner" | "cover",
): BucketName {
  if (type === "pdf") return "books";
  if (type === "audio") return "uploads";
  return "media";
}
