// src/features/admin/actions/content.actions.ts
"use server";

import { db } from "@core/database/client";
import {
  lectures,
  articles,
  books,
  scholars,
  reminders,
} from "@core/database/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { PERMISSIONS } from "@core/auth/permissions";
import { requirePermission } from "@core/auth/guard";
import { writeAuditLog } from "@core/audit/logger";
import { generateUniqueSlug } from "@shared/lib/slug";
import { nanoid } from "nanoid";
import {
  createLectureSchema,
  updateLectureSchema,
  type CreateLectureInput,
  type UpdateLectureInput,
} from "@features/lectures/schemas/lecture.schemas";
import {
  createScholarSchema,
  updateScholarSchema,
} from "@features/scholars/schemas/scholar.schemas";
import {
  createArticleSchema,
  updateArticleSchema,
  calculateContentMetadata,
} from "@features/articles/schemas/article.schemas";
import {
  createBookSchema,
  updateBookSchema,
} from "@features/library/schemas/library.schemas";
import type { ActionResult } from "../types/admin.types";
import z from "zod";

// ═══════════════════════════════════════════════════════════════════════════
// LECTURES
// ═══════════════════════════════════════════════════════════════════════════

export async function createLecture(
  input: CreateLectureInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  await requirePermission(PERMISSIONS.LECTURE_CREATE);

  const data = createLectureSchema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const slug = await generateUniqueSlug({
    table: "lectures",
    value: data.data.title,
  });
  const id = `lec_${nanoid(16)}`;

  await db.insert(lectures).values({
    id,
    slug,
    canonicalSlug: slug,
    ...data.data,
  });

  await writeAuditLog({
    action: "create",
    entity: "lecture",
    entityId: id,
    after: { id, slug },
  });
  revalidateTag("lectures", "max");
  revalidateTag("homepage-featured", "max");

  return { ok: true, data: { id, slug } };
}

export async function updateLecture(
  input: UpdateLectureInput,
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.LECTURE_EDIT);

  const data = updateLectureSchema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { id, tagIds: _tags, ...rest } = data.data;

  const [before] = await db
    .select()
    .from(lectures)
    .where(eq(lectures.id, id))
    .limit(1);

  await db
    .update(lectures)
    .set({ ...rest, updatedAt: new Date() })
    .where(eq(lectures.id, id));

  await writeAuditLog({
    action: "update",
    entity: "lecture",
    entityId: id,
    before: before as Record<string, unknown>,
    after: rest as Record<string, unknown>,
  });
  revalidateTag(`lecture-${before?.slug}`, "max");
  revalidateTag("lectures", "max");

  return { ok: true };
}

export async function publishLecture(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.LECTURE_PUBLISH);

  await db
    .update(lectures)
    .set({
      status: "published",
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(lectures.id, id));

  const row = await db.query.lectures.findFirst({
    where: eq(lectures.id, id),
    columns: { slug: true },
  });

  await writeAuditLog({ action: "publish", entity: "lecture", entityId: id });
  revalidateTag(`lecture-${row?.slug}`, "max");
  revalidateTag("lectures", "max");
  revalidateTag("homepage-featured", "max");
  revalidateTag("admin-stats", "max");

  return { ok: true };
}

export async function unpublishLecture(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.LECTURE_PUBLISH);

  await db
    .update(lectures)
    .set({ status: "draft", updatedAt: new Date() })
    .where(eq(lectures.id, id));

  const row = await db.query.lectures.findFirst({
    where: eq(lectures.id, id),
    columns: { slug: true },
  });

  await writeAuditLog({ action: "unpublish", entity: "lecture", entityId: id });
  revalidateTag(`lecture-${row?.slug}`, "max");
  revalidateTag("lectures", "max");
  revalidateTag("homepage-featured", "max");

  return { ok: true };
}

export async function deleteLecture(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.LECTURE_DELETE);

  const row = await db.query.lectures.findFirst({
    where: eq(lectures.id, id),
    columns: { slug: true },
  });

  // Soft delete only — hard delete never happens in production
  await db
    .update(lectures)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(lectures.id, id));

  await writeAuditLog({ action: "delete", entity: "lecture", entityId: id });
  revalidateTag(`lecture-${row?.slug}`, "max");
  revalidateTag("lectures", "max");
  revalidateTag("homepage-featured", "max");
  revalidateTag("admin-stats", "max");

  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCHOLARS
// ═══════════════════════════════════════════════════════════════════════════

export async function createScholar(
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  await requirePermission(PERMISSIONS.SCHOLAR_CREATE);

  const data = createScholarSchema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const slug = await generateUniqueSlug({
    table: "scholars",
    value: data.data.name,
  });
  const id = `sch_${nanoid(16)}`;

  await db
    .insert(scholars)
    .values({ id, slug, canonicalSlug: slug, ...data.data });

  await writeAuditLog({ action: "create", entity: "scholar", entityId: id });
  revalidateTag("scholars", "max");
  revalidateTag("homepage-featured", "max");

  return { ok: true, data: { id, slug } };
}

export async function updateScholar(input: unknown): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.SCHOLAR_EDIT);

  const data = updateScholarSchema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { id, ...rest } = data.data;

  const [before] = await db
    .select()
    .from(scholars)
    .where(eq(scholars.id, id))
    .limit(1);

  await db
    .update(scholars)
    .set({ ...rest, updatedAt: new Date() })
    .where(eq(scholars.id, id));

  await writeAuditLog({
    action: "update",
    entity: "scholar",
    entityId: id,
    before: before as Record<string, unknown>,
  });
  revalidateTag(`scholar-${before?.slug}`, "max");
  revalidateTag("scholars", "max");

  return { ok: true };
}

export async function deleteScholar(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.SCHOLAR_DELETE);

  await db
    .update(scholars)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(scholars.id, id));

  await writeAuditLog({ action: "delete", entity: "scholar", entityId: id });
  revalidateTag("scholars", "max");
  revalidateTag("homepage-featured", "max");
  revalidateTag("admin-stats", "max");

  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// ARTICLES
// ═══════════════════════════════════════════════════════════════════════════

export async function createArticle(
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  await requirePermission(PERMISSIONS.ARTICLE_CREATE);

  const data = createArticleSchema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const slug = await generateUniqueSlug({
    table: "articles",
    value: data.data.title!,
  });
  const id = `art_${nanoid(16)}`;

  // Calculate word count + reading time from MDX content
  const meta = data.data.content
    ? calculateContentMetadata(data.data.content)
    : { wordCount: 0, readingTimeMins: 1 };

  const { tagIds: _tags, ...rest } = data.data;

  await db.insert(articles).values({
    id,
    slug,
    canonicalSlug: slug,
    ...rest,
    ...meta,
  });

  await writeAuditLog({ action: "create", entity: "article", entityId: id });
  revalidateTag("articles", "max");

  return { ok: true, data: { id, slug } };
}

export async function updateArticle(input: unknown): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.ARTICLE_EDIT);

  const data = updateArticleSchema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { id, tagIds: _tags, content, ...rest } = data.data;

  const meta = content ? calculateContentMetadata(content) : {};

  const [before] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);

  await db
    .update(articles)
    .set({
      ...rest,
      ...(content !== undefined && { content }),
      ...meta,
      updatedAt: new Date(),
    })
    .where(eq(articles.id, id));

  await writeAuditLog({
    action: "update",
    entity: "article",
    entityId: id,
    before: before as Record<string, unknown>,
  });
  revalidateTag(`article-${before?.slug}`, "max");
  revalidateTag("articles", "max");

  return { ok: true };
}

export async function publishArticle(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.ARTICLE_PUBLISH);

  await db
    .update(articles)
    .set({
      status: "published",
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(articles.id, id));

  const row = await db.query.articles.findFirst({
    where: eq(articles.id, id),
    columns: { slug: true },
  });

  await writeAuditLog({ action: "publish", entity: "article", entityId: id });
  revalidateTag(`article-${row?.slug}`, "max");
  revalidateTag("articles", "max");
  revalidateTag("homepage-featured", "max");
  revalidateTag("admin-stats", "max");

  return { ok: true };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.ARTICLE_DELETE);

  const row = await db.query.articles.findFirst({
    where: eq(articles.id, id),
    columns: { slug: true },
  });

  await db
    .update(articles)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(articles.id, id));

  await writeAuditLog({ action: "delete", entity: "article", entityId: id });
  revalidateTag(`article-${row?.slug}`, "max");
  revalidateTag("articles", "max");
  revalidateTag("admin-stats", "max");

  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOKS
// ═══════════════════════════════════════════════════════════════════════════

export async function createBook(
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  await requirePermission(PERMISSIONS.BOOK_CREATE);

  const data = createBookSchema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const slug = await generateUniqueSlug({
    table: "books",
    value: data.data.title,
  });
  const id = `bk_${nanoid(16)}`;

  const { tagIds: _tags, ...rest } = data.data;

  await db.insert(books).values({ id, slug, canonicalSlug: slug, ...rest });

  await writeAuditLog({ action: "create", entity: "book", entityId: id });
  revalidateTag("books", "max");

  return { ok: true, data: { id, slug } };
}

export async function updateBook(input: unknown): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.BOOK_EDIT);

  const data = updateBookSchema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { id, tagIds: _tags, ...rest } = data.data;

  const [before] = await db
    .select()
    .from(books)
    .where(eq(books.id, id))
    .limit(1);

  await db
    .update(books)
    .set({ ...rest, updatedAt: new Date() })
    .where(eq(books.id, id));

  await writeAuditLog({
    action: "update",
    entity: "book",
    entityId: id,
    before: before as Record<string, unknown>,
  });
  revalidateTag(`book-${before?.slug}`, "max");
  revalidateTag("books", "max");

  return { ok: true };
}

export async function publishBook(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.BOOK_PUBLISH);

  await db
    .update(books)
    .set({
      status: "published",
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(books.id, id));

  const row = await db.query.books.findFirst({
    where: eq(books.id, id),
    columns: { slug: true },
  });

  await writeAuditLog({ action: "publish", entity: "book", entityId: id });
  revalidateTag(`book-${row?.slug}`, "max");
  revalidateTag("books", "max");
  revalidateTag("homepage-featured", "max");
  revalidateTag("admin-stats", "max");

  return { ok: true };
}

export async function deleteBook(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.BOOK_DELETE);

  const row = await db.query.books.findFirst({
    where: eq(books.id, id),
    columns: { slug: true },
  });

  await db
    .update(books)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(books.id, id));

  await writeAuditLog({ action: "delete", entity: "book", entityId: id });
  revalidateTag(`book-${row?.slug}`, "max");
  revalidateTag("books", "max");
  revalidateTag("admin-stats", "max");

  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// REMINDERS
// ═══════════════════════════════════════════════════════════════════════════

const createReminderSchema = z.object({
  title: z.string().min(2).max(255),
  content: z.string().max(10_000).optional(),
  source: z.string().max(255).optional(),
  scholarId: z.string().optional(),
  status: z.enum(["draft", "review", "published", "archived"]).default("draft"),
});

const updateReminderSchema = createReminderSchema.partial().extend({
  id: z.string().min(1),
});

export async function createReminder(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.REMINDER_CREATE);

  const data = createReminderSchema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const id = `rem_${nanoid(16)}`;

  await db.insert(reminders).values({
    id,
    ...data.data,
    content: data.data.content ?? "",
  });

  await writeAuditLog({ action: "create", entity: "reminder", entityId: id });
  revalidateTag("homepage-featured", "max");

  return { ok: true, data: { id } };
}

export async function updateReminder(input: unknown): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.REMINDER_EDIT);

  const data = updateReminderSchema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { id, ...rest } = data.data;

  await db
    .update(reminders)
    .set({ ...rest, updatedAt: new Date() })
    .where(eq(reminders.id, id));

  await writeAuditLog({ action: "update", entity: "reminder", entityId: id });
  revalidateTag("daily-reminder", "max");
  revalidateTag("homepage-featured", "max");

  return { ok: true };
}

export async function publishReminder(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.REMINDER_EDIT);

  await db
    .update(reminders)
    .set({
      status: "published",
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(reminders.id, id));

  await writeAuditLog({ action: "publish", entity: "reminder", entityId: id });
  revalidateTag("daily-reminder", "max");
  revalidateTag("homepage-featured", "max");

  return { ok: true };
}

export async function deleteReminder(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.REMINDER_DELETE);

  await db
    .update(reminders)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(reminders.id, id));

  await writeAuditLog({ action: "delete", entity: "reminder", entityId: id });
  revalidateTag("homepage-featured", "max");

  return { ok: true };
}
