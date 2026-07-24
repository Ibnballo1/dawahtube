// src/core/auth/guard.ts — use in Server Actions and Route Handlers
"use server";

import auth from "./config";
import { db } from "@core/database/client";
import { userRoles, rolePermissions } from "@core/database/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_ROLES, type Permission } from "./permissions";
import { getCurrentUser } from "./server";
import { headers } from "next/headers";

// export async function requirePermission(permission: Permission): Promise<void> {
//   const session = await auth.api.getSession();
//   if (!session?.user) throw new Error("UNAUTHENTICATED");

//   const permissions = await getUserPermissions(session.user.id);
//   if (!permissions.includes(permission)) throw new Error("FORBIDDEN");
// }

export async function requirePermission(permission: Permission) {
  // 1. Get the current active session on the server
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  if (!session?.user) {
    throw new Error("Authentication required");
  }

  const userRole = session.user.role ?? "reader";

  // 2. Resolve the permissions associated with this role
  const roleConfig = DEFAULT_ROLES[userRole];
  const userPermissions: Permission[] = roleConfig
    ? roleConfig.permissions
    : [];

  // 3. Verify the permission exists in the user's permitted list
  if (!userPermissions.includes(permission)) {
    throw new Error("Insufficient permissions");
  }
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

// ─── requireRole ──────────────────────────────────────────────────────────────
// Simpler check when you just need a specific role, not a permission.

export async function requireRole(...allowedRoles: string[]): Promise<void> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED: You must be signed in.");
  }

  const role = (user as { role?: string }).role ?? "reader";

  if (!allowedRoles.includes(role)) {
    throw new Error(
      `FORBIDDEN: This action requires one of: ${allowedRoles.join(", ")}.`,
    );
  }
}
