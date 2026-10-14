import { apiFetch } from "./client";
import type {
  LectureDetail,
  LectureSummary,
  PaginatedResult,
  PaginationParams,
  ScholarDetail,
  ScholarSummary,
  SeriesDetail,
  SeriesSummary,
  StreamUrlResponse,
  CategorySummary,
  ReminderSummary,
  // SearchResultsPayload,
  SearchResponse,
  FeaturedResponse,
} from "./types";

export type LectureListParams = PaginationParams & {
  scholarSlug?: string;
  seriesSlug?: string;
  categorySlug?: string;
  sort?: "recent" | "popular";
};

// lib/api/endpoints.ts — the correct, single-unwrap version
export const lecturesApi = {
  list: (params: LectureListParams = {}, signal?: AbortSignal) =>
    apiFetch<PaginatedResult<LectureSummary>>("/lectures", {
      params: params as Record<string, string | number | boolean | undefined>,
      signal,
    }),
  byId: (id: string, signal?: AbortSignal) =>
    apiFetch<LectureDetail>(`/lectures/${id}`, { signal }),
  streamUrl: (id: string, signal?: AbortSignal) =>
    apiFetch<StreamUrlResponse>(`/lectures/${id}/stream-url`, { signal }),
};

export const scholarsApi = {
  list: (params: PaginationParams = {}, signal?: AbortSignal) =>
    apiFetch<PaginatedResult<ScholarSummary>>("/scholars", {
      params: params as Record<string, string | number | boolean | undefined>,
      signal,
    }),
  bySlug: (slug: string, signal?: AbortSignal) =>
    apiFetch<ScholarDetail>(`/scholars/${slug}`, { signal }),
  lectures: (
    slug: string,
    params: PaginationParams = {},
    signal?: AbortSignal,
  ) =>
    apiFetch<PaginatedResult<LectureSummary>>(`/scholars/${slug}/lectures`, {
      params: params as Record<string, string | number | boolean | undefined>,
      signal,
    }),
};

export const seriesApi = {
  list: (params: PaginationParams = {}, signal?: AbortSignal) =>
    apiFetch<PaginatedResult<SeriesSummary>>("/series", {
      params: params as Record<string, string | number | boolean | undefined>,
      signal,
    }),
  bySlug: (slug: string, signal?: AbortSignal) =>
    apiFetch<SeriesDetail>(`/series/${slug}`, { signal }),
};

export const categoriesApi = {
  list: (signal?: AbortSignal) =>
    apiFetch<CategorySummary[]>("/categories", { signal }),
};

export const featuredApi = {
  all: (signal?: AbortSignal) =>
    apiFetch<FeaturedResponse>("/featured", { signal }),
};

export const remindersApi = {
  latest: (signal?: AbortSignal) =>
    apiFetch<ReminderSummary | null>("/reminders", { signal }),
};

export interface SearchParams {
  q: string;
  type?: "all" | "lectures" | "scholars" | "series";
  page?: number;
}
export const searchApi = {
  query: (params: SearchParams, signal?: AbortSignal) =>
    apiFetch<SearchResponse>("/search", {
      params: { q: params.q, type: params.type ?? "all", page: params.page },
      signal,
    }),
};

export interface SearchResult {
  lectures: LectureSummary[];
  scholars: ScholarSummary[];
  series: SeriesSummary[];
}
