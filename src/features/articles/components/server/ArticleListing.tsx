// src/features/articles/components/server/ArticleListing.tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import {
  formatScholarName,
  formatReadingTime,
  formatRelativeDate,
  formatCount,
} from "@shared/lib/format";
import { getArticles } from "../../queries/article.queries";
import type { ArticleFilters, ArticleCard } from "../../types/article.types";

interface ArticleListingProps {
  filters: ArticleFilters;
}

export async function ArticleListing({ filters }: ArticleListingProps) {
  const result = await getArticles(filters);

  if (result.articles.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          title="No articles found"
          description={
            filters.query
              ? `No articles match "${filters.query}". Try different keywords or clear your filters.`
              : "No articles match your current filters."
          }
          action={{ label: "Clear filters", href: "/articles" }}
        />
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-8">
      <p className="text-sm text-ink-muted" role="status" aria-live="polite">
        {result.total.toLocaleString()}{" "}
        {result.total === 1 ? "article" : "articles"}
        {filters.query && (
          <>
            {" "}
            for{" "}
            <span className="font-medium text-ink-secondary">
              &ldquo;{filters.query}&rdquo;
            </span>
          </>
        )}
      </p>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        role="list"
        aria-label="Article results"
      >
        {result.articles.map((article) => (
          <ArticleListCard key={article.id} article={article} />
        ))}
      </div>

      {result.totalPages > 1 && (
        <Pagination
          currentPage={result.page}
          totalPages={result.totalPages}
          filters={filters}
        />
      )}
    </div>
  );
}

function ArticleListCard({ article }: { article: ArticleCard }) {
  const scholarName = article.scholar
    ? formatScholarName(
        article.scholar.honorifics ?? null,
        article.scholar.name,
      )
    : null;

  return (
    <article
      role="listitem"
      className="card card-interactive flex flex-col group"
    >
      {article.coverAsset?.publicUrl && (
        <Link
          href={`/articles/${article.slug}`}
          className="block relative aspect-[16/9] overflow-hidden rounded-t-xl bg-surface-muted"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={article.coverAsset.publicUrl}
            alt={article.coverAsset.altText ?? article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-slow ease-smooth"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        </Link>
      )}

      <div className="flex flex-col flex-1 gap-2.5 p-4">
        {article.category && (
          <Badge variant="default" size="sm" className="w-fit">
            {article.category.name}
          </Badge>
        )}

        <h2 className="font-display font-bold text-base text-ink-primary leading-snug line-clamp-2">
          <Link
            href={`/articles/${article.slug}`}
            className="hover:text-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 rounded-sm"
          >
            {article.title}
          </Link>
        </h2>

        {article.excerpt && (
          <p className="text-sm text-ink-tertiary line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {scholarName && (
          <Link
            href={`/scholars/${article.scholar!.slug}`}
            className="flex items-center gap-2 w-fit group/s"
          >
            <div className="size-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
              {article.scholar?.avatarAsset?.publicUrl ? (
                <Image
                  src={article.scholar.avatarAsset.publicUrl}
                  alt={scholarName}
                  width={20}
                  height={20}
                  className="object-cover"
                />
              ) : (
                article.scholar?.name[0]?.toUpperCase()
              )}
            </div>
            <span className="text-xs text-ink-tertiary group-hover/s:text-primary-700 transition-colors truncate">
              {scholarName}
            </span>
          </Link>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-subtle text-xs text-ink-muted">
          {article.publishedAt && (
            <span>{formatRelativeDate(article.publishedAt)}</span>
          )}
          <span>{formatReadingTime(article.readingTimeMins)}</span>
        </div>
      </div>
    </article>
  );
}

function Pagination({
  currentPage,
  totalPages,
  filters,
}: {
  currentPage: number;
  totalPages: number;
  filters: ArticleFilters;
}) {
  function buildUrl(page: number) {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.categoryId) params.set("category", filters.categoryId);
    if (filters.scholarId) params.set("scholar", filters.scholarId);
    if (filters.tagSlug) params.set("tag", filters.tagSlug);
    if (filters.sort && filters.sort !== "newest")
      params.set("sort", filters.sort);
    params.set("page", String(page));
    return `/articles?${params.toString()}`;
  }

  const pages: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("ellipsis");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
  }

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      <Link
        href={buildUrl(currentPage - 1)}
        aria-label="Previous page"
        className={`inline-flex items-center gap-2 px-3 py-1 text-sm rounded ${currentPage === 1 ? "pointer-events-none opacity-40" : "hover:bg-surface"}`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Prev
      </Link>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="px-2 text-ink-muted text-sm">
            …
          </span>
        ) : p === currentPage ? (
          <Button
            key={p}
            aria-current="page"
            aria-label={`Page ${p}`}
            className="inline-flex items-center justify-center px-3 py-1 text-sm rounded bg-primary-600 text-white"
          >
            {p}
          </Button>
        ) : (
          <Link
            key={p}
            href={buildUrl(p)}
            aria-label={`Page ${p}`}
            className="inline-flex items-center justify-center px-3 py-1 text-sm rounded hover:bg-surface"
          >
            {p}
          </Link>
        ),
      )}

      <Link
        href={buildUrl(currentPage + 1)}
        aria-label="Next page"
        className={`inline-flex items-center gap-2 px-3 py-1 text-sm rounded ${currentPage === totalPages ? "pointer-events-none opacity-40" : "hover:bg-surface"}`}
      >
        Next
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>
    </nav>
  );
}
