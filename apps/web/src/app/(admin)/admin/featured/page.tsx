// src/app/(admin)/admin/featured/page.tsx
import type { Metadata } from "next";
import { db } from "@core/database/client";
import {
  featuredSlots,
  lectures,
  articles,
  books,
  scholars,
  reminders,
} from "@core/database/schema";
import { eq, and, isNull, asc } from "drizzle-orm";
import { FeaturedSlotsManager } from "@features/admin/components/client/FeaturedSlotsManager";
import { requirePermission } from "@core/auth/guard";
import { PERMISSIONS } from "@core/auth/permissions";

export const metadata: Metadata = { title: "Manage Homepage" };
export const dynamic = "force-dynamic";

// Slot configuration — defines all valid slot keys and their limits
const SLOT_CONFIG = [
  {
    key: "hero_lecture",
    label: "Hero Lecture",
    max: 1,
    entityType: "lecture" as const,
  },
  {
    key: "featured_lectures",
    label: "Featured Lectures",
    max: 6,
    entityType: "lecture" as const,
  },
  {
    key: "featured_scholars",
    label: "Featured Scholars",
    max: 4,
    entityType: "scholar" as const,
  },
  {
    key: "featured_articles",
    label: "Featured Articles",
    max: 4,
    entityType: "article" as const,
  },
  {
    key: "library_highlights",
    label: "Library Highlights",
    max: 4,
    entityType: "book" as const,
  },
  {
    key: "daily_reminder",
    label: "Daily Reminder",
    max: 1,
    entityType: "reminder" as const,
  },
];

export default async function AdminFeaturedPage() {
  await requirePermission(PERMISSIONS.FEATURED_MANAGE);

  // Fetch current slot assignments
  const currentSlots = await db.query.featuredSlots.findMany({
    orderBy: [asc(featuredSlots.slotKey), asc(featuredSlots.position)],
  });

  // Fetch candidate entities for each slot type
  const [
    publishedLectures,
    publishedScholars,
    publishedArticles,
    publishedBooks,
    publishedReminders,
  ] = await Promise.all([
    db.query.lectures.findMany({
      where: and(eq(lectures.status, "published"), isNull(lectures.deletedAt)),
      columns: { id: true, title: true, slug: true },
      orderBy: (l, { desc }) => [desc(l.publishedAt)],
      limit: 50,
    }),
    db.query.scholars.findMany({
      where: and(eq(scholars.isActive, true), isNull(scholars.deletedAt)),
      columns: { id: true, name: true, slug: true, honorifics: true },
      orderBy: (s, { asc }) => [asc(s.name)],
    }),
    db.query.articles.findMany({
      where: and(eq(articles.status, "published"), isNull(articles.deletedAt)),
      columns: { id: true, title: true, slug: true },
      orderBy: (a, { desc }) => [desc(a.publishedAt)],
      limit: 50,
    }),
    db.query.books.findMany({
      where: and(eq(books.status, "published"), isNull(books.deletedAt)),
      columns: { id: true, title: true, slug: true },
      orderBy: (b, { desc }) => [desc(b.publishedAt)],
      limit: 50,
    }),
    db.query.reminders.findMany({
      where: and(
        eq(reminders.status, "published"),
        isNull(reminders.deletedAt),
      ),
      columns: { id: true, title: true },
      orderBy: (r, { desc }) => [desc(r.publishedAt)],
      limit: 30,
    }),
  ]);

  const candidates = {
    lecture: publishedLectures.map((l) => ({ id: l.id, label: l.title })),
    scholar: publishedScholars.map((s) => ({
      id: s.id,
      label: [s.honorifics, s.name].filter(Boolean).join(" "),
    })),
    article: publishedArticles.map((a) => ({ id: a.id, label: a.title })),
    book: publishedBooks.map((b) => ({ id: b.id, label: b.title })),
    reminder: publishedReminders.map((r) => ({ id: r.id, label: r.title })),
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-primary">
          Homepage CMS
        </h1>
        <p className="text-ink-muted text-sm mt-1">
          Control what appears on the homepage. Changes take effect immediately.
        </p>
      </div>

      <FeaturedSlotsManager
        slotConfig={SLOT_CONFIG}
        currentSlots={currentSlots.map((s) => ({
          id: s.id,
          slotKey: s.slotKey,
          position: s.position,
          entityType: s.entityType,
          entityId: s.entityId,
          isActive: s.isActive,
        }))}
        candidates={candidates}
      />
    </div>
  );
}
