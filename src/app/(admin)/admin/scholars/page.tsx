// src/app/(admin)/admin/scholars/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getAdminScholars } from "@features/admin/queries/admin.queries";
import { deleteScholar } from "@features/admin/actions/content.actions";
import { DeleteButton } from "@features/admin/components/client/ContentRowActions";
import { AdminFilters, AdminPagination } from "../lectures/page";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { formatScholarName, formatCount } from "@shared/lib/format";

export const metadata: Metadata = { title: "Manage Scholars" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function AdminScholarsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const result = await getAdminScholars({
    page: params.page ? parseInt(params.page, 10) : 1,
    ...(params.q ? { query: params.q } : {}),
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary">
            Scholars
          </h1>
          <p className="text-ink-muted text-sm mt-0.5">{result.total} total</p>
        </div>
        <Button>
          <Link href="/admin/scholars/new">
            <PlusIcon /> New scholar
          </Link>
        </Button>
      </div>

      {/* Search */}
      <AdminFilters statusOptions={[]} />

      {/* Table */}
      {result.scholars.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-4 text-center bg-surface-card border border-border-default rounded-xl">
          <p className="text-ink-muted text-sm">No scholars yet.</p>
          <Button size="sm">
            <Link href="/admin/scholars/new">Add first scholar</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-subtle">
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Scholar
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden sm:table-cell">
                  Nationality
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden md:table-cell">
                  Content
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {result.scholars.map((scholar) => {
                const displayName = formatScholarName(
                  scholar.honorifics ?? null,
                  scholar.name,
                );
                return (
                  <tr
                    key={scholar.id}
                    className="hover:bg-surface-subtle transition-colors"
                  >
                    {/* Name + avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-8 rounded-full overflow-hidden bg-primary-100 shrink-0">
                          {scholar.avatarAsset?.publicUrl ? (
                            <Image
                              src={scholar.avatarAsset.publicUrl}
                              alt={displayName}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-primary-700 flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {scholar.name[0]?.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <Link
                            href={`/admin/scholars/${scholar.id}`}
                            className="font-medium text-ink-primary hover:text-primary-700 transition-colors"
                          >
                            {displayName}
                          </Link>
                          {scholar.arabicName && (
                            <span
                              className="text-xs text-ink-muted font-arabic"
                              dir="rtl"
                            >
                              {scholar.arabicName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Nationality */}
                    <td className="px-4 py-3 text-ink-tertiary text-xs hidden sm:table-cell">
                      {scholar.nationality ?? "—"}
                    </td>

                    {/* Content counts */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex gap-2 text-xs text-ink-muted">
                        <span>
                          {formatCount(scholar.lectureCount)} lectures
                        </span>
                        <span>·</span>
                        <span>
                          {formatCount(scholar.articleCount)} articles
                        </span>
                      </div>
                    </td>

                    {/* Active status */}
                    <td className="px-4 py-3">
                      <Badge
                        variant={scholar.isActive ? "success" : "default"}
                        size="sm"
                      >
                        {scholar.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm">
                          <Link
                            href={`/admin/scholars/${scholar.id}`}
                            aria-label={`Edit ${displayName}`}
                          >
                            <EditIcon />
                          </Link>
                        </Button>
                        <DeleteButton
                          id={scholar.id}
                          title={displayName}
                          onDelete={deleteScholar}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {result.totalPages > 1 && (
        <AdminPagination page={result.page} totalPages={result.totalPages} />
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
