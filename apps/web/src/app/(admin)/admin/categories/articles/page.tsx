// src/app/(admin)/admin/categories/articles/page.tsx
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { articleCategories } from "@core/database/schema";
import { asc } from "drizzle-orm";
import { CategoryManager } from "@features/admin/components/client/CategoryManager";

export const metadata: Metadata = { title: "Article Categories" };
export const dynamic = "force-dynamic";

export default async function ArticleCategoriesPage() {
  const categories = await db.query.articleCategories.findMany({
    orderBy: [asc(articleCategories.position), asc(articleCategories.name)],
  });

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-primary">
          Article Categories
        </h1>
        <p className="text-ink-muted text-sm mt-1">
          Manage categories used to organise articles.
        </p>
      </div>
      <CategoryManager
        type="article"
        typeLabel="Article"
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
