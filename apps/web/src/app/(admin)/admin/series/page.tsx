// src/app/(admin)/admin/series/page.tsx

import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { series } from "@core/database/schema";
import { isNull, desc } from "drizzle-orm";
import { Badge } from "@shared/components/ui/badge";
import { formatScholarName } from "@shared/lib/format";
import { DeleteSeriesButton } from "@features/admin/components/client/DeleteSeriesButton";
import { Plus, Pencil } from "lucide-react";

export const metadata: Metadata = {
  title: "Manage Series",
};

export const dynamic = "force-dynamic";

export default async function AdminSeriesPage() {
  const rows = await db.query.series.findMany({
    where: isNull(series.deletedAt),
    orderBy: [desc(series.createdAt)],
    with: {
      scholar: {
        columns: {
          id: true,
          name: true,
          honorifics: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary">
            Series
          </h1>

          <p className="text-ink-muted text-sm mt-0.5">
            {rows.length} total · Group lectures into ordered series
          </p>
        </div>

        <Link
          href="/admin/series/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        >
          <Plus className="size-4" aria-hidden="true" />
          New series
        </Link>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-4 text-center bg-surface-card border border-border-default rounded-xl">
          <p className="text-ink-muted text-sm">
            No series yet. Create one to group related lectures together.
          </p>

          <Link
            href="/admin/series/new"
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            Create first series
          </Link>
        </div>
      ) : (
        <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-subtle">
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Series
                </th>

                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden sm:table-cell">
                  Scholar
                </th>

                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden md:table-cell">
                  Lectures
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
              {rows.map((s) => {
                const isPublished = s.status === "published";

                return (
                  <tr
                    key={s.id}
                    className="hover:bg-surface-subtle transition-colors"
                  >
                    {/* Title */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <Link
                          href={`/admin/series/${s.id}`}
                          className="font-medium text-ink-primary hover:text-primary-700 transition-colors"
                        >
                          {s.title}
                        </Link>

                        {s.description && (
                          <span className="text-xs text-ink-muted line-clamp-1 max-w-xs">
                            {s.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Scholar */}
                    <td className="px-4 py-3 text-ink-tertiary text-sm hidden sm:table-cell">
                      {s.scholar
                        ? formatScholarName(
                            s.scholar.honorifics ?? null,
                            s.scholar.name,
                          )
                        : "—"}
                    </td>

                    {/* Lecture count */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-ink-secondary">
                        {s.itemCount} lectures
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge
                        variant={isPublished ? "success" : "default"}
                        size="sm"
                      >
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/series/${s.id}`}
                          aria-label={`Edit ${s.title}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-secondary hover:bg-surface-subtle hover:text-ink-primary transition-colors"
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Link>

                        <DeleteSeriesButton id={s.id} title={s.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
