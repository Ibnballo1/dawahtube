// src/features/admin/actions/featured.ts
"use server";
import { requirePermission, PERMISSIONS } from "@core/auth/permissions";
import { db } from "@core/database/client";
import { featuredSlots } from "@core/database/schema";
import { revalidateTag } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const setFeaturedSchema = z.object({
  slotKey: z.string(),
  entityType: z.enum(["lecture", "article", "book", "scholar", "reminder"]),
  entityId: z.string().uuid(),
  position: z.number().int().min(0).max(20),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
});

export async function setFeaturedSlot(
  input: z.infer<typeof setFeaturedSchema>,
) {
  await requirePermission(PERMISSIONS.FEATURED_MANAGE);
  const data = setFeaturedSchema.parse(input);

  await db
    .insert(featuredSlots)
    .values({
      slotKey: data.slotKey,
      entityType: data.entityType,
      entityId: data.entityId,
      position: data.position,
      active: true,
      validFrom: data.validFrom ?? new Date(),
      validUntil: data.validUntil ?? null,
    })
    .onConflictDoUpdate({
      target: [featuredSlots.slotKey, featuredSlots.position],
      set: { entityId: data.entityId, updatedAt: new Date() },
    });

  // Invalidate homepage cache
  revalidateTag("homepage-featured");
  revalidateTag(`featured-${data.slotKey}`);
}
