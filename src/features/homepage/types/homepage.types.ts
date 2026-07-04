// src/features/homepage/types/homepage.types.ts
// Type contracts for homepage data flowing from queries to components.
// These mirror the DB types but are shaped for UI consumption only.

import type {
  SelectLecture,
  SelectScholar,
  SelectArticle,
  SelectBook,
  SelectReminder,
  SelectMediaAsset,
  SelectLectureCategory,
  SelectArticleCategory,
  SelectBookCategory,
} from "@core/database/types";

// ─── Homepage slot types ──────────────────────────────────────────────────────

export type HeroLecture = SelectLecture & {
  scholar:
    | (Pick<SelectScholar, "id" | "slug" | "name" | "honorifics"> & {
        avatarAsset: Pick<SelectMediaAsset, "publicUrl" | "altText"> | null;
      })
    | null;
  category: Pick<SelectLectureCategory, "id" | "slug" | "name"> | null;
  thumbnailAsset: Pick<SelectMediaAsset, "publicUrl" | "altText"> | null;
  audioAsset: Pick<SelectMediaAsset, "id" | "durationSecs"> | null;
};

export type FeaturedLecture = Pick<
  SelectLecture,
  "id" | "slug" | "title" | "description" | "viewCount"
> & {
  scholar: Pick<SelectScholar, "id" | "slug" | "name" | "honorifics"> | null;
  category: Pick<SelectLectureCategory, "id" | "slug" | "name"> | null;
  thumbnailAsset: Pick<SelectMediaAsset, "publicUrl" | "altText"> | null;
  audioAsset: Pick<SelectMediaAsset, "id" | "durationSecs"> | null;
};

export type FeaturedScholar = Pick<
  SelectScholar,
  | "id"
  | "slug"
  | "name"
  | "honorifics"
  | "nationality"
  | "lectureCount"
  | "articleCount"
> & {
  avatarAsset: Pick<SelectMediaAsset, "publicUrl" | "altText"> | null;
};

export type LatestArticle = Pick<
  SelectArticle,
  "id" | "slug" | "title" | "excerpt" | "readingTimeMins" | "publishedAt"
> & {
  scholar: Pick<SelectScholar, "id" | "slug" | "name" | "honorifics"> | null;
  category: Pick<SelectArticleCategory, "id" | "slug" | "name"> | null;
  coverAsset: Pick<SelectMediaAsset, "publicUrl" | "altText"> | null;
};

export type LibraryBook = Pick<
  SelectBook,
  "id" | "slug" | "title" | "authorName" | "pageCount" | "allowFreeDownload"
> & {
  category: Pick<SelectBookCategory, "id" | "slug" | "name"> | null;
  coverAsset: Pick<SelectMediaAsset, "publicUrl" | "altText"> | null;
};

export type DailyReminderData = Pick<
  SelectReminder,
  "id" | "title" | "content" | "source"
> & {
  scholar: Pick<SelectScholar, "id" | "slug" | "name" | "honorifics"> | null;
  imageAsset: Pick<SelectMediaAsset, "publicUrl" | "altText"> | null;
};

export interface PlatformStats {
  lectureCount: number;
  scholarCount: number;
  articleCount: number;
  bookCount: number;
}
