// src/features/scholars/components/server/ScholarDirectory.tsx
import Link from "next/link";
import Image from "next/image";
import { Button } from "@shared/components/ui/button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { formatScholarName, formatCount } from "@shared/lib/format";
import { getScholars } from "../../queries/scholar.queries";
import type { ScholarFilters, ScholarCard } from "../../types/scholar.types";

interface ScholarDirectoryProps {
  filters: ScholarFilters;
}

export async function ScholarDirectory({ filters }: ScholarDirectoryProps) {
  const result = await getScholars(filters);

  if (result.scholars.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          title="No scholars found"
          description={
            filters.query
              ? `No scholars match "${filters.query}".`
              : "No scholars match your current filters."
          }
          action={{ label: "Clear filters", href: "/scholars" }}
        />
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-8">
      <p className="text-sm text-ink-muted" role="status" aria-live="polite">
        {result.total.toLocaleString()}{" "}
        {result.total === 1 ? "scholar" : "scholars"}
      </p>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
        role="list"
        aria-label="Scholar directory"
      >
        {result.scholars.map((scholar) => (
          <ScholarDirectoryCard key={scholar.id} scholar={scholar} />
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

function ScholarDirectoryCard({ scholar }: { scholar: ScholarCard }) {
  const displayName = formatScholarName(
    scholar.honorifics ?? null,
    scholar.name,
  );

  return (
    <Link
      href={`/scholars/${scholar.slug}`}
      role="listitem"
      className="card card-interactive flex flex-col items-center text-center p-5 gap-3 group"
      aria-label={`View profile of ${displayName}`}
    >
      {/* Avatar */}
      <div className="relative size-20 rounded-full overflow-hidden bg-primary-100 ring-2 ring-transparent group-hover:ring-primary-300 transition-all duration-normal shrink-0">
        {scholar.avatarAsset?.publicUrl ? (
          <Image
            src={scholar.avatarAsset.publicUrl}
            alt={scholar.avatarAsset.altText ?? displayName}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="absolute inset-0 bg-primary-700 flex items-center justify-center">
            <span className="font-display font-bold text-2xl text-white">
              {scholar.name[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="flex flex-col gap-0.5">
        <h2 className="font-display font-bold text-sm text-ink-primary leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">
          {displayName}
        </h2>
        {scholar.arabicName && (
          <p
            className="font-arabic text-arabic-sm text-ink-tertiary leading-relaxed"
            dir="rtl"
            lang="ar"
          >
            {scholar.arabicName}
          </p>
        )}
        {scholar.nationality && (
          <p className="text-xs text-ink-muted">{scholar.nationality}</p>
        )}
      </div>

      {/* Counts */}
      <div className="flex gap-3 text-xs text-ink-tertiary">
        {scholar.lectureCount > 0 && (
          <span>{formatCount(scholar.lectureCount)} lectures</span>
        )}
        {scholar.articleCount > 0 && (
          <span>{formatCount(scholar.articleCount)} articles</span>
        )}
      </div>
    </Link>
  );
}

function Pagination({
  currentPage,
  totalPages,
  filters,
}: {
  currentPage: number;
  totalPages: number;
  filters: ScholarFilters;
}) {
  function buildUrl(page: number) {
    const p = new URLSearchParams();
    if (filters.query) p.set("q", filters.query);
    if (filters.nationality) p.set("nationality", filters.nationality);
    if (filters.sort && filters.sort !== "name-asc")
      p.set("sort", filters.sort);
    p.set("page", String(page));
    return `/scholars?${p.toString()}`;
  }

  const pages: (number | "e")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("e");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("e");
    pages.push(totalPages);
  }

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      <Button
        variant="ghost"
        size="sm"
        aria-disabled={currentPage === 1}
        className={currentPage === 1 ? "pointer-events-none opacity-40" : ""}
      >
        <Link href={buildUrl(currentPage - 1)} aria-label="Previous page">
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
      </Button>

      {pages.map((p, i) =>
        p === "e" ? (
          <span key={`e${i}`} className="px-2 text-ink-muted text-sm">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === currentPage ? "default" : "ghost"}
            size="sm"
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p === currentPage ? (
              <span>{p}</span>
            ) : (
              <Link href={buildUrl(p)}>{p}</Link>
            )}
          </Button>
        ),
      )}

      <Button
        variant="ghost"
        size="sm"
        aria-disabled={currentPage === totalPages}
        className={
          currentPage === totalPages ? "pointer-events-none opacity-40" : ""
        }
      >
        <Link href={buildUrl(currentPage + 1)} aria-label="Next page">
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
      </Button>
    </nav>
  );
}
