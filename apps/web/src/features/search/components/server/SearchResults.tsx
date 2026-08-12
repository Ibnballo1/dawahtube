// src/features/search/components/server/SearchResults.tsx
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@shared/components/ui/badge";
import { SearchTypeFilter } from "../client/SearchTypeFilter";
import { search } from "../../queries/search.queries";
import {
  formatDurationLong,
  formatReadingTime,
  formatPageCount,
  formatCount,
  formatRelativeDate,
} from "@shared/lib/format";
import type {
  SearchContentType,
  LectureSearchResult,
  ArticleSearchResult,
  BookSearchResult,
  ScholarSearchResult,
} from "../../types/search.types";

interface SearchResultsProps {
  query: string;
  type: SearchContentType;
  page: number;
}

export async function SearchResults({ query, type, page }: SearchResultsProps) {
  const results = await search(query, type, page);

  if (results.total === 0) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 text-center">
        <p className="font-display font-semibold text-xl text-ink-primary">
          No results for &ldquo;{query}&rdquo;
        </p>
        <p className="text-ink-muted text-sm max-w-[40ch]">
          Try different keywords, or check the spelling.
        </p>
        <Link
          href="/search"
          className="inline-flex items-center justify-center rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/90"
        >
          Clear search
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tab filter */}
      <SearchTypeFilter
        currentType={type}
        query={query}
        counts={{
          all: results.total,
          lectures: results.lectures.total,
          articles: results.articles.total,
          books: results.books.total,
          scholars: results.scholars.total,
        }}
      />

      {/* Result count */}
      <p className="text-sm text-ink-muted" role="status" aria-live="polite">
        {results.total.toLocaleString()} result{results.total !== 1 ? "s" : ""}{" "}
        for{" "}
        <span className="font-medium text-ink-secondary">
          &ldquo;{query}&rdquo;
        </span>
      </p>

      {/* Results by type */}
      {(type === "all" || type === "scholars") &&
        results.scholars.items.length > 0 && (
          <ResultSection
            title="Scholars"
            total={results.scholars.total}
            showAll={type === "all"}
            showAllHref={`/search?q=${encodeURIComponent(query)}&type=scholars`}
          >
            {results.scholars.items.map((s) => (
              <ScholarRow key={s.id} result={s} query={query} />
            ))}
          </ResultSection>
        )}

      {(type === "all" || type === "lectures") &&
        results.lectures.items.length > 0 && (
          <ResultSection
            title="Lectures"
            total={results.lectures.total}
            showAll={type === "all"}
            showAllHref={`/search?q=${encodeURIComponent(query)}&type=lectures`}
          >
            {results.lectures.items.map((l) => (
              <LectureRow key={l.id} result={l} query={query} />
            ))}
          </ResultSection>
        )}

      {(type === "all" || type === "articles") &&
        results.articles.items.length > 0 && (
          <ResultSection
            title="Articles"
            total={results.articles.total}
            showAll={type === "all"}
            showAllHref={`/search?q=${encodeURIComponent(query)}&type=articles`}
          >
            {results.articles.items.map((a) => (
              <ArticleRow key={a.id} result={a} query={query} />
            ))}
          </ResultSection>
        )}

      {(type === "all" || type === "books") &&
        results.books.items.length > 0 && (
          <ResultSection
            title="Books"
            total={results.books.total}
            showAll={type === "all"}
            showAllHref={`/search?q=${encodeURIComponent(query)}&type=books`}
          >
            {results.books.items.map((b) => (
              <BookRow key={b.id} result={b} query={query} />
            ))}
          </ResultSection>
        )}

      {/* Pagination — only shown in single-type view */}
      {type !== "all" &&
        (() => {
          const total = results[type]?.total ?? 0;
          const totalPages = Math.ceil(total / 12);
          if (totalPages <= 1) return null;

          return (
            <nav
              className="flex items-center justify-center gap-2 pt-4"
              aria-label="Pagination"
            >
              {page > 1 && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&type=${type}&page=${page - 1}`}
                  className="px-4 py-2 rounded-lg border border-border-default text-sm hover:bg-surface-subtle transition-colors"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-ink-muted px-2">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&type=${type}&page=${page + 1}`}
                  className="px-4 py-2 rounded-lg border border-border-default text-sm hover:bg-surface-subtle transition-colors"
                >
                  Next
                </Link>
              )}
            </nav>
          );
        })()}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function ResultSection({
  title,
  total,
  showAll,
  showAllHref,
  children,
}: {
  title: string;
  total: number;
  showAll: boolean;
  showAllHref: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      {showAll && (
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-base text-ink-primary flex items-center gap-2">
            {title}
            <span className="text-xs text-ink-muted font-normal bg-surface-muted px-2 py-0.5 rounded-full">
              {total}
            </span>
          </h2>
          {total > 5 && (
            <Link
              href={showAllHref}
              className="text-xs text-primary-700 hover:text-primary-800 font-medium transition-colors"
            >
              View all {total} →
            </Link>
          )}
        </div>
      )}
      <div className="flex flex-col divide-y divide-border-subtle border border-border-default rounded-xl overflow-hidden bg-surface-card">
        {children}
      </div>
    </section>
  );
}

// ─── Result rows ──────────────────────────────────────────────────────────────

function LectureRow({
  result,
}: {
  result: LectureSearchResult;
  query: string;
}) {
  return (
    <Link
      href={`/lectures/${result.slug}`}
      className="flex items-center gap-4 px-4 py-3 hover:bg-surface-subtle transition-colors group"
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-surface-muted shrink-0">
        {result.thumbnailUrl ? (
          <Image
            src={result.thumbnailUrl}
            alt={result.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-slow"
            sizes="96px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-950 flex items-center justify-center">
            <PlayIcon />
          </div>
        )}
        {result.durationSecs && (
          <span className="duration-pill absolute bottom-1 right-1 text-[9px] px-1 py-0">
            {formatDurationLong(result.durationSecs)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <h3 className="font-semibold text-sm text-ink-primary group-hover:text-primary-700 transition-colors line-clamp-1">
          {result.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-ink-muted flex-wrap">
          {result.scholarName && <span>{result.scholarName}</span>}
          {result.categoryName && (
            <>
              <span aria-hidden="true">·</span>
              <span>{result.categoryName}</span>
            </>
          )}
          {result.publishedAt && (
            <>
              <span aria-hidden="true">·</span>
              <span>{formatRelativeDate(result.publishedAt)}</span>
            </>
          )}
        </div>
        {result.description && (
          <p className="text-xs text-ink-tertiary line-clamp-1 mt-0.5">
            {result.description}
          </p>
        )}
      </div>

      <ChevronIcon />
    </Link>
  );
}

function ArticleRow({
  result,
}: {
  result: ArticleSearchResult;
  query: string;
}) {
  return (
    <Link
      href={`/articles/${result.slug}`}
      className="flex items-center gap-4 px-4 py-3 hover:bg-surface-subtle transition-colors group"
    >
      {/* Cover */}
      {result.coverUrl ? (
        <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-surface-muted shrink-0">
          <Image
            src={result.coverUrl}
            alt={result.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-slow"
            sizes="96px"
          />
        </div>
      ) : (
        <div className="w-24 h-14 rounded-lg bg-surface-subtle border border-border-default shrink-0 flex items-center justify-center">
          <ArticleIcon />
        </div>
      )}

      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <h3 className="font-semibold text-sm text-ink-primary group-hover:text-primary-700 transition-colors line-clamp-1">
          {result.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-ink-muted flex-wrap">
          {result.scholarName && <span>{result.scholarName}</span>}
          <span aria-hidden="true">·</span>
          <span>{formatReadingTime(result.readingTimeMins)}</span>
          {result.publishedAt && (
            <>
              <span aria-hidden="true">·</span>
              <span>{formatRelativeDate(result.publishedAt)}</span>
            </>
          )}
        </div>
        {result.excerpt && (
          <p className="text-xs text-ink-tertiary line-clamp-1 mt-0.5">
            {result.excerpt}
          </p>
        )}
      </div>

      <ChevronIcon />
    </Link>
  );
}

function BookRow({ result }: { result: BookSearchResult; query: string }) {
  return (
    <Link
      href={`/library/${result.slug}`}
      className="flex items-center gap-4 px-4 py-3 hover:bg-surface-subtle transition-colors group"
    >
      {/* Cover */}
      <div className="relative w-10 h-14 rounded-md overflow-hidden bg-primary-100 shrink-0 shadow-sm">
        {result.coverUrl ? (
          <Image
            src={result.coverUrl}
            alt={result.title}
            fill
            className="object-cover"
            sizes="40px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-primary-700 to-primary-900 flex items-end p-1">
            <p className="text-white text-[7px] font-bold leading-tight line-clamp-3 font-display">
              {result.title}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <h3 className="font-semibold text-sm text-ink-primary group-hover:text-primary-700 transition-colors line-clamp-1">
          {result.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-ink-muted flex-wrap">
          {result.authorName && <span>{result.authorName}</span>}
          {result.pageCount && (
            <>
              <span aria-hidden="true">·</span>
              <span>{formatPageCount(result.pageCount)}</span>
            </>
          )}
          {result.isFree && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-primary-600 font-medium">Free</span>
            </>
          )}
        </div>
      </div>

      <ChevronIcon />
    </Link>
  );
}

function ScholarRow({
  result,
}: {
  result: ScholarSearchResult;
  query: string;
}) {
  const displayName = [result.honorifics, result.name]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      href={`/scholars/${result.slug}`}
      className="flex items-center gap-4 px-4 py-3 hover:bg-surface-subtle transition-colors group"
    >
      {/* Avatar */}
      <div className="relative size-12 rounded-full overflow-hidden bg-primary-100 shrink-0">
        {result.avatarUrl ? (
          <Image
            src={result.avatarUrl}
            alt={displayName}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="absolute inset-0 bg-primary-700 flex items-center justify-center">
            <span className="font-display font-bold text-lg text-white">
              {result.name[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <h3 className="font-semibold text-sm text-ink-primary group-hover:text-primary-700 transition-colors">
          {displayName}
        </h3>
        <div className="flex items-center gap-2 text-xs text-ink-muted flex-wrap">
          {result.nationality && <span>{result.nationality}</span>}
          {result.lectureCount > 0 && (
            <>
              {result.nationality && <span aria-hidden="true">·</span>}
              <span>{formatCount(result.lectureCount)} lectures</span>
            </>
          )}
          {result.articleCount > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>{formatCount(result.articleCount)} articles</span>
            </>
          )}
        </div>
        {result.arabicName && (
          <p
            className="font-arabic text-arabic-sm text-ink-muted leading-relaxed"
            dir="rtl"
            lang="ar"
          >
            {result.arabicName}
          </p>
        )}
      </div>

      <ChevronIcon />
    </Link>
  );
}

// ─── Micro icons ──────────────────────────────────────────────────────────────

function PlayIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="rgba(255,255,255,0.4)"
      aria-hidden="true"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function ArticleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-ink-muted"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-ink-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
