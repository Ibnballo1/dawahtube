// src/app/(admin)/admin/categories/lectures/page.tsx
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { lectureCategories } from "@core/database/schema";
import { asc } from "drizzle-orm";
import { CategoryManager } from "@features/admin/components/client/CategoryManager";

export const metadata: Metadata = { title: "Lecture Categories" };
export const dynamic = "force-dynamic";

export default async function LectureCategoriesPage() {
  const categories = await db.query.lectureCategories.findMany({
    orderBy: [asc(lectureCategories.position), asc(lectureCategories.name)],
  });

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-primary">
          Lecture Categories
        </h1>
        <p className="text-ink-muted text-sm mt-1">
          Manage categories used to organise lectures. Changes apply
          immediately.
        </p>
      </div>
      <CategoryManager
        type="lecture"
        typeLabel="Lecture"
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
