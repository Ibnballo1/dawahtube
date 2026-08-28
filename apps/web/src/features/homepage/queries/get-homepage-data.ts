// src/features/homepage/queries/get-homepage-data.ts

import { unstable_cache } from "next/cache";
import { db } from "@core/database/client";
import {
  featuredSlots,
  lectures,
  scholars,
  articles,
  books,
  reminders,
} from "@core/database/schema";
import { eq, and, isNull, or, gte, desc, asc, sql } from "drizzle-orm";

// ─── Hero lecture ─────────────────────────────────────────────────────────────

export const getHeroLecture = unstable_cache(
  async () => {
    const slot = await db.query.featuredSlots.findFirst({
      where: (s) =>
        and(
          eq(s.slotKey, "hero_lecture"),
          eq(s.isActive, true),
          or(isNull(s.validUntil), gte(s.validUntil, new Date())),
        ),
      orderBy: (s) => [asc(s.position)],
    });

    if (!slot || slot.entityType !== "lecture") {
      // Fallback — most recent published lecture
      return db.query.lectures.findFirst({
        where: (l) => and(eq(l.status, "published"), isNull(l.deletedAt)),
        orderBy: (l) => [desc(sql`COALESCE(${l.publishedAt}, ${l.createdAt})`)],
        with: {
          scholar: { with: { avatarAsset: true } },
          category: true,
          thumbnailAsset: true,
          audioAsset: { columns: { id: true, durationSecs: true } },
        },
      });
    }

    return db.query.lectures.findFirst({
      where: (l) =>
        and(
          eq(l.id, slot.entityId),
          eq(l.status, "published"),
          isNull(l.deletedAt),
        ),
      with: {
        scholar: { with: { avatarAsset: true } },
        category: true,
        thumbnailAsset: true,
        audioAsset: { columns: { id: true, durationSecs: true } },
      },
    });
  },
  ["hero-lecture"],
  { tags: ["homepage-featured", "featured-hero_lecture"], revalidate: 3600 },
);

// ─── Featured lectures (up to 6) ─────────────────────────────────────────────

export const getFeaturedLectures = unstable_cache(
  async () => {
    const slots = await db.query.featuredSlots.findMany({
      where: (s) =>
        and(
          eq(s.slotKey, "featured_lectures"),
          eq(s.isActive, true),
          or(isNull(s.validUntil), gte(s.validUntil, new Date())),
        ),
      orderBy: (s) => [asc(s.position)],
      limit: 6,
    });

    if (slots.length === 0) {
      return db.query.lectures.findMany({
        where: (l) => and(eq(l.status, "published"), isNull(l.deletedAt)),
        orderBy: (l) => [desc(sql`COALESCE(${l.publishedAt}, ${l.createdAt})`)],
        limit: 6,
        with: {
          scholar: {
            columns: { id: true, slug: true, name: true, honorifics: true },
          },
          category: { columns: { id: true, slug: true, name: true } },
          thumbnailAsset: {
            columns: { id: true, publicUrl: true, altText: true },
          },
          audioAsset: { columns: { id: true, durationSecs: true } },
        },
      });
    }

    const ids = slots.map((s) => s.entityId);
    const rows = await db.query.lectures.findMany({
      where: (l) => and(eq(l.status, "published"), isNull(l.deletedAt)),
      with: {
        scholar: {
          columns: { id: true, slug: true, name: true, honorifics: true },
        },
        category: { columns: { id: true, slug: true, name: true } },
        thumbnailAsset: {
          columns: { id: true, publicUrl: true, altText: true },
        },
        audioAsset: { columns: { id: true, durationSecs: true } },
      },
    });

    return ids
      .map((id) => rows.find((r) => r.id === id))
      .filter((r): r is NonNullable<typeof r> => r !== undefined);
  },
  ["featured-lectures"],
  {
    tags: ["homepage-featured", "featured-featured_lectures"],
    revalidate: 3600,
  },
);

// ─── Featured scholars (up to 4) ─────────────────────────────────────────────

export const getFeaturedScholars = unstable_cache(
  async () => {
    const slots = await db.query.featuredSlots.findMany({
      where: (s) =>
        and(
          eq(s.slotKey, "featured_scholars"),
          eq(s.isActive, true),
          or(isNull(s.validUntil), gte(s.validUntil, new Date())),
        ),
      orderBy: (s) => [asc(s.position)],
      limit: 4,
    });

    if (slots.length === 0) {
      return db.query.scholars.findMany({
        where: (s) => and(eq(s.isActive, true), isNull(s.deletedAt)),
        orderBy: (s) => [desc(s.lectureCount)],
        limit: 4,
        with: {
          avatarAsset: {
            columns: { id: true, publicUrl: true, altText: true },
          },
        },
      });
    }

    const ids = slots.map((s) => s.entityId);
    const rows = await db.query.scholars.findMany({
      where: (s) => and(eq(s.isActive, true), isNull(s.deletedAt)),
      with: {
        avatarAsset: { columns: { id: true, publicUrl: true, altText: true } },
      },
    });

    return ids
      .map((id) => rows.find((r) => r.id === id))
      .filter((r): r is NonNullable<typeof r> => r !== undefined);
  },
  ["featured-scholars"],
  {
    tags: ["homepage-featured", "featured-featured_scholars"],
    revalidate: 3600,
  },
);

// ─── Latest articles (up to 4) ───────────────────────────────────────────────

export const getLatestArticles = unstable_cache(
  async () => {
    const slots = await db.query.featuredSlots.findMany({
      where: (s) =>
        and(
          eq(s.slotKey, "featured_articles"),
          eq(s.isActive, true),
          or(isNull(s.validUntil), gte(s.validUntil, new Date())),
        ),
      orderBy: (s) => [asc(s.position)],
      limit: 4,
    });

    if (slots.length === 0) {
      return db.query.articles.findMany({
        where: (a) => and(eq(a.status, "published"), isNull(a.deletedAt)),
        orderBy: (a) => [desc(sql`COALESCE(${a.publishedAt}, ${a.createdAt})`)],
        limit: 4,
        with: {
          scholar: {
            columns: { id: true, slug: true, name: true, honorifics: true },
          },
          category: { columns: { id: true, slug: true, name: true } },
          coverAsset: { columns: { id: true, publicUrl: true, altText: true } },
        },
      });
    }

    const ids = slots.map((s) => s.entityId);
    const rows = await db.query.articles.findMany({
      where: (a) => and(eq(a.status, "published"), isNull(a.deletedAt)),
      with: {
        scholar: {
          columns: { id: true, slug: true, name: true, honorifics: true },
        },
        category: { columns: { id: true, slug: true, name: true } },
        coverAsset: { columns: { id: true, publicUrl: true, altText: true } },
      },
    });

    return ids
      .map((id) => rows.find((r) => r.id === id))
      .filter((r): r is NonNullable<typeof r> => r !== undefined);
  },
  ["featured-articles"],
  {
    tags: ["homepage-featured", "featured-featured_articles"],
    revalidate: 3600,
  },
);

// ─── Daily reminder ───────────────────────────────────────────────────────────

export const getDailyReminder = unstable_cache(
  async () => {
    // Try featured slot first
    const slot = await db.query.featuredSlots.findFirst({
      where: (s) =>
        and(
          eq(s.slotKey, "daily_reminder"),
          eq(s.isActive, true),
          or(isNull(s.validUntil), gte(s.validUntil, new Date())),
        ),
      orderBy: (s) => [asc(s.position)],
    });

    if (slot && slot.entityType === "reminder") {
      const pinned = await db.query.reminders.findFirst({
        where: (r) =>
          and(
            eq(r.id, slot.entityId),
            eq(r.status, "published"),
            isNull(r.deletedAt),
          ),
        with: {
          scholar: {
            columns: { id: true, slug: true, name: true, honorifics: true },
          },
          imageAsset: { columns: { id: true, publicUrl: true, altText: true } },
        },
      });
      if (pinned) return pinned;
    }

    // Fallback — most recent published or created reminder
    return db.query.reminders.findFirst({
      where: (r) => and(eq(r.status, "published"), isNull(r.deletedAt)),
      orderBy: (r) => [desc(sql`COALESCE(${r.publishedAt}, ${r.createdAt})`)],
      with: {
        scholar: {
          columns: { id: true, slug: true, name: true, honorifics: true },
        },
        imageAsset: { columns: { id: true, publicUrl: true, altText: true } },
      },
    });
  },
  ["daily-reminder"],
  { tags: ["homepage-featured", "featured-daily_reminder"], revalidate: 3600 },
);

// ─── Library highlights (up to 4) ────────────────────────────────────────────

export const getLibraryHighlights = unstable_cache(
  async () => {
    const slots = await db.query.featuredSlots.findMany({
      where: (s) =>
        and(
          eq(s.slotKey, "library_highlights"),
          eq(s.isActive, true),
          or(isNull(s.validUntil), gte(s.validUntil, new Date())),
        ),
      orderBy: (s) => [asc(s.position)],
      limit: 4,
    });

    if (slots.length === 0) {
      return db.query.books.findMany({
        where: (b) => and(eq(b.status, "published"), isNull(b.deletedAt)),
        orderBy: (b) => [desc(sql`COALESCE(${b.publishedAt}, ${b.createdAt})`)],
        limit: 4,
        with: {
          category: { columns: { id: true, slug: true, name: true } },
          coverAsset: { columns: { id: true, publicUrl: true, altText: true } },
        },
      });
    }

    const ids = slots.map((s) => s.entityId);
    const rows = await db.query.books.findMany({
      where: (b) => and(eq(b.status, "published"), isNull(b.deletedAt)),
      with: {
        category: { columns: { id: true, slug: true, name: true } },
        coverAsset: { columns: { id: true, publicUrl: true, altText: true } },
      },
    });

    return ids
      .map((id) => rows.find((r) => r.id === id))
      .filter((r): r is NonNullable<typeof r> => r !== undefined);
  },
  ["library-highlights"],
  {
    tags: ["homepage-featured", "featured-library_highlights"],
    revalidate: 3600,
  },
);

// ─── Platform stats (for mission section) ────────────────────────────────────

export const getPlatformStats = unstable_cache(
  async () => {
    const [lectureCount, scholarCount, articleCount, bookCount] =
      await Promise.all([
        db.$count(
          lectures,
          and(eq(lectures.status, "published"), isNull(lectures.deletedAt)),
        ),
        db.$count(
          scholars,
          and(eq(scholars.isActive, true), isNull(scholars.deletedAt)),
        ),
        db.$count(
          articles,
          and(eq(articles.status, "published"), isNull(articles.deletedAt)),
        ),
        db.$count(
          books,
          and(eq(books.status, "published"), isNull(books.deletedAt)),
        ),
      ]);
    return { lectureCount, scholarCount, articleCount, bookCount };
  },
  ["platform-stats"],
  { tags: ["platform-stats"], revalidate: 86400 },
);
