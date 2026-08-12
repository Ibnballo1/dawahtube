// src/app/(admin)/admin/articles/new/page.tsx
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { scholars, articleCategories } from "@core/database/schema";
import { eq, asc } from "drizzle-orm";
import { ArticleForm } from "@features/admin/components/client/forms/ArticleForm";

export const metadata: Metadata = { title: "New Article" };

export default async function NewArticlePage() {
  const [scholarList, categoryList] = await Promise.all([
    db.query.scholars.findMany({
      where: (s) => eq(s.isActive, true),
      columns: { id: true, name: true, honorifics: true },
      orderBy: [asc(scholars.name)],
    }),
    db.query.articleCategories.findMany({
      where: (c) => eq(c.isActive, true),
      columns: { id: true, name: true },
      orderBy: [asc(articleCategories.name)],
    }),
  ]);

  return <ArticleForm scholars={scholarList} categories={categoryList} />;
}
