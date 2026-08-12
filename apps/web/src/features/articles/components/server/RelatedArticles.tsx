// src/features/articles/components/server/RelatedArticles.tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@shared/components/ui/badge";
import {
  formatScholarName,
  formatReadingTime,
  formatRelativeDate,
} from "@shared/lib/format";

type RelatedArticleRow = {
  id: string;
  slug: string;
  title: string;
  readingTimeMins: number;
  publishedAt: Date | null;
  viewCount: string;
  scholar: {
    id: string;
    slug: string;
    name: string;
    honorifics: string | null;
    avatarAsset: { publicUrl: string | null; altText: string | null } | null;
  } | null;
  coverAsset: { publicUrl: string | null; altText: string | null } | null;
};

interface RelatedArticlesProps {
  articles: RelatedArticleRow[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <div className="flex flex-col gap-6" aria-label="Related articles">
      <h2 className="font-display font-bold text-xl text-ink-primary">
        Related articles
      </h2>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        role="list"
      >
        {articles.map((article) => (
          <RelatedArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}

function RelatedArticleCard({ article }: { article: RelatedArticleRow }) {
  const scholarName = article.scholar
    ? formatScholarName(
        article.scholar.honorifics ?? null,
        article.scholar.name,
      )
    : null;

  return (
    <article
      role="listitem"
      className="card card-interactive flex flex-col group"
    >
      {article.coverAsset?.publicUrl && (
        <Link
          href={`/articles/${article.slug}`}
          className="block relative aspect-[16/9] overflow-hidden rounded-t-xl bg-surface-muted"
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

      <div className="flex flex-col flex-1 gap-2 p-4">
        <h3 className="font-display font-bold text-sm text-ink-primary leading-snug line-clamp-2">
          <Link
            href={`/articles/${article.slug}`}
            className="hover:text-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 rounded-sm"
          >
            {article.title}
          </Link>
        </h3>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-subtle text-xs text-ink-muted">
          {scholarName && <span className="line-clamp-1">{scholarName}</span>}
          <span className="shrink-0">
            {formatReadingTime(article.readingTimeMins)}
          </span>
        </div>
      </div>
    </article>
  );
}
