// src/features/homepage/components/server/LibraryHighlights.tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@shared/components/ui/badge";
import { SectionHeader } from "@shared/components/ui/SectionHeader";
import { formatPageCount } from "@shared/lib/format";
import { getLibraryHighlights } from "../../queries/get-homepage-data";

export async function LibraryHighlights() {
  const books = await getLibraryHighlights();
  if (books.length === 0) return null;

  return (
    <section
      className="section bg-surface-subtle border-t border-border-subtle"
      aria-labelledby="library-heading"
    >
      <div className="container-site flex flex-col gap-10">
        <SectionHeader
          overline="The Library"
          heading="Books for the serious student"
          description="Classical and contemporary Islamic texts — free to read and download."
          headingAs="h2"
          action={
            <Link
              href="/library"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink-primary hover:bg-surface-elevated transition-colors"
            >
              View library <ArrowRight />
            </Link>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </section>
  );
}

type BookData = Awaited<ReturnType<typeof getLibraryHighlights>>[number];

function BookCard({ book }: { book: BookData }) {
  return (
    <Link
      href={`/library/${book.slug}`}
      className="card card-interactive flex gap-4 p-4 group"
      aria-label={`${book.title}${book.authorName ? ` by ${book.authorName}` : ""}`}
    >
      {/* Book cover */}
      <div className="relative w-16 h-24 rounded-md overflow-hidden bg-primary-100 shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
        {book.coverAsset?.publicUrl ? (
          <Image
            src={book.coverAsset.publicUrl}
            alt={book.coverAsset.altText ?? book.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <PlaceholderCover title={book.title} />
        )}
      </div>

      {/* Book info */}
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        {book.category && (
          <Badge
            variant="default"
            size="sm"
            className="w-fit text-[10px] px-2 py-0.5"
          >
            {book.category.name}
          </Badge>
        )}

        <h3 className="font-display font-bold text-sm text-ink-primary leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
          {book.title}
        </h3>

        {book.authorName && (
          <p className="text-xs text-ink-muted line-clamp-1">
            {book.authorName}
          </p>
        )}

        <div className="flex items-center gap-2 mt-auto">
          {book.pageCount && (
            <span className="text-xs text-ink-muted">
              {formatPageCount(book.pageCount)}
            </span>
          )}
          {book.allowFreeDownload && (
            <span className="text-xs text-primary-600 font-medium flex items-center gap-1">
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
              Free
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
      <p className="text-white text-[9px] font-bold leading-tight line-clamp-3 font-display">
        {title}
      </p>
    </div>
  );
}

function ArrowRight() {
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
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
