// src/features/library/components/server/BookDetailView.tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@shared/components/ui/badge";
import {
  formatDate,
  formatPageCount,
  formatFileSize,
  formatCount,
} from "@shared/lib/format";
import { PdfViewer } from "@features/library/components/client/PdfViewer";
import type { BookDetail } from "../../types/library.types";

interface BookDetailViewProps {
  book: BookDetail;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  ar: "Arabic",
  ha: "Hausa",
  yo: "Yoruba",
  fr: "French",
};

export function BookDetailView({ book }: BookDetailViewProps) {
  return (
    <article
      aria-labelledby="book-title"
      className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10"
    >
      {/* ── Cover column ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-primary-100 shadow-lg">
          {book.coverAsset?.publicUrl ? (
            <Image
              src={book.coverAsset.publicUrl}
              alt={book.coverAsset.altText ?? book.title}
              fill
              priority
              className="object-cover"
              sizes="280px"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-primary-700 to-primary-900 flex items-end p-6">
              <p className="text-white font-display font-bold text-lg leading-tight">
                {book.title}
              </p>
            </div>
          )}
        </div>

        {/* Quick facts list */}
        <dl className="flex flex-col gap-2 text-sm">
          {book.authorName && <Fact label="Author" value={book.authorName} />}
          {book.translator && (
            <Fact label="Translator" value={book.translator} />
          )}
          {book.publishYear && (
            <Fact label="Published" value={String(book.publishYear)} />
          )}
          {book.pageCount && (
            <Fact label="Pages" value={formatPageCount(book.pageCount)} />
          )}
          <Fact
            label="Language"
            value={LANGUAGE_LABELS[book.language] ?? book.language}
          />
          {book.pdfAsset?.sizeBytes && (
            <Fact
              label="File size"
              value={formatFileSize(book.pdfAsset.sizeBytes)}
            />
          )}
        </dl>
      </div>

      {/* ── Content column ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 min-w-0">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-sm text-ink-muted"
        >
          <Link href="/" className="hover:text-ink-secondary transition-colors">
            Home
          </Link>
          <ChevronRight />
          <Link
            href="/library"
            className="hover:text-ink-secondary transition-colors"
          >
            Library
          </Link>
          {book.category && (
            <>
              <ChevronRight />
              <Link
                href={`/library?category=${book.category.id}`}
                className="hover:text-ink-secondary transition-colors"
              >
                {book.category.name}
              </Link>
            </>
          )}
        </nav>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {(() => {
            const viewCount = String(book.viewCount ?? "0");
            const viewCountNum = parseInt(viewCount, 10);
            return (
              <>
                {book.category && (
                  <Badge variant="primary" size="md">
                    {book.category.name}
                  </Badge>
                )}
                {book.allowFreeDownload && (
                  <Badge variant="gold" size="md">
                    Free Download
                  </Badge>
                )}
                {book.isFeatured && (
                  <Badge variant="gold" size="md">
                    Featured
                  </Badge>
                )}
                {viewCountNum > 0 && (
                  <Badge variant="default" size="md">
                    <DownloadIconSmall />
                    {formatCount(viewCount)} downloads
                  </Badge>
                )}
              </>
            );
          })()}
        </div>

        {/* Title */}
        <h1
          id="book-title"
          className="font-display font-bold text-2xl sm:text-3xl text-ink-primary leading-tight tracking-snug"
        >
          {book.title}
        </h1>

        {/* Author byline */}
        {book.authorName && (
          <p className="text-md text-ink-tertiary">
            by{" "}
            <span className="font-semibold text-ink-secondary">
              {book.authorName}
            </span>
            {book.translator && (
              <span>
                {" "}
                · translated by{" "}
                <span className="font-medium">{book.translator}</span>
              </span>
            )}
          </p>
        )}

        {/* PDF viewer / access controls — client component */}
        {book.pdfAsset && (
          <PdfViewer
            bookId={book.id}
            bookTitle={book.title}
            allowFreeDownload={book.allowFreeDownload}
          />
        )}

        {/* Description */}
        {book.description && (
          <div className="prose-islamic">
            <h2 className="text-lg font-semibold text-ink-primary mb-3">
              About this book
            </h2>
            <p className="text-ink-secondary leading-loose whitespace-pre-wrap">
              {book.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {book.tags.length > 0 && (
          <div className="flex flex-wrap gap-2" aria-label="Topics">
            {book.tags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/library?tag=${tag.slug}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm border border-border-default text-ink-secondary hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {book.publishedAt && (
          <p className="text-xs text-ink-muted pt-4 border-t border-border-subtle">
            Added to library {formatDate(book.publishedAt)}
          </p>
        )}
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border-subtle last:border-0">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink-secondary text-right">{value}</dd>
    </div>
  );
}

function ChevronRight() {
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
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function DownloadIconSmall() {
  return (
    <svg
      width="12"
      height="12"
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
