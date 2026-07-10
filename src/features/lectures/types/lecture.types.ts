// src/features/lectures/types/lecture.types.ts

import type {
  SelectLecture,
  SelectScholar,
  SelectLectureCategory,
  SelectMediaAsset,
  SelectTag,
  SelectSeries,
  SelectSeriesItem,
} from "@core/database/types";

// ─── Filter / search params ───────────────────────────────────────────────────

export interface LectureFilters {
  query?: string;
  categoryId?: string;
  scholarId?: string;
  tagSlug?: string;
  sort?: LectureSortOption;
  page?: number;
}

export type LectureSortOption =
  | "newest" // published_at DESC
  | "oldest" // published_at ASC
  | "popular" // view_count DESC
  | "duration-asc" // duration_secs ASC
  | "duration-desc"; // duration_secs DESC

// ─── Listing card data ────────────────────────────────────────────────────────

export type LectureCard = Pick<
  SelectLecture,
  | "id"
  | "slug"
  | "title"
  | "description"
  | "status"
  | "publishedAt"
  | "durationSecs"
  | "isFeatured"
  | "viewCount"
  | "allowDownload"
> & {
  scholar: ScholarMini | null;
  category: CategoryMini | null;
  thumbnailAsset: AssetMini | null;
  audioAsset: Pick<SelectMediaAsset, "id" | "durationSecs"> | null;
  tags: Array<{ tag: Pick<SelectTag, "id" | "slug" | "name"> }>;
};

// ─── Detail page data ─────────────────────────────────────────────────────────

export type LectureDetail = SelectLecture & {
  scholar: ScholarFull | null;
  category: CategoryMini | null;
  audioAsset: SelectMediaAsset | null;
  videoAsset: SelectMediaAsset | null;
  thumbnailAsset: AssetMini | null;
  tags: Array<{ tag: Pick<SelectTag, "id" | "slug" | "name"> }>;
  seriesItems: Array<{
    series: Pick<SelectSeries, "id" | "slug" | "title">;
    position: number;
  }>;
};

// ─── Series context on detail page ───────────────────────────────────────────

export interface LectureSeriesContext {
  series: Pick<SelectSeries, "id" | "slug" | "title" | "itemCount">;
  position: number;
  prev: SeriesNavItem | null;
  next: SeriesNavItem | null;
  items: SeriesNavItem[];
}

export interface SeriesNavItem {
  position: number;
  lectureId: string;
  slug: string;
  title: string;
  durationSecs: number | null;
}

// ─── Related lectures ─────────────────────────────────────────────────────────

export type RelatedLecture = Pick<
  SelectLecture,
  "id" | "slug" | "title" | "durationSecs" | "publishedAt" | "viewCount"
> & {
  scholar: ScholarMini | null;
  thumbnailAsset: AssetMini | null;
};

// ─── Shared mini types ────────────────────────────────────────────────────────

export type ScholarMini = Pick<
  SelectScholar,
  "id" | "slug" | "name" | "honorifics"
> & {
  avatarAsset: AssetMini | null;
};

export type ScholarFull = SelectScholar & {
  avatarAsset: SelectMediaAsset | null;
};

export type CategoryMini = Pick<SelectLectureCategory, "id" | "slug" | "name">;

export type AssetMini = Pick<SelectMediaAsset, "publicUrl" | "altText">;

// ─── Listing result ───────────────────────────────────────────────────────────

export interface LectureListResult {
  lectures: LectureCard[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── Filter option (for dropdowns) ───────────────────────────────────────────

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}
