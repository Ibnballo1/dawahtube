// src/app/articles/[slug]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getArticleBySlug,
  getAllPublishedArticleSlugs,
  getRelatedArticles,
} from "@features/articles/queries/article.queries";
import { extractToc } from "@/features/articles/lib/extract-toc";
import { ArticleDetailView } from "@/features/articles/components/server/ArticleDetailView";
import { TableOfContents } from "@/features/articles/components/client/TableOfContents";
import { RelatedArticles } from "@/features/articles/components/server/RelatedArticles";
import { ArticleViewTracker } from "@/features/articles/components/client/ArticleViewTracker";
import { ArticleCardSkeleton, Skeleton } from "@shared/components/ui/skeleton";
import { env } from "@core/config/env";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllPublishedArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };

  const scholarName = article.scholar
    ? [article.scholar.honorifics, article.scholar.name]
        .filter(Boolean)
        .join(" ")
    : undefined;

  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.excerpt ?? undefined,
    openGraph: {
      title: article.metaTitle ?? article.title,
      description: article.metaDescription ?? article.excerpt ?? undefined,
      type: "article",
      url: `/articles/${article.slug}`,
      publishedTime: article.publishedAt?.toISOString(),
      authors: scholarName ? [scholarName] : undefined,
      images: article.coverAsset?.publicUrl
        ? [{ url: article.coverAsset.publicUrl, alt: article.title }]
        : undefined,
    },
    other: {
      "article:author": scholarName ?? "",
      "article:section": article.category?.name ?? "",
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Extract TOC from raw MDX BEFORE compilation — determines layout
  const toc = article.content ? extractToc(article.content) : [];
  const hasToc = toc.length >= 2; // Only show TOC if there's meaningful structure

  const relatedArticles = await getRelatedArticles(
    article.id,
    article.categoryId ?? null,
    article.scholarId ?? null,
  );

  const scholarName = article.scholar
    ? [article.scholar.honorifics, article.scholar.name]
        .filter(Boolean)
        .join(" ")
    : undefined;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    url: `${env.NEXT_PUBLIC_APP_URL}/articles/${article.slug}`,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: article.scholar
      ? {
          "@type": "Person",
          name: scholarName,
          url: `${env.NEXT_PUBLIC_APP_URL}/scholars/${article.scholar.slug}`,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Da'wahTube",
    },
    image: article.coverAsset?.publicUrl,
    wordCount: article.wordCount,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <ArticleViewTracker articleId={article.id} />

      <div className="min-h-screen bg-surface-base">
        <div className="container-site py-8 lg:py-12">
          <div
            className={
              hasToc
                ? "grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8 xl:gap-12"
                : "grid grid-cols-1 max-w-3xl mx-auto gap-8"
            }
          >
            {/* ── Main article column ─────────────────────────────── */}
            <div className="min-w-0">
              <ArticleDetailView article={article} />
            </div>

            {/* ── Sticky TOC sidebar (only if headings exist) ──────── */}
            {hasToc && (
              <aside aria-label="Table of contents" className="hidden lg:block">
                <div className="sticky top-24">
                  <TableOfContents headings={toc} />
                </div>
              </aside>
            )}
          </div>

          {/* ── Related articles — full width below ─────────────── */}
          <div className="mt-16 max-w-5xl mx-auto">
            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ArticleCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <RelatedArticles
                articles={relatedArticles.map((a) => ({
                  ...a,
                  viewCount: String(a.viewCount),
                }))}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
