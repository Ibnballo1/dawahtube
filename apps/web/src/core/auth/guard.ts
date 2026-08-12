// src/core/auth/guard.ts — use in Server Actions and Route Handlers
"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import auth from "./config";
import { db } from "@core/database/client";
import { userRoles, rolePermissions, user } from "@core/database/schema";
import { DEFAULT_ROLES, PERMISSIONS, type Permission } from "./permissions";
import { getCurrentUser } from "./server";

/**
 * Returns all permissions for a given user ID.
 * Bypasses database lookups for super_admin and falls back to DEFAULT_ROLES
 * if no custom database role permissions are found.
 */
export async function getUserPermissions(
  userId: string,
): Promise<Permission[]> {
  // 1. Fetch user role to handle super_admin and defaults
  const fetchUserRole = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: { role: true },
  });

  const userRole = fetchUserRole?.role ?? "reader";

  // 2. Super admins automatically receive all permissions
  if (userRole === "super_admin") {
    return Object.values(PERMISSIONS);
  }

  // 3. Query custom database role permissions
  const rows = await db
    .select({ permission: rolePermissions.permission })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .where(eq(userRoles.userId, userId));

  const dbPermissions = rows.map((r) => r.permission as Permission);

  // 4. Return DB permissions if present, otherwise fallback to DEFAULT_ROLES mapping
  if (dbPermissions.length > 0) {
    return dbPermissions;
  }

  const roleConfig = DEFAULT_ROLES[userRole];
  return roleConfig ? roleConfig.permissions : [];
}

/**
 * Asserts that the current session user has a given permission.
 */
export async function requirePermission(permission: Permission): Promise<void> {
  // 1. Get the current active session on the server
  const session = await auth.api.getSession({ headers: await headers() });
  // .catch(() => null);

  if (!session?.user) {
    throw new Error("Authentication required");
  }

  // 2. Resolve user permissions using the central handler
  const userPermissions = await getUserPermissions(session.user.id);

  // 3. Verify the permission exists in the user's permitted list
  if (!userPermissions.includes(permission)) {
    throw new Error("Insufficient permissions");
  }
}

/**
 * Asserts that the current session user has one of the allowed roles.
 */
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
