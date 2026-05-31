// src/core/analytics/pg-analytics.service.ts
import { db } from "@core/database/client";
import {
  lectureViews,
  articleViews,
  bookDownloads,
} from "@core/database/schema";
import { nanoid } from "nanoid";
import type { IAnalyticsService } from "./types";

export class PgAnalyticsService implements IAnalyticsService {
  async trackLectureView(
    lectureId: string,
    sessionId: string,
    durationSecs?: number,
    userId?: string,
    referrer?: string,
  ): Promise<void> {
    // Upsert: if the same session already has a view, just update duration.
    // Prevents one page refresh from counting as two views.
    await db
      .insert(lectureViews)
      .values({
        id: `lv_${nanoid(16)}`,
        lectureId,
        sessionId,
        userId: userId ?? null,
        durationSecs: durationSecs ?? null,
        referrer: referrer ?? null,
      })
      .onConflictDoUpdate({
        target: [lectureViews.lectureId, lectureViews.sessionId],
        set: { durationSecs: durationSecs ?? null },
      });
  }

  async trackArticleView(
    articleId: string,
    sessionId: string,
    userId?: string,
    referrer?: string,
  ): Promise<void> {
    await db
      .insert(articleViews)
      .values({
        id: `av_${nanoid(16)}`,
        articleId,
        sessionId,
        userId: userId ?? null,
        referrer: referrer ?? null,
      })
      .onConflictDoNothing({
        target: [articleViews.articleId, articleViews.sessionId],
      });
  }

  async trackBookDownload(bookId: string, userId?: string): Promise<void> {
    await db.insert(bookDownloads).values({
      id: `bd_${nanoid(16)}`,
      bookId,
      userId: userId ?? null,
    });
  }
}

export const analyticsService: IAnalyticsService = new PgAnalyticsService();
