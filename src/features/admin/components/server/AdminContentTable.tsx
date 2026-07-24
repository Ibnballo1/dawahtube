// src/features/admin/components/server/AdminContentTable.tsx
//
// Reusable shell used by all five content listing pages.
// Renders a table with consistent columns, status badges, and action slots.
// Row actions (publish, delete) are wired in each page via the `actions` prop.

import Link from "next/link";
import { StatusBadge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { formatDate, formatRelativeDate } from "@shared/lib/format";
import type { ContentStatus } from "@core/database/types";

export interface ContentTableRow {
  id: string;
  title: string;
  status: string;
  updatedAt: Date;
  extra?: React.ReactNode; // e.g. scholar name, category
  editHref: string;
  actions?: React.ReactNode; // publish / delete buttons
}

interface AdminContentTableProps {
  rows: ContentTableRow[];
  emptyLabel: string;
  newHref: string;
  newLabel: string;
}

export function AdminContentTable({
  rows,
  emptyLabel,
  newHref,
  newLabel,
}: AdminContentTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 gap-4 text-center bg-surface-card border border-border-default rounded-xl">
        <p className="text-ink-muted text-sm">{emptyLabel}</p>
        <Button size="sm">
          <Link href={newHref}>{newLabel}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-subtle">
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Title
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden md:table-cell">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden lg:table-cell">
                Updated
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-surface-subtle transition-colors group"
              >
                {/* Title + extra */}
                <td className="px-4 py-3 max-w-xs">
                  <div className="flex flex-col gap-0.5">
                    <Link
                      href={row.editHref}
                      className="font-medium text-ink-primary hover:text-primary-700 transition-colors line-clamp-1"
                    >
                      {row.title}
                    </Link>
                    {row.extra && (
                      <span className="text-xs text-ink-muted">
                        {row.extra}
                      </span>
                    )}
                    {/* Show status on mobile */}
                    <span className="md:hidden mt-1">
                      <StatusBadge status={row.status as ContentStatus} />
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3 hidden md:table-cell">
                  <StatusBadge status={row.status as ContentStatus} />
                </td>

                {/* Updated */}
                <td className="px-4 py-3 text-xs text-ink-muted hidden lg:table-cell">
                  {formatRelativeDate(row.updatedAt)}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${row.title}`}
                    >
                      <Link href={row.editHref}>
                        <EditIcon />
                      </Link>
                    </Button>
                    {row.actions}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Shared row action buttons ────────────────────────────────────────────────
// These are client components — they call Server Actions and manage
// their own loading state. Imported by each content page.

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
