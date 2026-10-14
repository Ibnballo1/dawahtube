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
  biography: string | null;
  websiteUrl: string | null;
  twitterHandle: string | null;
  banner: string | null;
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
  description: string | null;
  lectureCount: number;
  thumbnail: string | null;
  scholar: {
    id: string;
    slug: string;
    displayName: string;
    avatar: string | null;
  } | null;
}

export interface SeriesEpisode {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  position: number;
  durationSecs: number | null;
  publishedAt: string | null;
  hasAudio: boolean;
  thumbnail: string; // always present — may be relative, see resolveImageUrl above
}

export interface SeriesDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  scholar: {
    id: string;
    slug: string;
    displayName: string;
    avatar: string | null;
  } | null;
  episodeCount: number;
  episodes: SeriesEpisode[]; // was: items — flattened fields, not a nested `.lecture`
}

export interface ReminderSummary {
  id: string;
  title: string;
  content: string;
  source: string | null;
  scholar: { id: string; slug: string; displayName: string } | null;
}

export interface SearchLectureHit {
  id: string;
  slug: string;
  title: string;
  durationSecs: number | null;
  thumbnail: string | null;
  scholar: { slug: string; displayName: string } | null;
}
export interface SearchScholarHit {
  id: string;
  slug: string;
  displayName: string;
  lectureCount: number;
  avatar: string | null;
}
export interface SearchSeriesHit {
  id: string;
  slug: string;
  title: string;
  lectureCount: number;
  thumbnail: string | null;
}
export interface SearchResponse {
  query: string;
  total: number;
  lectures: SearchLectureHit[];
  lecturesTotal: number;
  scholars: SearchScholarHit[];
  scholarsTotal: number;
  series: SearchSeriesHit[];
  seriesTotal: number;
  meta: { page: number; limit: number; hasNext: boolean };
}

export interface FeaturedLecture {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  durationSecs: number | null;
  hasAudio: boolean;
  thumbnail: string | null;
  scholar: { id: string; slug: string; displayName: string } | null;
}
export interface FeaturedScholar {
  id: string;
  slug: string;
  displayName: string;
  lectureCount: number;
  avatar: string | null;
}
export interface FeaturedReminder {
  id: string;
  title: string;
  content: string;
  source: string | null;
  scholar: { id: string; slug: string; displayName: string } | null;
}
export interface FeaturedResponse {
  hero_lecture?: FeaturedLecture | FeaturedLecture[];
  featured_lectures?: FeaturedLecture | FeaturedLecture[];
  featured_scholars?: FeaturedScholar | FeaturedScholar[];
  daily_reminder?: FeaturedReminder | FeaturedReminder[];
  [slotKey: string]: unknown; // other slot keys the backend may add later — ignored here
}
