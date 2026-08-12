// src/app/library/[slug]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getBookBySlug,
  getAllPublishedBookSlugs,
  getRelatedBooks,
} from "@features/library/queries/library.queries";
import { BookDetailView } from "@/features/library/components/server/BookDetailView";
import { RelatedBooks } from "@/features/library/components/server/RelatedBooks";
import { BookCardSkeleton } from "@/shared/components/ui/skeleton";
import { env } from "@/core/config/env";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllPublishedBookSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return { title: "Book not found" };

  return {
    title: book.metaTitle ?? book.title,
    description: book.metaDescription ?? book.description ?? undefined,
    openGraph: {
      title: book.metaTitle ?? book.title,
      description: book.metaDescription ?? book.description ?? undefined,
      type: "book",
      url: `/library/${book.slug}`,
      images: book.coverAsset?.publicUrl
        ? [{ url: book.coverAsset.publicUrl, alt: book.title }]
        : undefined,
    },
    other: {
      "book:author": book.authorName ?? "",
    },
  };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) notFound();

  const relatedBooks = await getRelatedBooks(book.id, book.categoryId ?? null);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    description: book.description,
    url: `${env.NEXT_PUBLIC_APP_URL}/library/${book.slug}`,
    author: book.authorName
      ? { "@type": "Person", name: book.authorName }
      : undefined,
    translator: book.translator
      ? { "@type": "Person", name: book.translator }
      : undefined,
    datePublished: book.publishYear ? String(book.publishYear) : undefined,
    numberOfPages: book.pageCount ?? undefined,
    inLanguage: book.language,
    image: book.coverAsset?.publicUrl,
    isAccessibleForFree: book.allowFreeDownload,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-surface-base">
        <div className="container-site py-8 lg:py-12">
          <BookDetailView book={book} />

          <div className="mt-16 max-w-5xl mx-auto">
            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <BookCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <RelatedBooks books={relatedBooks} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
