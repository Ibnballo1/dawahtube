// src/features/library/components/server/RelatedBooks.tsx
import Link from "next/link";
import Image from "next/image";
import { formatPageCount } from "@shared/lib/format";

type RelatedBookRow = {
  id: string;
  slug: string;
  title: string;
  authorName: string | null;
  pageCount: number | null;
  allowFreeDownload: boolean;
  coverAsset: { publicUrl: string | null; altText: string | null } | null;
};

interface RelatedBooksProps {
  books: RelatedBookRow[];
}

export function RelatedBooks({ books }: RelatedBooksProps) {
  if (books.length === 0) return null;

  return (
    <div className="flex flex-col gap-6" aria-label="Related books">
      <h2 className="font-display font-bold text-xl text-ink-primary">
        More from the library
      </h2>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        role="list"
      >
        {books.map((book) => (
          <RelatedBookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}

function RelatedBookCard({ book }: { book: RelatedBookRow }) {
  return (
    <Link
      href={`/library/${book.slug}`}
      role="listitem"
      className="card card-interactive flex gap-4 p-4 group"
      aria-label={`${book.title}${book.authorName ? ` by ${book.authorName}` : ""}`}
    >
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
          <div className="absolute inset-0 bg-gradient-to-b from-primary-700 to-primary-900 flex items-end p-1.5">
            <p className="text-white text-[9px] font-bold leading-tight line-clamp-3 font-display">
              {book.title}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
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
            <span className="text-xs text-primary-600 font-medium">Free</span>
          )}
        </div>
      </div>
    </Link>
  );
}
