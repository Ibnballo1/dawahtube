// src/features/admin/actions/series.actions.ts
"use server";

import { db } from "@core/database/client";
import { series, seriesItems } from "@core/database/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { requirePermission } from "@core/auth/guard";
import { PERMISSIONS } from "@core/auth/permissions";
import { writeAuditLog } from "@core/audit/logger";
import { nanoid } from "nanoid";
import { z } from "zod";
import type { ActionResult } from "../types/admin.types";

// ─────────────────────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────────────────────

const createSeriesSchema = z.object({
  title: z.string().min(2).max(255),
  description: z.string().max(2000).optional(),
  scholarId: z.string().optional(),
  coverAssetId: z.string().optional(),
});

const updateSeriesSchema = createSeriesSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateSeriesInput = z.infer<typeof createSeriesSchema>;
export type UpdateSeriesInput = z.infer<typeof updateSeriesSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Create series
// ─────────────────────────────────────────────────────────────────────────────

export async function createSeries(
  input: CreateSeriesInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  await requirePermission(PERMISSIONS.LECTURE_CREATE);

  const data = createSeriesSchema.safeParse(input);

  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const slug = data.data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const id = `ser_${nanoid(16)}`;

  // Check slug uniqueness
  const existing = await db.query.series.findFirst({
    where: eq(series.slug, slug),
    columns: { id: true },
  });

  const finalSlug = existing ? `${slug}-${nanoid(4)}` : slug;

  await db.insert(series).values({
    id,
    slug: finalSlug,
    title: data.data.title,
    description: data.data.description ?? null,
    scholarId: data.data.scholarId ?? null,
    coverAssetId: data.data.coverAssetId ?? null,

    // Your schema defines series as draft by default.
    // We can simply omit status and let the DB default apply.

    // Your schema uses itemCount, not lectureCount.
    itemCount: 0,
  });

  await writeAuditLog({
    action: "create",
    entity: "series",
    entityId: id,
    after: {
      id,
      slug: finalSlug,
      title: data.data.title,
    },
  });

  revalidateTag("series", "page");

  return {
    ok: true,
    data: {
      id,
      slug: finalSlug,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Update series
// ─────────────────────────────────────────────────────────────────────────────

export async function updateSeries(
  input: UpdateSeriesInput,
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.LECTURE_EDIT);

  const data = updateSeriesSchema.safeParse(input);

  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { id, ...rest } = data.data;

  await db
    .update(series)
    .set({
      ...rest,
      updatedAt: new Date(),
    })
    .where(eq(series.id, id));

  await writeAuditLog({
    action: "update",
    entity: "series",
    entityId: id,
  });

  revalidateTag("series", "page");
  revalidateTag(`series-${id}`, "page");

  return {
    ok: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete series
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteSeries(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.LECTURE_DELETE);

  /*
   * series_items has ON DELETE CASCADE for seriesId.
   *
   * Therefore we do NOT need to manually detach lectures.
   * Deleting/soft-deleting the series does not physically delete the series,
   * however, so we explicitly remove the series_items first.
   */

  await db.transaction(async (tx) => {
    await tx.delete(seriesItems).where(eq(seriesItems.seriesId, id));

    await tx
      .update(series)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(series.id, id));
  });

  await writeAuditLog({
    action: "delete",
    entity: "series",
    entityId: id,
  });

  revalidateTag("series", "page");
  revalidateTag(`series-${id}`, "page");

  return {
    ok: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Add lecture to series
// ─────────────────────────────────────────────────────────────────────────────

export async function addLectureToSeries(
  seriesId: string,
  lectureId: string,
  position: number,
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.LECTURE_EDIT);

  await db.transaction(async (tx) => {
    await tx.insert(seriesItems).values({
      id: `sitem_${nanoid(16)}`,
      seriesId,
      lectureId,
      position,
    });

    await syncSeriesItemCount(tx, seriesId);
  });

  await writeAuditLog({
    action: "update",
    entity: "lecture",
    entityId: lectureId,
    after: {
      seriesId,
      seriesPosition: position,
    },
  });

  revalidateTag(`series-${seriesId}`, "page");
  revalidateTag("series", "page");

  return {
    ok: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Remove lecture from series
// ─────────────────────────────────────────────────────────────────────────────

export async function removeLectureFromSeries(
  seriesId: string,
  lectureId: string,
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.LECTURE_EDIT);

  await db.transaction(async (tx) => {
    await tx
      .delete(seriesItems)
      .where(
        and(
          eq(seriesItems.seriesId, seriesId),
          eq(seriesItems.lectureId, lectureId),
        ),
      );

    await syncSeriesItemCount(tx, seriesId);
  });

  await writeAuditLog({
    action: "update",
    entity: "lecture",
    entityId: lectureId,
    after: {
      seriesId: null,
    },
  });

  revalidateTag(`series-${seriesId}`, "page");
  revalidateTag("series", "page");

  return {
    ok: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Reorder lectures in series
// ─────────────────────────────────────────────────────────────────────────────

export async function reorderSeriesLectures(
  seriesId: string,
  orders: Array<{
    lectureId: string;
    position: number;
  }>,
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.LECTURE_EDIT);

  await db.transaction(async (tx) => {
    for (const { lectureId, position } of orders) {
      await tx
        .update(seriesItems)
        .set({
          position,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(seriesItems.seriesId, seriesId),
            eq(seriesItems.lectureId, lectureId),
          ),
        );
    }
  });

  await writeAuditLog({
    action: "update",
    entity: "series",
    entityId: seriesId,
    after: {
      reorderedLectureCount: orders.length,
    },
  });

  revalidateTag(`series-${seriesId}`, "page");
  revalidateTag("series", "page");

  return {
    ok: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sync series item count
// ─────────────────────────────────────────────────────────────────────────────

async function syncSeriesItemCount(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  seriesId: string,
) {
  await tx
    .update(series)
    .set({
      itemCount: sql<number>`(
        SELECT COUNT(*)::int
        FROM series_items
        WHERE series_id = ${seriesId}
      )`,
      updatedAt: new Date(),
    })
    .where(eq(series.id, seriesId));
}
