// src/core/auth/guard.ts — use in Server Actions and Route Handlers
import { auth } from "./config";
import { db } from "@core/database/client";
import { userRoles, rolePermissions } from "@core/database/schema";
import { eq } from "drizzle-orm";
import type { Permission } from "./permissions";

export async function requirePermission(permission: Permission): Promise<void> {
  const session = await auth.getSession();
  if (!session?.user) throw new Error("UNAUTHENTICATED");

  const permissions = await getUserPermissions(session.user.id);
  if (!permissions.includes(permission)) throw new Error("FORBIDDEN");
}

export async function getUserPermissions(
  userId: string,
): Promise<Permission[]> {
  const rows = await db
    .select({ permission: rolePermissions.permission })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .where(eq(userRoles.userId, userId));

  return rows.map((r) => r.permission as Permission);
}

// Usage in a Server Action:
// export async function publishLecture(id: string) {
//   await requirePermission(PERMISSIONS.LECTURE_PUBLISH)
//   ...
// }
