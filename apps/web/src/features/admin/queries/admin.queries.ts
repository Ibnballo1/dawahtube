// src/features/admin/queries/admin.queries.ts
import { db } from "@core/database/client";
import { unstable_cache } from "next/cache";
import {
  lectures,
  articles,
  books,
  scholars,
  user,
  auditLogs,
} from "@core/database/schema";
import { eq, and, isNull, desc, count, sql, ne } from "drizzle-orm";
import type { DashboardStats } from "../types/admin.types";

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export const getDashboardStats = unstable_cache(
  async (): Promise<DashboardStats> => {
    const [
      lectureStats,
      articleStats,
      bookStats,
      scholarStats,
      userCount,
      recentLogs,
    ] = await Promise.all([
      // Lecture counts by status
      db
        .select({ status: lectures.status, count: count() })
        .from(lectures)
        .where(isNull(lectures.deletedAt))
        .groupBy(lectures.status),

      // Article counts by status
      db
        .select({ status: articles.status, count: count() })
        .from(articles)
        .where(isNull(articles.deletedAt))
        .groupBy(articles.status),

      // Book counts by status
      db
        .select({ status: books.status, count: count() })
        .from(books)
        .where(isNull(books.deletedAt))
        .groupBy(books.status),

      // Scholar counts
      db
        .select({ isActive: scholars.isActive, count: count() })
        .from(scholars)
        .where(isNull(scholars.deletedAt))
        .groupBy(scholars.isActive),

      // User count
      db.select({ count: count() }).from(user).where(isNull(user.deletedAt)),

      // Recent audit log entries
      db.query.auditLogs.findMany({
        orderBy: [desc(auditLogs.createdAt)],
        limit: 10,
        with: {
          user: { columns: { id: true, name: true } },
        },
      }),
    ]);

    const sumByStatus = (
      rows: Array<{ status: string; count: number }>,
      status: string,
    ) => rows.find((r) => r.status === status)?.count ?? 0;

    return {
      lectures: {
        total: lectureStats.reduce((s, r) => s + r.count, 0),
        published: sumByStatus(lectureStats, "published"),
        draft: sumByStatus(lectureStats, "draft"),
        pending:
          sumByStatus(lectureStats, "review") +
          sumByStatus(lectureStats, "scheduled"),
      },
      articles: {
        total: articleStats.reduce((s, r) => s + r.count, 0),
        published: sumByStatus(articleStats, "published"),
        draft: sumByStatus(articleStats, "draft"),
        pending:
          sumByStatus(articleStats, "review") +
          sumByStatus(articleStats, "scheduled"),
      },
      books: {
        total: bookStats.reduce((s, r) => s + r.count, 0),
        published: sumByStatus(bookStats, "published"),
        draft: sumByStatus(bookStats, "draft"),
      },
      scholars: {
        total: scholarStats.reduce((s, r) => s + r.count, 0),
        active: scholarStats.find((r) => r.isActive)?.count ?? 0,
      },
      users: {
        total: userCount[0]?.count ?? 0,
      },
      recentAuditLogs: recentLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        userId: log.userId,
        userName: log.user?.name ?? null,
        createdAt: log.createdAt,
      })),
    };
  },
  ["admin-dashboard-stats"],
  { tags: ["admin-stats"], revalidate: 60 },
);

// ─── Admin lecture list ───────────────────────────────────────────────────────

export async function getAdminLectures({
  page = 1,
  status,
  query,
}: {
  page?: number;
  status?: string;
  query?: string;
} = {}) {
  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [isNull(lectures.deletedAt)];
  if (status) conditions.push(eq(lectures.status, status as "draft"));
  if (query) {
    conditions.push(
      sql`${lectures.searchVector} @@ websearch_to_tsquery('simple', ${query})`,
    );
  }

  const [totalResult, rows] = await Promise.all([
    db
      .select({ count: count() })
      .from(lectures)
      .where(and(...conditions)),
    db.query.lectures.findMany({
      where: and(...conditions),
      orderBy: [desc(lectures.updatedAt)],
      limit: PAGE_SIZE,
      offset,
      with: {
        scholar: { columns: { id: true, slug: true, name: true } },
        category: { columns: { id: true, name: true } },
      },
    }),
  ]);

  return {
    lectures: rows,
    total: totalResult[0]?.count ?? 0,
    page,
    totalPages: Math.ceil((totalResult[0]?.count ?? 0) / PAGE_SIZE),
  };
}

// ─── Admin article list ───────────────────────────────────────────────────────

export async function getAdminArticles({
  page = 1,
  status,
  query,
}: { page?: number; status?: string; query?: string } = {}) {
  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [isNull(articles.deletedAt)];
  if (status) conditions.push(eq(articles.status, status as "draft"));
  if (query) {
    conditions.push(
      sql`${articles.searchVector} @@ websearch_to_tsquery('simple', ${query})`,
    );
  }

  const [totalResult, rows] = await Promise.all([
    db
      .select({ count: count() })
      .from(articles)
      .where(and(...conditions)),
    db.query.articles.findMany({
      where: and(...conditions),
      orderBy: [desc(articles.updatedAt)],
      limit: PAGE_SIZE,
      offset,
      with: {
        scholar: { columns: { id: true, slug: true, name: true } },
        category: { columns: { id: true, name: true } },
      },
    }),
  ]);

  return {
    articles: rows,
    total: totalResult[0]?.count ?? 0,
    page,
    totalPages: Math.ceil((totalResult[0]?.count ?? 0) / PAGE_SIZE),
  };
}

// ─── Admin book list ──────────────────────────────────────────────────────────

export async function getAdminBooks({
  page = 1,
  status,
  query,
}: { page?: number; status?: string; query?: string } = {}) {
  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [isNull(books.deletedAt)];
  if (status) conditions.push(eq(books.status, status as "draft"));
  if (query) {
    conditions.push(
      sql`${books.searchVector} @@ websearch_to_tsquery('simple', ${query})`,
    );
  }

  const [totalResult, rows] = await Promise.all([
    db
      .select({ count: count() })
      .from(books)
      .where(and(...conditions)),
    db.query.books.findMany({
      where: and(...conditions),
      orderBy: [desc(books.updatedAt)],
      limit: PAGE_SIZE,
      offset,
      with: {
        category: { columns: { id: true, name: true } },
        pdfAsset: { columns: { id: true, sizeBytes: true } },
        coverAsset: { columns: { publicUrl: true, altText: true } },
      },
    }),
  ]);

  return {
    books: rows,
    total: totalResult[0]?.count ?? 0,
    page,
    totalPages: Math.ceil((totalResult[0]?.count ?? 0) / PAGE_SIZE),
  };
}

// ─── Admin scholar list ───────────────────────────────────────────────────────

export async function getAdminScholars({
  page = 1,
  query,
}: { page?: number; query?: string } = {}) {
  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [isNull(scholars.deletedAt)];
  if (query) {
    conditions.push(
      sql`${scholars.searchVector} @@ websearch_to_tsquery('simple', ${query})`,
    );
  }

  const [totalResult, rows] = await Promise.all([
    db
      .select({ count: count() })
      .from(scholars)
      .where(and(...conditions)),
    db.query.scholars.findMany({
      where: and(...conditions),
      orderBy: [desc(scholars.updatedAt)],
      limit: PAGE_SIZE,
      offset,
      with: {
        avatarAsset: { columns: { publicUrl: true, altText: true } },
      },
    }),
  ]);

  return {
    scholars: rows,
    total: totalResult[0]?.count ?? 0,
    page,
    totalPages: Math.ceil((totalResult[0]?.count ?? 0) / PAGE_SIZE),
  };
}

// ─── Admin user list (super_admin only) ──────────────────────────────────────

export async function getAdminUsers({ page = 1 }: { page?: number } = {}) {
  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  const where = isNull(user.deletedAt);

  const [totalResult, rows] = await Promise.all([
    db.select({ count: count() }).from(user).where(where),
    db.query.user.findMany({
      where,
      orderBy: [desc(user.createdAt)],
      limit: PAGE_SIZE,
      offset,
      with: {
        userRoles: {
          with: { role: { columns: { slug: true, label: true } } },
        },
      },
      columns: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    users: rows,
    total: totalResult[0]?.count ?? 0,
    page,
    totalPages: Math.ceil((totalResult[0]?.count ?? 0) / PAGE_SIZE),
  };
}
