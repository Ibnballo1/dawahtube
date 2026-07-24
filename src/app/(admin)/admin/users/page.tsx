// src/app/(admin)/admin/users/page.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import auth from "@core/auth/config";
import { getAdminUsers } from "@features/admin/queries/admin.queries";
import { AdminPagination } from "../lectures/page";
import { Badge } from "@shared/components/ui/badge";
import { formatDate } from "@shared/lib/format";
import { AssignRoleButton } from "@features/admin/components/client/AssignRoleButton";

export const metadata: Metadata = { title: "Manage Users" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

type AssignableRole = "reader" | "admin" | "super_admin" | "editor";

export default async function AdminUsersPage({ searchParams }: PageProps) {
  // Extra check: only super_admin can view user management
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);
  const role = session?.user?.role as string | undefined;

  if (role !== "super_admin") {
    redirect("/admin");
  }

  const params = await searchParams;
  const result = await getAdminUsers({
    page: params.page ? parseInt(params.page, 10) : 1,
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-primary">
          Users
        </h1>
        <p className="text-ink-muted text-sm mt-0.5">
          {result.total} registered · Manage roles and permissions
        </p>
      </div>

      <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-subtle">
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                User
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden sm:table-cell">
                Role
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden md:table-cell">
                Joined
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden lg:table-cell">
                Verified
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {result.users.map((user) => {
              const rawRole = user.userRoles?.[0]?.role?.slug;
              const currentRole: AssignableRole =
                rawRole === "reader" ||
                rawRole === "admin" ||
                rawRole === "super_admin" ||
                rawRole === "editor"
                  ? rawRole
                  : "reader";
              const isCurrentUser = user.id === session?.user?.id;

              return (
                <tr
                  key={user.id}
                  className="hover:bg-surface-subtle transition-colors"
                >
                  {/* Name + email */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-ink-primary">
                        {user.name}
                        {isCurrentUser && (
                          <span className="ml-2 text-[10px] text-ink-muted font-normal">
                            (you)
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-ink-muted">
                        {user.email}
                      </span>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <RoleBadge role={currentRole} />
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-3 text-xs text-ink-muted hidden md:table-cell">
                    {formatDate(user.createdAt)}
                  </td>

                  {/* Email verified */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {user.emailVerified ? (
                      <Badge variant="success" size="sm">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm">
                        Unverified
                      </Badge>
                    )}
                  </td>

                  {/* Role assignment */}
                  <td className="px-4 py-3 text-right">
                    {!isCurrentUser && (
                      <AssignRoleButton
                        userId={user.id}
                        currentRole={currentRole}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {result.totalPages > 1 && (
        <AdminPagination page={result.page} totalPages={result.totalPages} />
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const config: Record<
    string,
    { variant: "gold" | "primary" | "default"; label: string }
  > = {
    super_admin: { variant: "gold", label: "Super Admin" },
    admin: { variant: "primary", label: "Admin" },
    editor: { variant: "default", label: "Editor" },
    reader: { variant: "default", label: "Reader" },
  };
  const { variant, label } = config[role] ?? {
    variant: "default",
    label: role,
  };
  return (
    <Badge variant={variant} size="sm">
      {label}
    </Badge>
  );
}
