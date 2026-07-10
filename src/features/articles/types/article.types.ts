// src/features/articles/types/article.types.ts

import type {
  SelectArticle,
  SelectScholar,
  SelectArticleCategory,
  SelectMediaAsset,
  SelectTag,
} from "@core/database/types";

// ─── Filter / search params ───────────────────────────────────────────────────

export interface ArticleFilters {
  query?: string;
  categoryId?: string;
  scholarId?: string;
  tagSlug?: string;
  sort?: ArticleSortOption;
  page?: number;
}

export type ArticleSortOption =
  | "newest"
  | "oldest"
  | "popular"
  | "reading-time-asc"
  | "reading-time-desc";

// ─── Listing card data ────────────────────────────────────────────────────────

export type ArticleCard = Pick<
  SelectArticle,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "status"
  | "publishedAt"
  | "readingTimeMins"
  | "isFeatured"
  | "viewCount"
> & {
  scholar: ScholarMini | null;
  category: CategoryMini | null;
  coverAsset: AssetMini | null;
  tags: Array<{ tag: Pick<SelectTag, "id" | "slug" | "name"> }>;
};

// ─── Detail page data ─────────────────────────────────────────────────────────

export type ArticleDetail = SelectArticle & {
  scholar: ScholarFull | null;
  category: CategoryMini | null;
  author: Pick<{ id: string; name: string }, "id" | "name"> | null;
  coverAsset: SelectMediaAsset | null;
  tags: Array<{ tag: Pick<SelectTag, "id" | "slug" | "name"> }>;
};

// ─── Table of contents ────────────────────────────────────────────────────────

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3; // Only h2/h3 included — h1 is the article title, h4+ too granular
}

// ─── Related articles ─────────────────────────────────────────────────────────

export type RelatedArticle = Pick<
  SelectArticle,
  "id" | "slug" | "title" | "readingTimeMins" | "publishedAt" | "viewCount"
> & {
  scholar: ScholarMini | null;
  coverAsset: AssetMini | null;
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

export type CategoryMini = Pick<SelectArticleCategory, "id" | "slug" | "name">;

export type AssetMini = Pick<SelectMediaAsset, "publicUrl" | "altText">;

// ─── Listing result ───────────────────────────────────────────────────────────

export interface ArticleListResult {
  articles: ArticleCard[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
