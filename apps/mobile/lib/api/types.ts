export interface AssetRef {
  publicUrl: string;
  altText: string | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PageMeta;
}

export interface CategorySummary {
  id: string;
  slug: string;
  name: string;
}

export interface TagSummary {
  id: string;
  slug: string;
  name: string;
}

export interface ScholarRef {
  id: string;
  slug: string;
  name: string;
  displayName: string; // honorifics + name, pre-joined by the backend
}

export interface ScholarSummary {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  arabicName: string | null;
  honorifics: string | null;
  avatar: string | null;
}

export interface ScholarDetail extends ScholarSummary {
  nationality: string | null;
  location: string | null;
  lectureCount: number;
  articleCount: number;
  isFeatured: boolean;
  // bannerAsset / biography — still unconfirmed, not in this list response;
  // leave as-is until you hit /api/v1/scholars/:slug and can confirm those
}

export interface LectureSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  durationSecs: number | null;
  publishedAt: string | null;
  viewCount: number;
  allowDownload: boolean;
  language: string;
  scholar: ScholarRef | null;
  category: CategorySummary | null;
  thumbnail: string | null;
}

export type MediaAssetStatus =
  "pending" | "uploaded" | "processing" | "ready" | "failed";

export interface MediaAssetRef {
  publicUrl: string | null; // permanent CDN URL if in the public bucket, else null
  mimeType: string;
  status: MediaAssetStatus;
  durationSecs: number | null;
  sizeBytes: number;
}

export interface LectureDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  transcript: string | null;
  durationSecs: number | null;
  publishedAt: string | null;
  viewCount: number;
  allowDownload: boolean;
  language: string;
  hasAudio: boolean;
  audioSizeBytes: number | null;
  scholar: {
    id: string;
    slug: string;
    name: string;
    displayName: string;
    arabicName: string | null;
    avatar: string | null;
  } | null;
  category: CategorySummary | null;
  thumbnail: string | null;
  series: { id: string; slug: string; title: string; position: number }[];
}

export interface StreamUrlResponse {
  url: string;
  expiresAt: string | null;
  type: "public" | "presigned";
}

export interface SeriesSummary {
  id: string;
  slug: string;
  title: string;
  scholar: Pick<ScholarSummary, "id" | "slug" | "name"> | null;
}

export interface SeriesDetail extends SeriesSummary {
  description: string | null;
  items: Array<{
    order: number;
    lecture: LectureSummary;
  }>;
}

export interface ReminderSummary {
  id: string;
  title: string;
  body: string;
  scholar: Pick<ScholarSummary, "id" | "slug" | "name" | "honorifics"> | null;
  imageAsset: AssetRef | null;
}

export type MobileSearchType = "lectures" | "scholars";

export interface SearchLectureResult {
  kind: "lecture";
  id: string;
  slug: string;
  title: string;
  description: string | null;
  durationSecs: number | null;
  publishedAt: string | null; // wire format — Date on the backend, ISO string over HTTP
  scholarName: string | null;
  categoryName: string | null;
  thumbnailUrl: string | null;
  allowDownload: boolean;
}

export interface SearchScholarResult {
  kind: "scholar";
  id: string;
  slug: string;
  name: string;
  honorifics: string | null;
  arabicName: string | null;
  nationality: string | null;
  lectureCount: number;
  avatarUrl: string | null;
}

export interface SearchResultsPayload {
  query: string;
  lectures: { items: SearchLectureResult[]; total: number };
  scholars: { items: SearchScholarResult[]; total: number };
  // articles / books exist in the real response — intentionally not typed here,
  // mobile ignores them.
}
