// src/features/scholars/types/scholar.types.ts
import type {
  SelectScholar,
  SelectLecture,
  SelectArticle,
  SelectLectureCategory,
  SelectArticleCategory,
  SelectMediaAsset,
} from "@core/database/types";

export interface ScholarFilters {
  query?: string;
  nationality?: string;
  sort?: ScholarSortOption;
  page?: number;
}

export type ScholarSortOption =
  | "name-asc"
  | "name-desc"
  | "lectures-desc"
  | "newest";

export type ScholarCard = Pick<
  SelectScholar,
  | "id"
  | "slug"
  | "name"
  | "arabicName"
  | "honorifics"
  | "nationality"
  | "location"
  | "isActive"
  | "lectureCount"
  | "articleCount"
  | "isFeatured"
> & { avatarAsset: AssetMini | null };

export type ScholarProfile = SelectScholar & {
  avatarAsset: SelectMediaAsset | null;
  bannerAsset: SelectMediaAsset | null;
};

export type ScholarLecture = Pick<
  SelectLecture,
  | "id"
  | "slug"
  | "title"
  | "description"
  | "durationSecs"
  | "publishedAt"
  | "viewCount"
> & {
  category: Pick<SelectLectureCategory, "id" | "slug" | "name"> | null;
  thumbnailAsset: AssetMini | null;
  audioAsset: Pick<SelectMediaAsset, "id" | "durationSecs"> | null;
};

export type ScholarArticle = Pick<
  SelectArticle,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "readingTimeMins"
  | "publishedAt"
  | "viewCount"
> & {
  category: Pick<SelectArticleCategory, "id" | "slug" | "name"> | null;
  coverAsset: AssetMini | null;
};

export type AssetMini = Pick<SelectMediaAsset, "publicUrl" | "altText">;

export interface ScholarListResult {
  scholars: ScholarCard[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ScholarContentResult {
  lectures: ScholarLecture[];
  articles: ScholarArticle[];
  totalLectures: number;
  totalArticles: number;
}
