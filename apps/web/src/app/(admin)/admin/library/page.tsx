// src/app/(admin)/admin/library/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { getAdminBooks } from "@features/admin/queries/admin.queries";
import { AdminContentTable } from "@features/admin/components/server/AdminContentTable";
import {
  PublishButton,
  DeleteButton,
} from "@features/admin/components/client/ContentRowActions";
import {
  publishBook,
  deleteBook,
} from "@features/admin/actions/content.actions";
import { AdminFilters, AdminPagination } from "../lectures/page";
import { Button } from "@shared/components/ui/button";
import { formatFileSize } from "@shared/lib/format";

export const metadata: Metadata = { title: "Manage Library" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}

export default async function AdminLibraryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const queryParams: { page?: number; status?: string; query?: string } = {};
  queryParams.page = params.page ? parseInt(params.page, 10) : 1;
  if (params.status) queryParams.status = params.status;
  if (params.q) queryParams.query = params.q;

  const result = await getAdminBooks(queryParams);

  const rows = result.books.map((book) => ({
    id: book.id,
    title: book.title,
    status: book.status,
    updatedAt: book.updatedAt,
    editHref: `/admin/library/${book.id}`,
    extra: (
      <span className="flex items-center gap-2 text-xs">
        {book.authorName && <span>{book.authorName}</span>}
        {book.pdfAsset && (
          <>
            <span className="text-ink-muted">·</span>
            <span className="text-ink-muted">
              {formatFileSize(book.pdfAsset.sizeBytes)}
            </span>
          </>
        )}
        {!book.pdfAsset && (
          <span className="text-red-500 font-medium">No PDF</span>
        )}
      </span>
    ),
    actions: (
      <div className="flex items-center gap-1">
        <PublishButton
          id={book.id}
          status={book.status}
          onPublish={publishBook}
        />
        <DeleteButton id={book.id} title={book.title} onDelete={deleteBook} />
      </div>
    ),
  }));

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary">
            Library
          </h1>
          <p className="text-ink-muted text-sm mt-0.5">{result.total} total</p>
        </div>
        <Button>
          <Link href="/admin/library/new">
            <PlusIcon /> New book
          </Link>
        </Button>
      </div>

      <AdminFilters statusOptions={STATUS_OPTIONS} />

      <AdminContentTable
        rows={rows}
        emptyLabel="No books yet. Upload your first PDF to get started."
        newHref="/admin/library/new"
        newLabel="New book"
      />

      {result.totalPages > 1 && (
        <AdminPagination page={result.page} totalPages={result.totalPages} />
      )}
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "In review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

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
