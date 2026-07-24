// src/features/admin/actions/user.actions.ts
"use server";

import { db } from "@core/database/client";
import { user } from "@core/database/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { requirePermission } from "@core/auth/guard";
import { PERMISSIONS } from "@core/auth/permissions";
import { writeAuditLog } from "@core/audit/logger";
import { z } from "zod";
import type { ActionResult } from "../types/admin.types";

const assignRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["reader", "editor", "admin", "super_admin"]),
});

export async function assignUserRole(
  input: z.infer<typeof assignRoleSchema>,
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.USER_MANAGE);

  const data = assignRoleSchema.safeParse(input);
  if (!data.success) {
    return { ok: false, error: "Invalid input" };
  }

  const { userId, role } = data.data;

  const [existing] = await db
    .select({ id: user.id, role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!existing) return { ok: false, error: "User not found" };

  // Update the denormalised role column BetterAuth reads at session time
  await db
    .update(user)
    .set({ role: role, updatedAt: new Date() })
    .where(eq(user.id, userId));

  await writeAuditLog({
    action: "update",
    entity: "user",
    entityId: userId,
    before: { role: existing.role },
    after: { role },
  });

  revalidateTag("admin-stats", "max");

  return { ok: true };
}
