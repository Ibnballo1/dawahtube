// src/features/library/components/server/BookListing.tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { formatPageCount, formatCount } from "@shared/lib/format";
import { getBooks } from "../../queries/library.queries";
import type { BookFilters, BookCard } from "../../types/library.types";

interface BookListingProps {
  filters: BookFilters;
}

export async function BookListing({ filters }: BookListingProps) {
  const result = await getBooks(filters);

  if (result.books.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          title="No books found"
          description={
            filters.query
              ? `No books match "${filters.query}". Try different keywords or clear your filters.`
              : "No books match your current filters."
          }
          action={{ label: "Clear filters", href: "/library" }}
        />
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-8">
      <p className="text-sm text-ink-muted" role="status" aria-live="polite">
        {result.total.toLocaleString()} {result.total === 1 ? "book" : "books"}
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        role="list"
        aria-label="Book results"
      >
        {result.books.map((book) => (
          <BookListCard key={book.id} book={book} />
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

function BookListCard({ book }: { book: BookCard }) {
  return (
    <Link
      href={`/library/${book.slug}`}
      className="card card-interactive flex gap-4 p-4 group"
      aria-label={`${book.title}${book.authorName ? ` by ${book.authorName}` : ""}`}
    >
      {/* Cover */}
      <div className="relative w-20 h-28 rounded-md overflow-hidden bg-primary-100 shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
        {book.coverAsset?.publicUrl ? (
          <Image
            src={book.coverAsset.publicUrl}
            alt={book.coverAsset.altText ?? book.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <PlaceholderCover title={book.title} />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        {book.category && (
          <Badge
            variant="default"
            size="sm"
            className="w-fit text-[10px] px-2 py-0.5"
          >
            {book.category.name}
          </Badge>
        )}

        <h2 className="font-display font-bold text-sm text-ink-primary leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
          {book.title}
        </h2>

        {book.authorName && (
          <p className="text-xs text-ink-tertiary line-clamp-1">
            {book.authorName}
            {book.translator && (
              <span className="text-ink-muted">
                {" "}
                · trans. {book.translator}
              </span>
            )}
          </p>
        )}

        <div className="flex items-center gap-2 mt-auto pt-1">
          {book.pageCount && (
            <span className="text-xs text-ink-muted">
              {formatPageCount(book.pageCount)}
            </span>
          )}
          {book.allowFreeDownload && (
            <span className="text-xs text-primary-600 font-medium flex items-center gap-1">
              <DownloadIcon />
              Free
            </span>
          )}
          {book.viewCount > 0 && (
            <span className="text-xs text-ink-muted ml-auto">
              {formatCount(book.viewCount)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function PlaceholderCover({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-primary-700 to-primary-900 flex items-end p-1.5">
      <p className="text-white text-[9px] font-bold leading-tight line-clamp-4 font-display">
        {title}
      </p>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

function Pagination({
  currentPage,
  totalPages,
  filters,
}: {
  currentPage: number;
  totalPages: number;
  filters: BookFilters;
}) {
  function buildUrl(page: number) {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.categoryId) params.set("category", filters.categoryId);
    if (filters.tagSlug) params.set("tag", filters.tagSlug);
    if (filters.freeOnly) params.set("free", "1");
    if (filters.language) params.set("lang", filters.language);
    if (filters.sort && filters.sort !== "newest")
      params.set("sort", filters.sort);
    params.set("page", String(page));
    return `/library?${params.toString()}`;
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
      <Link href={buildUrl(currentPage - 1)} aria-label="Previous page">
        <Button
          variant="ghost"
          size="sm"
          aria-disabled={currentPage === 1}
          className={currentPage === 1 ? "pointer-events-none opacity-40" : ""}
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
        </Button>
      </Link>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="px-2 text-ink-muted text-sm">
            …
          </span>
        ) : p === currentPage ? (
          <Button
            key={p}
            variant="default"
            size="sm"
            aria-current="page"
            aria-label={`Page ${p}`}
          >
            <span>{p}</span>
          </Button>
        ) : (
          <Link key={p} href={buildUrl(p)} aria-label={`Page ${p}`}>
            <Button variant="ghost" size="sm">
              {p}
            </Button>
          </Link>
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
          <span className="inline-flex items-center gap-1">
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
          </span>
        </Link>
      </Button>
    </nav>
  );
}
