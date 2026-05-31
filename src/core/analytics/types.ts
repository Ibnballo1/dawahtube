// src/core/analytics/types.ts
export interface IAnalyticsService {
  trackLectureView(
    lectureId: string,
    sessionId: string,
    durationSecs?: number,
  ): Promise<void>;
  trackArticleView(articleId: string, sessionId: string): Promise<void>;
  trackBookDownload(bookId: string, userId: string | null): Promise<void>;
}

export interface LectureViewRecord {
  id: string;
  lectureId: string;
  sessionId: string; // anonymous session — no PII
  userId: string | null; // null for guests
  durationSecs: number | null; // how long they listened/watched
  referrer: string | null;
  createdAt: Date;
}

export interface ArticleViewRecord {
  id: string;
  articleId: string;
  sessionId: string;
  userId: string | null;
  referrer: string | null;
  createdAt: Date;
}

export interface BookDownloadRecord {
  id: string;
  bookId: string;
  userId: string | null;
  createdAt: Date;
}
