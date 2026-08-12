// src/features/library/types/library.types.ts

import type {
  SelectBook,
  SelectBookCategory,
  SelectMediaAsset,
  SelectTag,
} from "@core/database/types";

// ─── Filter / search params ───────────────────────────────────────────────────

export interface BookFilters {
  query?: string;
  categoryId?: string;
  tagSlug?: string;
  freeOnly?: boolean;
  language?: string;
  sort?: BookSortOption;
  page?: number;
}

export type BookSortOption =
  | "newest"
  | "oldest"
  | "popular" // download count DESC
  | "title-asc"
  | "pages-asc"
  | "pages-desc";

// ─── Listing card data ────────────────────────────────────────────────────────

export type BookCard = Pick<
  SelectBook,
  | "id"
  | "slug"
  | "title"
  | "authorName"
  | "translator"
  | "publishYear"
  | "pageCount"
  | "language"
  | "allowFreeDownload"
  | "status"
  | "publishedAt"
  | "isFeatured"
  | "viewCount"
> & {
  category: CategoryMini | null;
  coverAsset: AssetMini | null;
  tags: Array<{ tag: Pick<SelectTag, "id" | "slug" | "name"> }>;
};

// ─── Detail page data ─────────────────────────────────────────────────────────

export type BookDetail = SelectBook & {
  category: CategoryMini | null;
  pdfAsset: Pick<
    SelectMediaAsset,
    "id" | "key" | "bucket" | "sizeBytes" | "mimeType"
  > | null;
  previewAsset: Pick<SelectMediaAsset, "id" | "key" | "bucket"> | null;
  coverAsset: SelectMediaAsset | null;
  tags: Array<{ tag: Pick<SelectTag, "id" | "slug" | "name"> }>;
};

// ─── Related books ─────────────────────────────────────────────────────────────

export type RelatedBook = Pick<
  SelectBook,
  "id" | "slug" | "title" | "authorName" | "pageCount" | "allowFreeDownload"
> & {
  coverAsset: AssetMini | null;
};

// ─── Shared mini types ────────────────────────────────────────────────────────

export type CategoryMini = Pick<SelectBookCategory, "id" | "slug" | "name">;
export type AssetMini = Pick<SelectMediaAsset, "publicUrl" | "altText">;

// ─── Listing result ───────────────────────────────────────────────────────────

export interface BookListResult {
  books: BookCard[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── Presigned access result ───────────────────────────────────────────────────

export interface PresignedBookAccess {
  url: string;
  expiresAt: string; // ISO timestamp, serialisable across server/client boundary
}
