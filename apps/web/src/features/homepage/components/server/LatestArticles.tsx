// src/features/homepage/components/server/LatestArticles.tsx
import Link from "next/link";
import Image from "next/image";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { SectionHeader } from "@shared/components/ui/SectionHeader";
import {
  formatDate,
  formatReadingTime,
  formatScholarName,
} from "@shared/lib/format";
import { getLatestArticles } from "../../queries/get-homepage-data";

export async function LatestArticles() {
  const articles = await getLatestArticles();
  if (articles.length === 0) return null;

  return (
    <section
      className="section bg-surface-base"
      aria-labelledby="latest-articles-heading"
    >
      <div className="container-site flex flex-col gap-10">
        <SectionHeader
          overline="Latest Articles"
          heading="Read, reflect and benefit"
          description="Written insights and explanations from our scholars — designed for reading, not skimming."
          headingAs="h2"
          action={
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-sm text-primary-700 hover:underline"
            >
              View all <ArrowRight />
            </Link>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}

type ArticleData = Awaited<ReturnType<typeof getLatestArticles>>[number];

function ArticleCard({ article }: { article: ArticleData }) {
  return (
    <article className="card card-interactive flex flex-col group">
      {/* Cover image */}
      {article.coverAsset?.publicUrl && (
        <Link
          href={`/articles/${article.slug}`}
          className="block relative aspect-[16/7] overflow-hidden rounded-t-xl bg-surface-muted"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={article.coverAsset.publicUrl}
            alt={article.coverAsset.altText ?? article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-slow"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>
      )}

      <div className="flex flex-col flex-1 gap-3 p-5">
        {article.category && (
          <Badge variant="default" size="sm" className="w-fit">
            {article.category.name}
          </Badge>
        )}

        <h3 className="font-display font-bold text-base text-ink-primary leading-snug line-clamp-2">
          <Link
            href={`/articles/${article.slug}`}
            className="hover:text-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 rounded-sm"
          >
            {article.title}
          </Link>
        </h3>

        {article.excerpt && (
          <p className="text-sm text-ink-tertiary line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-subtle text-xs text-ink-muted">
          {article.scholar && (
            <span>
              {formatScholarName(
                article.scholar.honorifics ?? null,
                article.scholar.name,
              )}
            </span>
          )}
          <span>{formatReadingTime(article.readingTimeMins)}</span>
        </div>
      </div>
    </article>
  );
}

function ArrowRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
