// src/app/(admin)/admin/library/new/page.tsx
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { bookCategories } from "@core/database/schema";
import { eq, asc } from "drizzle-orm";
import { BookForm } from "@features/admin/components/client/forms/BookForm";

export const metadata: Metadata = { title: "New Book" };

export default async function NewBookPage() {
  const categoryList = await db.query.bookCategories.findMany({
    where: (c) => eq(c.isActive, true),
    columns: { id: true, name: true },
    orderBy: [asc(bookCategories.name)],
  });

  return <BookForm categories={categoryList} />;
}
