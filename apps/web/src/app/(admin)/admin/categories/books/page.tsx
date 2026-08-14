// src/app/(admin)/admin/categories/books/page.tsx
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { bookCategories } from "@core/database/schema";
import { asc } from "drizzle-orm";
import { CategoryManager } from "@features/admin/components/client/CategoryManager";

export const metadata: Metadata = { title: "Book Categories" };
export const dynamic = "force-dynamic";

export default async function BookCategoriesPage() {
  const categories = await db.query.bookCategories.findMany({
    orderBy: [asc(bookCategories.position), asc(bookCategories.name)],
  });

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-primary">
          Book Categories
        </h1>
        <p className="text-ink-muted text-sm mt-1">
          Manage categories used to organise the library.
        </p>
      </div>
      <CategoryManager
        type="book"
        typeLabel="Book"
        initial={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          position: c.position,
          isActive: c.isActive,
        }))}
      />
    </div>
  );
}
