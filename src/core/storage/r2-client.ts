// src/core/storage/r2-client.ts
import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@core/config/env";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export const BUCKETS = {
  media: env.R2_BUCKET_MEDIA, // dawahtube-media   (public)
  uploads: env.R2_BUCKET_UPLOADS, // dawahtube-uploads (private)
  books: env.R2_BUCKET_BOOKS, // dawahtube-books   (private)
} as const;

export type BucketKey = keyof typeof BUCKETS;
