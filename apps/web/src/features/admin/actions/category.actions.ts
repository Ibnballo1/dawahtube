// src/features/admin/actions/category.actions.ts
"use server";

import { db } from "@core/database/client";
import {
  lectureCategories,
  articleCategories,
  bookCategories,
} from "@core/database/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { requirePermission } from "@core/auth/guard";
import { PERMISSIONS } from "@core/auth/permissions";
import { writeAuditLog } from "@core/audit/logger";
import { nanoid } from "nanoid";
import { z } from "zod";
import type { ActionResult } from "../types/admin.types";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

const updateCategorySchema = categorySchema.partial().extend({
  id: z.string().min(1),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

type CategoryType = "lecture" | "article" | "book";

// ─── Helper: get the right table ──────────────────────────────────────────────

function getTable(type: CategoryType) {
  switch (type) {
    case "lecture":
      return lectureCategories;
    case "article":
      return articleCategories;
    case "book":
      return bookCategories;
  }
}

function getCacheTag(type: CategoryType) {
  return `${type}-categories`;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createCategory(
  type: CategoryType,
  input: CategoryInput,
): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.LECTURE_CREATE); // any editor can manage categories

  const data = categorySchema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const table = getTable(type);
  const id = `cat_${nanoid(16)}`;

  // Generate slug from name
  const slug = data.data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  await db.insert(table).values({
    id,
    slug,
    name: data.data.name,
    description: data.data.description ?? null,
    position: data.data.position,
    isActive: data.data.isActive,
  });

  await writeAuditLog({
    action: "create",
    entity: `${type}_category`,
    entityId: id,
    after: { id, slug, name: data.data.name },
  });

  revalidateTag(getCacheTag(type), "create");
  revalidateTag("admin-stats", "create");

  return { ok: true, data: { id } };
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateCategory(
  type: CategoryType,
  input: UpdateCategoryInput,
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.LECTURE_EDIT);

  const data = updateCategorySchema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { id, ...rest } = data.data;
  const table = getTable(type);

  await db
    .update(table)
    .set({ ...rest, updatedAt: new Date() })
    .where(eq(table.id, id));

  await writeAuditLog({
    action: "update",
    entity: `${type}_category`,
    entityId: id,
  });
  revalidateTag(getCacheTag(type), "update");

  return { ok: true };
}

// ─── Toggle active ────────────────────────────────────────────────────────────

export async function toggleCategoryActive(
  type: CategoryType,
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.LECTURE_EDIT);

  const table = getTable(type);

  await db
    .update(table)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(table.id, id));

  await writeAuditLog({
    action: "update",
    entity: `${type}_category`,
    entityId: id,
    after: { isActive },
  });

  revalidateTag(getCacheTag(type), "update");

  return { ok: true };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteCategory(
  type: CategoryType,
  id: string,
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.LECTURE_DELETE);

  const table = getTable(type);

  // Hard delete — categories have no content of their own
  // Content that referenced this category will have categoryId set to null
  // via the ON DELETE SET NULL foreign key constraint
  await db.delete(table).where(eq(table.id, id));

  await writeAuditLog({
    action: "delete",
    entity: `${type}_category`,
    entityId: id,
  });
  revalidateTag(getCacheTag(type), "delete");

  return { ok: true };
}

// ─── Reorder ──────────────────────────────────────────────────────────────────

export async function reorderCategories(
  type: CategoryType,
  orders: Array<{ id: string; position: number }>,
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.LECTURE_EDIT);

  const table = getTable(type);

  // Update positions in parallel
  await Promise.all(
    orders.map(({ id, position }) =>
      db
        .update(table)
        .set({ position, updatedAt: new Date() })
        .where(eq(table.id, id)),
    ),
  );

  revalidateTag(getCacheTag(type), "update");

  return { ok: true };
}
