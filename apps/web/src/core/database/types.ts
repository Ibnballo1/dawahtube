// src/core/database/types.ts
//
// All database types are inferred directly from the Drizzle schema.
// Never write manual interfaces that duplicate schema columns —
// these types stay in sync with the schema automatically.
//
// Naming convention:
//   Select{Entity}  — the full row type (SELECT *)
//   Insert{Entity}  — the insert type (all required fields)
//   Update{Entity}  — partial insert type for UPDATE operations
//   {Entity}With{Relation} — joined type with eager-loaded relations

import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  // Auth
  user,
  session,
  account,
  roles,
  rolePermissions,
  userRoles,
  // Storage
  mediaAssets,
  // Content
  scholars,
  scholarTranslations,
  lectureCategories,
  lectures,
  lectureTags,
  series,
  seriesItems,
  lectureTranslations,
  articleCategories,
  articles,
  articleTags,
  articleTranslations,
  bookCategories,
  books,
  bookTags,
  bookTranslations,
  reminders,
  tags,
  // Homepage
  featuredSlots,
  // Analytics
  lectureViews,
  articleViews,
  bookDownloads,
  dailyReminderViews,
  // Audit
  auditLogs,
} from "./schema";

// ─── Auth ─────────────────────────────────────────────────────────────────────
export type SelectUser = typeof user.$inferSelect;
export type InsertUser = typeof user.$inferInsert;
export type SelectSession = typeof session.$inferSelect;
export type SelectAccount = typeof account.$inferSelect;
export type SelectRole = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;
export type SelectRolePermission = typeof rolePermissions.$inferSelect;
export type SelectUserRole = typeof userRoles.$inferSelect;

// ─── Media ────────────────────────────────────────────────────────────────────
export type SelectMediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = typeof mediaAssets.$inferInsert;
export type UpdateMediaAsset = Partial<InsertMediaAsset>;

// ─── Scholars ─────────────────────────────────────────────────────────────────
export type SelectScholar = typeof scholars.$inferSelect;
export type InsertScholar = typeof scholars.$inferInsert;
export type UpdateScholar = Partial<InsertScholar>;
export type SelectScholarTranslation = typeof scholarTranslations.$inferSelect;

// Scholar with media assets pre-loaded
export interface ScholarWithAssets extends SelectScholar {
  avatarAsset: SelectMediaAsset | null;
  bannerAsset: SelectMediaAsset | null;
}

// Scholar for listing pages (minimal fields)
export type ScholarListItem = Pick<
  SelectScholar,
  | "id"
  | "slug"
  | "name"
  | "arabicName"
  | "honorifics"
  | "nationality"
  | "location"
  | "lectureCount"
  | "articleCount"
  | "isFeatured"
> & {
  avatarAsset: Pick<SelectMediaAsset, "publicUrl" | "altText"> | null;
};

// ─── Lecture Categories ───────────────────────────────────────────────────────
export type SelectLectureCategory = typeof lectureCategories.$inferSelect;
export type InsertLectureCategory = typeof lectureCategories.$inferInsert;

export interface LectureCategoryWithChildren extends SelectLectureCategory {
  children: SelectLectureCategory[];
}

// ─── Lectures ─────────────────────────────────────────────────────────────────
export type SelectLecture = typeof lectures.$inferSelect;
export type InsertLecture = typeof lectures.$inferInsert;
export type UpdateLecture = Partial<
  Omit<InsertLecture, "id" | "createdAt" | "updatedAt">
>;
export type SelectLectureTag = typeof lectureTags.$inferSelect;
export type SelectLectureTranslation = typeof lectureTranslations.$inferSelect;

// Lecture for listing pages
export type LectureListItem = Pick<
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
> & {
  scholar: Pick<SelectScholar, "id" | "slug" | "name" | "honorifics"> | null;
  category: Pick<SelectLectureCategory, "id" | "slug" | "name"> | null;
  thumbnailAsset: Pick<SelectMediaAsset, "publicUrl" | "altText"> | null;
};

// Lecture detail page — full data
export interface LectureDetail extends SelectLecture {
  scholar: ScholarWithAssets | null;
  category: SelectLectureCategory | null;
  audioAsset: SelectMediaAsset | null;
  videoAsset: SelectMediaAsset | null;
  thumbnailAsset: SelectMediaAsset | null;
  tags: Array<{ tag: SelectTag }>;
}

// ─── Series ───────────────────────────────────────────────────────────────────
export type SelectSeries = typeof series.$inferSelect;
export type InsertSeries = typeof series.$inferInsert;
export type UpdateSeries = Partial<InsertSeries>;
export type SelectSeriesItem = typeof seriesItems.$inferSelect;
export type InsertSeriesItem = typeof seriesItems.$inferInsert;

export interface SeriesWithItems extends SelectSeries {
  scholar: ScholarListItem | null;
  items: Array<SelectSeriesItem & { lecture: LectureListItem }>;
}

// ─── Article Categories ───────────────────────────────────────────────────────
export type SelectArticleCategory = typeof articleCategories.$inferSelect;
export type InsertArticleCategory = typeof articleCategories.$inferInsert;

// ─── Articles ─────────────────────────────────────────────────────────────────
export type SelectArticle = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;
export type UpdateArticle = Partial<
  Omit<InsertArticle, "id" | "createdAt" | "updatedAt">
>;
export type SelectArticleTag = typeof articleTags.$inferSelect;
export type SelectArticleTranslation = typeof articleTranslations.$inferSelect;

export type ArticleListItem = Pick<
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
  scholar: Pick<SelectScholar, "id" | "slug" | "name"> | null;
  category: Pick<SelectArticleCategory, "id" | "slug" | "name"> | null;
  coverAsset: Pick<SelectMediaAsset, "publicUrl" | "altText"> | null;
};

export interface ArticleDetail extends SelectArticle {
  scholar: ScholarWithAssets | null;
  category: SelectArticleCategory | null;
  coverAsset: SelectMediaAsset | null;
  tags: Array<{ tag: SelectTag }>;
}

// ─── Book Categories ──────────────────────────────────────────────────────────
export type SelectBookCategory = typeof bookCategories.$inferSelect;
export type InsertBookCategory = typeof bookCategories.$inferInsert;

// ─── Books ────────────────────────────────────────────────────────────────────
export type SelectBook = typeof books.$inferSelect;
export type InsertBook = typeof books.$inferInsert;
export type UpdateBook = Partial<
  Omit<InsertBook, "id" | "createdAt" | "updatedAt">
>;
export type SelectBookTag = typeof bookTags.$inferSelect;
export type SelectBookTranslation = typeof bookTranslations.$inferSelect;

export type BookListItem = Pick<
  SelectBook,
  | "id"
  | "slug"
  | "title"
  | "description"
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
  category: Pick<SelectBookCategory, "id" | "slug" | "name"> | null;
  coverAsset: Pick<SelectMediaAsset, "publicUrl" | "altText"> | null;
};

export interface BookDetail extends SelectBook {
  category: SelectBookCategory | null;
  pdfAsset: SelectMediaAsset | null;
  previewAsset: SelectMediaAsset | null;
  coverAsset: SelectMediaAsset | null;
  tags: Array<{ tag: SelectTag }>;
}

// ─── Reminders ────────────────────────────────────────────────────────────────
export type SelectReminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;
export type UpdateReminder = Partial<
  Omit<InsertReminder, "id" | "createdAt" | "updatedAt">
>;

export interface ReminderWithScholar extends SelectReminder {
  scholar: Pick<SelectScholar, "id" | "slug" | "name" | "honorifics"> | null;
  imageAsset: Pick<SelectMediaAsset, "publicUrl" | "altText"> | null;
}

// ─── Tags ─────────────────────────────────────────────────────────────────────
export type SelectTag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;
export type UpdateTag = Partial<
  Omit<InsertTag, "id" | "createdAt" | "updatedAt">
>;

// ─── Featured Slots ───────────────────────────────────────────────────────────
export type SelectFeaturedSlot = typeof featuredSlots.$inferSelect;
export type InsertFeaturedSlot = typeof featuredSlots.$inferInsert;
export type UpdateFeaturedSlot = Partial<
  Omit<InsertFeaturedSlot, "id" | "createdAt" | "updatedAt">
>;

// ─── Analytics ────────────────────────────────────────────────────────────────
export type SelectLectureView = typeof lectureViews.$inferSelect;
export type InsertLectureView = typeof lectureViews.$inferInsert;
export type SelectArticleView = typeof articleViews.$inferSelect;
export type SelectBookDownload = typeof bookDownloads.$inferSelect;
export type SelectReminderView = typeof dailyReminderViews.$inferSelect;

// Analytics aggregation result types — returned by reporting queries
export interface ContentViewStats {
  entityId: string;
  viewCount: number;
  uniqueCount: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface PlatformStats {
  totalLectures: number;
  totalArticles: number;
  totalBooks: number;
  totalScholars: number;
  totalViews: number;
  totalDownloads: number;
}

// ─── Audit ────────────────────────────────────────────────────────────────────
export type SelectAuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

export interface AuditLogWithUser extends SelectAuditLog {
  user: Pick<SelectUser, "id" | "name" | "email"> | null;
}

// ─── Shared query utilities ───────────────────────────────────────────────────

// Pagination parameters — used by all listing queries
export interface PaginationParams {
  page: number; // 1-based
  limit: number; // max 100
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Content status union (mirrors the Postgres enum)
export type ContentStatus =
  | "draft"
  | "review"
  | "scheduled"
  | "published"
  | "archived";

// Publishable entity union — used by featured slots and search
export type PublishableEntity =
  | "lecture"
  | "article"
  | "book"
  | "scholar"
  | "reminder";
