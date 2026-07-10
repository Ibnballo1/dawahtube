// src/features/lectures/components/server/LectureListing.tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import {
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
    <div className="mt-8 flex flex-col gap-8">
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

      {/* Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        role="list"
        aria-label="Lecture results"
      >
        {result.lectures.map((lecture) => (
          <LectureListCard key={lecture.id} lecture={lecture} />
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

// ─── Lecture list card ────────────────────────────────────────────────────────

function LectureListCard({ lecture }: { lecture: LectureCard }) {
  const scholarName = lecture.scholar
    ? formatScholarName(
        lecture.scholar.honorifics ?? null,
        lecture.scholar.name,
      )
    : null;

  return (
    <article
      role="listitem"
      className="card card-interactive flex flex-col group"
    >
      {/* Thumbnail */}
      <Link
        href={`/lectures/${lecture.slug}`}
        className="block relative aspect-video overflow-hidden rounded-t-xl bg-surface-muted"
        tabIndex={-1}
        aria-hidden="true"
      >
        {lecture.thumbnailAsset?.publicUrl ? (
          <Image
            src={lecture.thumbnailAsset.publicUrl}
            alt={lecture.thumbnailAsset.altText ?? lecture.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-slow ease-smooth"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-950 flex items-center justify-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
              aria-hidden="true"
            >
              <polygon
                points="5 3 19 12 5 21 5 3"
                fill="rgba(255,255,255,0.15)"
                stroke="none"
              />
            </svg>
          </div>
        )}

        {/* Duration pill */}
        {lecture.durationSecs && (
          <span className="duration-pill absolute bottom-2 right-2">
            {formatDurationLong(lecture.durationSecs)}
          </span>
        )}

        {/* Play overlay */}
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-normal bg-black/20"
        >
          <span className="size-11 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="white"
              aria-hidden="true"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </span>
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 gap-2.5 p-4">
        {/* Category */}
        {lecture.category && (
          <Badge variant="primary" size="sm" className="w-fit">
            {lecture.category.name}
          </Badge>
        )}

        {/* Title */}
        <h2 className="font-display font-bold text-base text-ink-primary leading-snug line-clamp-2">
          <Link
            href={`/lectures/${lecture.slug}`}
            className="hover:text-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 rounded-sm"
          >
            {lecture.title}
          </Link>
        </h2>

        {/* Scholar */}
        {lecture.scholar && (
          <Link
            href={`/scholars/${lecture.scholar.slug}`}
            className="flex items-center gap-2 w-fit group/s"
          >
            <div className="size-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
              {lecture.scholar.avatarAsset?.publicUrl ? (
                <Image
                  src={lecture.scholar.avatarAsset.publicUrl}
                  alt={scholarName ?? ""}
                  width={20}
                  height={20}
                  className="object-cover"
                />
              ) : (
                lecture.scholar.name[0]?.toUpperCase()
              )}
            </div>
            <span className="text-xs text-ink-tertiary group-hover/s:text-primary-700 transition-colors truncate">
              {scholarName}
            </span>
          </Link>
        )}

        {/* Footer: date + views */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-subtle text-xs text-ink-muted">
          {lecture.publishedAt && (
            <span>{formatRelativeDate(lecture.publishedAt)}</span>
          )}
          {lecture.viewCount > 0 && (
            <span>{formatCount(lecture.viewCount)} views</span>
          )}
        </div>
      </div>
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

  // Show at most 5 page buttons around current page
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
        p === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-ink-muted text-sm">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === currentPage ? "default" : "ghost"}
            size="sm"
            aria-current={p === currentPage ? "page" : undefined}
            aria-label={`Page ${p}`}
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
