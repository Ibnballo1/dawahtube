// src/app/(admin)/layout.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import auth from "@core/auth/config";
import { getUserPermissions } from "@core/auth/guard";
import { AdminSidebar } from "@features/admin/components/client/AdminSidebar";

// Roles that may access any part of the admin area
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

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w: string) => w[0]?.toUpperCase() ?? "")
        .join("")
    : "A";

  const adminUser = {
    id: session.user.id,
    name: session.user.name ?? "Admin User",
    email: session.user.email,
    role: role,
    permissions,
    initials: initials || "A",
  };

  return (
    <div className="min-h-screen bg-surface-subtle flex">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <AdminSidebar user={adminUser} />

      {/* ── Main content ────────────────────────────────────────────── */}
      {/* pt-14 on small screens reserves space for the fixed mobile menu toggle */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 pt-14 lg:pt-0">
        <main id="main-content" className="flex-1 p-6 lg:p-8" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
