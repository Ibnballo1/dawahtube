// src/features/search/types/search.types.ts

export type SearchContentType =
  | "all"
  | "lectures"
  | "articles"
  | "books"
  | "scholars";

export interface SearchFilters {
  query: string;
  type: SearchContentType;
  page?: number;
}

// ─── Per-type result shapes ────────────────────────────────────────────────────

export interface LectureSearchResult {
  kind: "lecture";
  id: string;
  slug: string;
  title: string;
  description: string | null;
  durationSecs: number | null;
  publishedAt: Date | null;
  scholarName: string | null;
  categoryName: string | null;
  thumbnailUrl: string | null;
}

export interface ArticleSearchResult {
  kind: "article";
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  readingTimeMins: number;
  publishedAt: Date | null;
  scholarName: string | null;
  categoryName: string | null;
  coverUrl: string | null;
}

export interface BookSearchResult {
  kind: "book";
  id: string;
  slug: string;
  title: string;
  authorName: string | null;
  pageCount: number | null;
  language: string;
  coverUrl: string | null;
  isFree: boolean;
}

export interface ScholarSearchResult {
  kind: "scholar";
  id: string;
  slug: string;
  name: string;
  honorifics: string | null;
  arabicName: string | null;
  nationality: string | null;
  lectureCount: number;
  articleCount: number;
  avatarUrl: string | null;
}

export type AnySearchResult =
  | LectureSearchResult
  | ArticleSearchResult
  | BookSearchResult
  | ScholarSearchResult;

// ─── Aggregated results ────────────────────────────────────────────────────────

export interface SearchResults {
  query: string;
  lectures: { items: LectureSearchResult[]; total: number };
  articles: { items: ArticleSearchResult[]; total: number };
  books: { items: BookSearchResult[]; total: number };
  scholars: { items: ScholarSearchResult[]; total: number };
  total: number; // sum of all types
}
