// src/app/(admin)/admin/articles/[id]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { scholars, articleCategories } from "@core/database/schema";
import { eq, asc } from "drizzle-orm";
import { ArticleForm } from "@features/admin/components/client/forms/ArticleForm";

export const metadata: Metadata = { title: "Edit Article" };

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, scholarList, categoryList] = await Promise.all([
    db.query.articles.findFirst({ where: (a) => eq(a.id, id) }),
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

  if (!article) notFound();

  return (
    <ArticleForm
      article={{
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        scholarId: article.scholarId,
        categoryId: article.categoryId,
        status: article.status,
        defaultLanguage: article.defaultLanguage,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
      }}
      scholars={scholarList}
      categories={categoryList}
    />
  );
}
