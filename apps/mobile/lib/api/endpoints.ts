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
  SearchResultsPayload,
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
  list: (signal?: AbortSignal) =>
    apiFetch<LectureSummary[]>("/featured", {
      params: { type: "lecture" },
      signal,
    }),
};

export const remindersApi = {
  daily: (signal?: AbortSignal) =>
    apiFetch<ReminderSummary[]>("/reminders/daily", { signal }),
};

export interface SearchParams {
  q: string;
  page?: number;
}

export interface SearchResult {
  lectures: LectureSummary[];
  scholars: ScholarSummary[];
  series: SeriesSummary[];
}

export const searchApi = {
  // ASSUMPTION: type=all returns lectures+scholars (+articles/books we ignore)
  // in one response, matching SearchResults. Please confirm — if type=all
  // doesn't populate every bucket, we'll switch to two calls (type=lectures,
  // type=scholars) instead.
  query: (params: SearchParams, signal?: AbortSignal) =>
    apiFetch<SearchResultsPayload>("/search", {
      params: { query: params.q, type: "all", page: params.page },
      signal,
    }),
};
