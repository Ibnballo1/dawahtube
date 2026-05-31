// src/core/storage/types.ts
export type MediaAssetType =
  | "audio"
  | "video"
  | "image"
  | "pdf"
  | "thumbnail"
  | "avatar"
  | "cover"
  | "og_image";

export type MediaAssetStatus =
  | "pending"
  | "uploaded"
  | "processing"
  | "ready"
  | "failed";

export interface MediaAssetRecord {
  id: string;
  uploaderUserId: string;
  bucket: string; // 'media' | 'uploads' | 'books'
  key: string; // full R2 object key
  publicUrl: string | null; // null for private buckets
  assetType: MediaAssetType;
  mimeType: string;
  sizeBytes: number;
  durationSecs: number | null; // audio/video only
  width: number | null; // image only
  height: number | null; // image only
  altText: string | null; // accessibility
  status: MediaAssetStatus;
  metadata: Record<string, unknown>; // exif, bitrate, etc.
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
