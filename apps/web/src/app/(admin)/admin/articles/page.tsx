// src/app/(admin)/admin/articles/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { getAdminArticles } from "@features/admin/queries/admin.queries";
import { AdminContentTable } from "@features/admin/components/server/AdminContentTable";
import {
  PublishButton,
  DeleteButton,
} from "@features/admin/components/client/ContentRowActions";
import {
  publishArticle,
  deleteArticle,
} from "@features/admin/actions/content.actions";
import { AdminFilters, AdminPagination } from "../lectures/page";
import { Button } from "@shared/components/ui/button";
import { formatScholarName, formatReadingTime } from "@shared/lib/format";

export const metadata: Metadata = { title: "Manage Articles" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const result = await getAdminArticles({
    page: params.page ? parseInt(params.page, 10) : 1,
    ...(params.status && { status: params.status }),
    ...(params.q && { query: params.q }),
  });

  const rows = result.articles.map((article) => ({
    id: article.id,
    title: article.title,
    status: article.status,
    updatedAt: article.updatedAt,
    editHref: `/admin/articles/${article.id}`,
    extra: (
      <span className="flex items-center gap-2">
        {article.scholar && (
          <span>{formatScholarName(article.scholar.name, "")}</span>
        )}
        <span className="text-ink-muted">·</span>
        <span>{formatReadingTime(article.readingTimeMins)}</span>
      </span>
    ),
    actions: (
      <div className="flex items-center gap-1">
        <PublishButton
          id={article.id}
          status={article.status}
          onPublish={publishArticle}
        />
        <DeleteButton
          id={article.id}
          title={article.title}
          onDelete={deleteArticle}
        />
      </div>
    ),
  }));

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary">
            Articles
          </h1>
          <p className="text-ink-muted text-sm mt-0.5">{result.total} total</p>
        </div>
        <Button>
          <Link href="/admin/articles/new">
            <PlusIcon /> New article
          </Link>
        </Button>
      </div>

      <AdminFilters statusOptions={STATUS_OPTIONS} />

      <AdminContentTable
        rows={rows}
        emptyLabel="No articles yet. Create your first article to get started."
        newHref="/admin/articles/new"
        newLabel="New article"
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
  { value: "scheduled", label: "Scheduled" },
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
