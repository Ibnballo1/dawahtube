// src/features/admin/actions/featured.actions.ts
"use server";

import { db } from "@core/database/client";
import { featuredSlots } from "@core/database/schema";
import { eq, and } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { requirePermission } from "@core/auth/guard";
import { PERMISSIONS } from "@core/auth/permissions";
import { writeAuditLog } from "@core/audit/logger";
import { nanoid } from "nanoid";
import { z } from "zod";
import type { ActionResult } from "../types/admin.types";

// ─── Set a featured slot ───────────────────────────────────────────────────────

const setFeaturedSlotSchema = z.object({
  slotKey: z.string().min(1),
  entityType: z.enum(["lecture", "article", "book", "scholar", "reminder"]),
  entityId: z.string().min(1),
  position: z.number().int().min(0).default(0),
  validUntil: z.coerce.date().optional(),
});

export async function setFeaturedSlot(
  input: z.infer<typeof setFeaturedSlotSchema>,
): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.FEATURED_MANAGE);

  const data = setFeaturedSlotSchema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { slotKey, entityType, entityId, position, validUntil } = data.data;

  // Check if a slot already exists for this key+position combination
  const existing = await db.query.featuredSlots.findFirst({
    where: and(
      eq(featuredSlots.slotKey, slotKey),
      eq(featuredSlots.position, position),
    ),
  });

  let id: string;

  if (existing) {
    // Update existing slot
    id = existing.id;
    await db
      .update(featuredSlots)
      .set({
        entityType,
        entityId,
        isActive: true,
        validUntil: validUntil ?? null,
        updatedAt: new Date(),
      })
      .where(eq(featuredSlots.id, existing.id));
  } else {
    // Create new slot entry
    id = `fs_${nanoid(16)}`;
    await db.insert(featuredSlots).values({
      id,
      slotKey,
      entityType,
      entityId,
      position,
      isActive: true,
      validUntil: validUntil ?? null,
    });
  }

  await writeAuditLog({
    action: "update",
    entity: "featured_slot",
    entityId: id,
    after: { slotKey, entityType, entityId, position },
  });

  // Revalidate all homepage cache tags affected by featured slot changes
  revalidateTag("homepage-featured", "max");
  revalidateTag(`featured-${slotKey}`, "max");
  revalidateTag("hero-lecture", "max");
  revalidateTag("featured-lectures", "max");
  revalidateTag("featured-scholars", "max");
  revalidateTag("featured-articles", "max");
  revalidateTag("library-highlights", "max");
  revalidateTag("daily-reminder", "max");

  return { ok: true, data: { id } };
}

// ─── Remove a featured slot ────────────────────────────────────────────────────

export async function removeFeaturedSlot(
  slotId: string,
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.FEATURED_MANAGE);

  const slot = await db.query.featuredSlots.findFirst({
    where: eq(featuredSlots.id, slotId),
  });

  if (!slot) return { ok: false, error: "Slot not found" };

  // Deactivate rather than hard-delete — preserves audit trail
  await db
    .update(featuredSlots)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(featuredSlots.id, slotId));

  await writeAuditLog({
    action: "delete",
    entity: "featured_slot",
    entityId: slotId,
    before: { slotKey: slot.slotKey, entityId: slot.entityId },
  });

  revalidateTag("homepage-featured", "max");
  revalidateTag(`featured-${slot.slotKey}`, "max");

  return { ok: true };
}
