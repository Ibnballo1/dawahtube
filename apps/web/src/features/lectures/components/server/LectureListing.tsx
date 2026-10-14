// src/features/lectures/components/server/LectureListing.tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@shared/components/ui/badge";
import { EmptyState } from "@shared/components/ui/EmptyState";
import {
  formatDate,
  formatDurationLong,
  formatScholarName,
  formatCount,
  formatRelativeDate,
} from "@shared/lib/format";
import { getLectures } from "../../queries/lecture.queries";
import type { LectureFilters, LectureCard } from "../../types/lecture.types";

interface LectureListingProps {
  filters: LectureFilters;
}

export async function LectureListing({ filters }: LectureListingProps) {
  const result = await getLectures(filters);

  if (result.lectures.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          title="No lectures found"
          description={
            filters.query
              ? `No lectures match "${filters.query}". Try different keywords or clear your filters.`
              : "No lectures match your current filters."
          }
          action={{ label: "Clear filters", href: "/lectures" }}
        />
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* Results count */}
      <p className="text-sm text-ink-muted" role="status" aria-live="polite">
        {result.total.toLocaleString()}{" "}
        {result.total === 1 ? "lecture" : "lectures"}
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

      {/* List */}
      <div
        className="flex flex-col divide-y divide-border-subtle bg-surface-card border border-border-default rounded-2xl overflow-hidden"
        role="list"
        aria-label="Lecture results"
      >
        {result.lectures.map((lecture, idx) => (
          <LectureListRow
            key={lecture.id}
            lecture={lecture}
            index={idx + 1 + ((filters.page ?? 1) - 1) * 20}
          />
        ))}
      </div>

      {/* Pagination */}
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

// ─── Lecture list row ─────────────────────────────────────────────────────────

function LectureListRow({
  lecture,
  index,
}: {
  lecture: LectureCard;
  index: number;
}) {
  const scholarName = lecture.scholar
    ? formatScholarName(
        lecture.scholar.honorifics ?? null,
        lecture.scholar.name,
      )
    : null;
  const scholarAvatarUrl =
    lecture.scholar?.avatarAsset?.publicUrl?.trim() || null;
  const displayDate = lecture.recordedAt ?? lecture.publishedAt;

  return (
    <article
      role="listitem"
      className="group flex items-start gap-4 px-5 py-4 hover:bg-surface-subtle transition-colors"
    >
      {/* Index number */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-surface-subtle border border-border-default flex items-center justify-center mt-0.5 group-hover:bg-primary-50 group-hover:border-primary-200 transition-colors">
        <span className="text-xs font-bold text-ink-muted group-hover:text-primary-700 transition-colors tabular-nums">
          {index}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Category */}
        {lecture.category && (
          <div>
            <Badge variant="primary" size="sm" className="text-[10px]">
              {lecture.category.name}
            </Badge>
          </div>
        )}

        {/* Title */}
        <h2 className="font-display font-semibold text-base text-ink-primary leading-snug">
          <Link
            href={`/lectures/${lecture.slug}`}
            className="hover:text-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 rounded-sm"
          >
            {lecture.title}
          </Link>
        </h2>

        {/* Scholar + meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {/* Scholar */}
          {lecture.scholar && scholarName && (
            <Link
              href={`/scholars/${lecture.scholar.slug}`}
              className="flex items-center gap-1.5 group/s shrink-0"
            >
              <div className="size-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0 overflow-hidden">
                {scholarAvatarUrl ? (
                  <Image
                    src={scholarAvatarUrl}
                    alt={scholarName}
                    width={20}
                    height={20}
                    className="object-cover"
                    unoptimized={process.env.NODE_ENV === "development"}
                  />
                ) : (
                  <span className="text-[9px] font-bold text-primary-700">
                    {lecture.scholar.name[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-xs text-ink-tertiary group-hover/s:text-primary-700 transition-colors">
                {scholarName}
              </span>
            </Link>
          )}

          {/* Duration */}
          {lecture.durationSecs && (
            <span className="flex items-center gap-1 text-xs text-ink-muted">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {formatDurationLong(lecture.durationSecs)}
            </span>
          )}

          {/* Date */}
          {displayDate && (
            <span className="flex items-center gap-1 text-xs text-ink-muted">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {lecture.recordedAt
                ? formatDate(lecture.recordedAt)
                : formatRelativeDate(lecture.publishedAt!)}
            </span>
          )}

          {/* Views */}
          {lecture.viewCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-ink-muted">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {formatCount(lecture.viewCount)}
            </span>
          )}
        </div>
      </div>

      {/* Play button — right side */}
      <Link
        href={`/lectures/${lecture.slug}`}
        aria-label={`Play: ${lecture.title}`}
        className="shrink-0 size-9 rounded-full border border-border-default flex items-center justify-center text-ink-muted hover:bg-primary-700 hover:border-primary-700 hover:text-white transition-all duration-fast mt-0.5"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </Link>
    </article>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  filters,
}: {
  currentPage: number;
  totalPages: number;
  filters: LectureFilters;
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
    return `/lectures?${params.toString()}`;
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
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
  }

  const navLinkCls = (active: boolean) =>
    [
      "inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors",
      active
        ? "bg-primary-700 text-white"
        : "text-ink-tertiary hover:bg-surface-subtle hover:text-ink-primary",
    ].join(" ");

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          aria-label="Previous page"
          className={navLinkCls(false)}
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
          <span className="ml-1 hidden sm:inline">Prev</span>
        </Link>
      ) : (
        <span className={`${navLinkCls(false)} opacity-40 pointer-events-none`}>
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
          <span className="ml-1 hidden sm:inline">Prev</span>
        </span>
      )}

      {/* Pages */}
      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-ink-muted text-sm">
            …
          </span>
        ) : p === currentPage ? (
          <span key={p} className={navLinkCls(true)} aria-current="page">
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={buildUrl(p)}
            aria-label={`Page ${p}`}
            className={navLinkCls(false)}
          >
            {p}
          </Link>
        ),
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          aria-label="Next page"
          className={navLinkCls(false)}
        >
          <span className="mr-1 hidden sm:inline">Next</span>
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
      ) : (
        <span className={`${navLinkCls(false)} opacity-40 pointer-events-none`}>
          <span className="mr-1 hidden sm:inline">Next</span>
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
        </span>
      )}
    </nav>
  );
}
