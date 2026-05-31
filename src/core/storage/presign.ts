// src/core/storage/presign.ts
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { r2, BUCKETS, type BucketKey } from "./r2-client";

const ALLOWED_TYPES = {
  image: ["image/jpeg", "image/webp", "image/png"],
  audio: ["audio/mpeg", "audio/mp4", "audio/ogg"],
  video: ["video/mp4", "video/webm"],
  pdf: ["application/pdf"],
} as const;

type MediaType = keyof typeof ALLOWED_TYPES;

interface PresignUploadOptions {
  bucket: BucketKey;
  entity: string; // e.g. 'lectures', 'scholars'
  entityId: string;
  mediaType: MediaType;
  mimeType: string;
  maxBytes: number;
}

export async function createPresignedUpload(opts: PresignUploadOptions) {
  if (!ALLOWED_TYPES[opts.mediaType].includes(opts.mimeType as never)) {
    throw new Error(
      `MIME type ${opts.mimeType} not allowed for ${opts.mediaType}`,
    );
  }

  const ext = opts.mimeType.split("/")[1]!;
  const key = `${opts.entity}/${opts.entityId}/${opts.mediaType}/${Date.now()}-${nanoid(8)}.${ext}`;

  const url = await getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: BUCKETS[opts.bucket],
      Key: key,
      ContentType: opts.mimeType,
      ContentLength: opts.maxBytes,
    }),
    { expiresIn: 300 }, // 5-minute upload window
  );

  return {
    url,
    key,
    bucket: opts.bucket,
    mimeType: opts.mimeType,
    assetType: opts.mediaType,
    expiresAt: new Date(Date.now() + 300_000),
  };
}

export async function createPresignedRead(bucket: BucketKey, key: string) {
  return getSignedUrl(
    r2,
    new GetObjectCommand({ Bucket: BUCKETS[bucket], Key: key }),
    { expiresIn: 3600 }, // 1-hour read window
  );
}

export function getPublicUrl(key: string): string {
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
