// src/app/(admin)/admin/lectures/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { getAdminLectures } from "@features/admin/queries/admin.queries";
import { AdminContentTable } from "@features/admin/components/server/AdminContentTable";
import {
  PublishButton,
  DeleteButton,
} from "@features/admin/components/client/ContentRowActions";
import {
  publishLecture,
  unpublishLecture,
  deleteLecture,
} from "@features/admin/actions/content.actions";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { formatScholarName } from "@shared/lib/format";

export const metadata: Metadata = { title: "Manage Lectures" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}

export default async function AdminLecturesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const result = await getAdminLectures({
    page: params.page ? parseInt(params.page, 10) : 1,
    ...(params.status ? { status: params.status } : {}),
    ...(params.q ? { query: params.q } : {}),
  });

  const rows = result.lectures.map((lecture) => ({
    id: lecture.id,
    title: lecture.title,
    status: lecture.status,
    updatedAt: lecture.updatedAt,
    editHref: `/admin/lectures/${lecture.id}`,
    extra: lecture.scholar
      ? formatScholarName(lecture.scholar.name, "")
      : undefined,
    actions: (
      <div className="flex items-center gap-1">
        <PublishButton
          id={lecture.id}
          status={lecture.status}
          onPublish={publishLecture}
          onUnpublish={unpublishLecture}
        />
        <DeleteButton
          id={lecture.id}
          title={lecture.title}
          onDelete={deleteLecture}
        />
      </div>
    ),
  }));

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary">
            Lectures
          </h1>
          <p className="text-ink-muted text-sm mt-0.5">
            {result.total} total ·{" "}
            {result.lectures.filter((l) => l.status === "published").length}{" "}
            published
          </p>
        </div>
        <Link
          href="/admin/lectures/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary-700 px-3 py-2 text-sm font-medium text-white hover:bg-primary-800 transition-colors"
        >
          <PlusIcon />
          New lecture
        </Link>
      </div>

      {/* Filters */}
      <AdminFilters statusOptions={STATUS_OPTIONS} />

      {/* Table */}
      <AdminContentTable
        rows={rows}
        emptyLabel="No lectures yet. Create your first lecture to get started."
        newHref="/admin/lectures/new"
        newLabel="New lecture"
      />

      {/* Pagination */}
      {result.totalPages > 1 && (
        <AdminPagination page={result.page} totalPages={result.totalPages} />
      )}
    </div>
  );
}

// ─── Shared filter bar (used by all content pages) ────────────────────────────

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "In review" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export function AdminFilters({
  statusOptions,
}: {
  statusOptions: Array<{ value: string; label: string }>;
}) {
  return (
    <form className="flex flex-col sm:flex-row gap-3" method="GET">
      <div className="relative flex-1">
        <Input
          name="q"
          type="search"
          placeholder="Search…"
          leftAddon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          }
          className="pl-9"
        />
      </div>
      <select
        name="status"
        className="h-input rounded-md px-3 pr-10 text-sm border border-border-emphasis bg-surface-card text-ink-primary appearance-none cursor-pointer outline-none focus:border-primary-700 w-full sm:w-44"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <Button type="submit" variant="secondary" size="sm">
        Filter
      </Button>
    </form>
  );
}

export function AdminPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-ink-muted">
      {page > 1 && (
        <Link
          href={`?page=${page - 1}`}
          className="px-3 py-1.5 rounded-md border border-border-default hover:bg-surface-subtle transition-colors"
        >
          Previous
        </Link>
      )}
      <span>
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <Link
          href={`?page=${page + 1}`}
          className="px-3 py-1.5 rounded-md border border-border-default hover:bg-surface-subtle transition-colors"
        >
          Next
        </Link>
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
