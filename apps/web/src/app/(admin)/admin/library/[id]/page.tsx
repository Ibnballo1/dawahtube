// src/app/(admin)/admin/library/[id]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { bookCategories } from "@core/database/schema";
import { eq, asc } from "drizzle-orm";
import { BookForm } from "@features/admin/components/client/forms/BookForm";

export const metadata: Metadata = { title: "Edit Book" };

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [book, categoryList] = await Promise.all([
    db.query.books.findFirst({
      where: (b) => eq(b.id, id),
      with: {
        pdfAsset: { columns: { id: true } },
        coverAsset: { columns: { id: true, publicUrl: true } },
      },
    }),
    db.query.bookCategories.findMany({
      where: (c) => eq(c.isActive, true),
      columns: { id: true, name: true },
      orderBy: [asc(bookCategories.name)],
    }),
  ]);

  if (!book) notFound();

  return (
    <BookForm
      book={{
        id: book.id,
        title: book.title,
        description: book.description,
        authorName: book.authorName,
        translator: book.translator,
        publishYear: book.publishYear,
        pageCount: book.pageCount,
        language: book.language,
        allowFreeDownload: book.allowFreeDownload,
        status: book.status,
        defaultLanguage: book.defaultLanguage,
        metaTitle: book.metaTitle,
        metaDescription: book.metaDescription,
        categoryId: book.categoryId,
        pdfAssetId: book.pdfAsset?.id ?? null,
        coverAssetId: book.coverAsset?.id ?? null,
        coverUrl: book.coverAsset?.publicUrl ?? null,
      }}
      categories={categoryList}
    />
  );
}
