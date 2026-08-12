// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { db } from "@core/database/client";
import { lectures, articles, books, scholars } from "@core/database/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

// Revalidate sitemap daily
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dawahtube.com";

  // Fetch all published content slugs + last modified dates
  const [lectureRows, articleRows, bookRows, scholarRows] = await Promise.all([
    db
      .select({ slug: lectures.slug, updatedAt: lectures.updatedAt })
      .from(lectures)
      .where(and(eq(lectures.status, "published"), isNull(lectures.deletedAt)))
      .orderBy(desc(lectures.updatedAt))
      .limit(5000),

    db
      .select({ slug: articles.slug, updatedAt: articles.updatedAt })
      .from(articles)
      .where(and(eq(articles.status, "published"), isNull(articles.deletedAt)))
      .orderBy(desc(articles.updatedAt))
      .limit(5000),

    db
      .select({ slug: books.slug, updatedAt: books.updatedAt })
      .from(books)
      .where(and(eq(books.status, "published"), isNull(books.deletedAt)))
      .orderBy(desc(books.updatedAt))
      .limit(5000),

    db
      .select({ slug: scholars.slug, updatedAt: scholars.updatedAt })
      .from(scholars)
      .where(and(eq(scholars.isActive, true), isNull(scholars.deletedAt)))
      .orderBy(desc(scholars.updatedAt))
      .limit(1000),
  ]);

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/lectures`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/library`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/scholars`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Dynamic content routes
  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...lectureRows.map((row) => ({
      url: `${baseUrl}/lectures/${row.slug}`,
      lastModified: row.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...articleRows.map((row) => ({
      url: `${baseUrl}/articles/${row.slug}`,
      lastModified: row.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...bookRows.map((row) => ({
      url: `${baseUrl}/library/${row.slug}`,
      lastModified: row.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...scholarRows.map((row) => ({
      url: `${baseUrl}/scholars/${row.slug}`,
      lastModified: row.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
