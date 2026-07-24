// src/app/(admin)/layout.tsx
//
// Root layout for all /admin/* routes.
// RBAC check runs here once — all child pages inherit protection.
// Renders a two-column shell: sidebar + main content area.

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import auth from "@core/auth/config";
import { getUserPermissions } from "@core/auth/guard";
import { PERMISSIONS } from "@core/auth/permissions";
import { AdminSidebar } from "@features/admin/components/client/AdminSidebar";

// Roles that may access any part of the admin area at all
const ADMIN_ROLES = new Set(["super_admin", "admin", "editor"]);

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── 1. Authentication check ───────────────────────────────────────────────
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  if (!session?.user) {
    redirect("/sign-in?redirect=/admin");
  }

  // ── 2. Role check ─────────────────────────────────────────────────────────
  const role = session.user.role as string | undefined;
  if (!role || !ADMIN_ROLES.has(role)) {
    redirect("/403");
  }

  // ── 3. Load user permissions (passed to sidebar for conditional nav) ──────
  const permissions = await getUserPermissions(session.user.id);

  const adminUser = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: role,
    permissions,
    initials: session.user.name
      .split(" ")
      .slice(0, 2)
      .map((w: string) => w[0]?.toUpperCase() ?? "")
      .join(""),
  };

  return (
    <div className="min-h-screen bg-surface-subtle flex">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <AdminSidebar user={adminUser} />

      {/* ── Main content ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <main id="main-content" className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
