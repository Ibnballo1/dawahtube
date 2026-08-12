// src/core/storage/presign.ts
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, BUCKETS, type BucketName } from "./r2-client";

// ─── Presigned PUT (upload) ───────────────────────────────────────────────────
// Generates a URL the client can use to PUT a file directly to R2.
// Expires in 10 minutes — enough time for any reasonable upload.

export async function createPresignedUpload({
  bucket,
  key,
  contentType,
  maxBytes,
}: {
  bucket: BucketName;
  key: string;
  contentType: string;
  maxBytes?: number;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKETS[bucket],
    Key: key,
    ContentType: contentType,
    ...(maxBytes && { ContentLength: maxBytes }),
  });

  return getSignedUrl(r2, command, { expiresIn: 60 * 10 });
}

// ─── Presigned GET (read) ─────────────────────────────────────────────────────
// Used for private buckets (audio, books) to generate time-limited read URLs.
// Public bucket assets use their public CDN URL directly.

export async function createPresignedRead(
  bucket: BucketName,
  key: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKETS[bucket],
    Key: key,
  });

  return getSignedUrl(r2, command, { expiresIn: expiresInSeconds });
}

// ─── Public URL builder ───────────────────────────────────────────────────────
// For the public `media` bucket. Uses the R2 custom domain if set.

// Example helper in your presign / storage module
export function getPublicUrl(key: string, bucket: BucketName): string {
  let domain = "";

  switch (bucket) {
    case "media":
      domain = process.env.NEXT_PUBLIC_MEDIA_URL || "";
      break;
    case "uploads":
      domain = process.env.NEXT_PUBLIC_UPLOADS_URL || "";
      break;
    case "books":
      domain = process.env.NEXT_PUBLIC_BOOKS_URL || "";
      break;
    default:
      domain = process.env.NEXT_PUBLIC_STORAGE_URL || "";
  }

  // Fallback default if not defined
  if (!domain) {
    domain = process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:3000";
  }

  if (!domain.startsWith("http://") && !domain.startsWith("https://")) {
    domain = `https://${domain}`;
  }

  const cleanBase = domain.replace(/\/$/, "");
  const cleanKey = key.replace(/^\//, "");

  return `${cleanBase}/${cleanKey}`;
}
