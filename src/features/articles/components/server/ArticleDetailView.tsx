// src/features/articles/components/server/ArticleDetailView.tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@shared/components/ui/badge";
import {
  formatDate,
  formatScholarName,
  formatReadingTime,
  formatCount,
} from "@shared/lib/format";
import { renderArticleMdx } from "../../lib/render-article-mdx";
import type { ArticleDetail } from "../../types/article.types";

interface ArticleDetailViewProps {
  article: ArticleDetail;
}

export async function ArticleDetailView({ article }: ArticleDetailViewProps) {
  const scholarName = article.scholar
    ? formatScholarName(
        article.scholar.honorifics ?? null,
        article.scholar.name,
      )
    : null;

  // Compile MDX server-side — heading ids match extractToc() exactly
  // because both use the same slugger algorithm / rehype-slug.
  let renderedContent: React.ReactNode = null;
  if (article.content) {
    try {
      renderedContent = await renderArticleMdx(article.content);
    } catch {
      renderedContent = <p>{article.content}</p>;
    }
  }

  return (
    <article aria-labelledby="article-title" className="flex flex-col gap-6">
      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-ink-muted"
      >
        <Link href="/" className="hover:text-ink-secondary transition-colors">
          Home
        </Link>
        <ChevronRight />
        <Link
          href="/articles"
          className="hover:text-ink-secondary transition-colors"
        >
          Articles
        </Link>
        {article.category && (
          <>
            <ChevronRight />
            <Link
              href={`/articles?category=${article.category.id}`}
              className="hover:text-ink-secondary transition-colors"
            >
              {article.category.name}
            </Link>
          </>
        )}
        <ChevronRight />
        <span
          className="text-ink-tertiary line-clamp-1 max-w-[20ch]"
          aria-current="page"
        >
          {article.title}
        </span>
      </nav>

      {/* ── Category + meta badges ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {article.category && (
          <Badge variant="primary" size="md">
            {article.category.name}
          </Badge>
        )}
        <Badge variant="default" size="md">
          <ClockIcon />
          {formatReadingTime(article.readingTimeMins)}
        </Badge>
        {(typeof article.viewCount === "string"
          ? parseInt(article.viewCount, 10)
          : article.viewCount) > 0 && (
          <Badge variant="default" size="md">
            <EyeIcon />
            {formatCount(article.viewCount)} views
          </Badge>
        )}
        {article.isFeatured && (
          <Badge variant="gold" size="md">
            Featured
          </Badge>
        )}
      </div>

      {/* ── Title ───────────────────────────────────────────────────── */}
      <h1
        id="article-title"
        className="font-display font-bold text-2xl sm:text-3xl text-ink-primary leading-tight tracking-snug"
      >
        {article.title}
      </h1>

      {/* ── Excerpt ─────────────────────────────────────────────────── */}
      {article.excerpt && (
        <p className="text-md text-ink-tertiary leading-relaxed italic border-l-2 border-accent-700 pl-4">
          {article.excerpt}
        </p>
      )}

      {/* ── Cover image ─────────────────────────────────────────────── */}
      {article.coverAsset?.publicUrl && (
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-surface-muted shadow-lg">
          <Image
            src={article.coverAsset.publicUrl}
            alt={article.coverAsset.altText ?? article.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
        </div>
      )}

      {/* ── Scholar card ────────────────────────────────────────────── */}
      {article.scholar && (
        <Link
          href={`/scholars/${article.scholar.slug}`}
          className="flex items-center gap-4 p-4 rounded-xl border border-border-default hover:border-primary-200 hover:shadow-primary-sm transition-all duration-normal group w-fit"
          aria-label={`View profile of ${scholarName}`}
        >
          <div className="relative size-12 rounded-full overflow-hidden bg-primary-100 shrink-0 ring-2 ring-transparent group-hover:ring-primary-300 transition-all">
            {article.scholar.avatarAsset?.publicUrl ? (
              <Image
                src={article.scholar.avatarAsset.publicUrl}
                alt={scholarName ?? ""}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="absolute inset-0 bg-primary-700 flex items-center justify-center">
                <span className="font-display font-bold text-lg text-white">
                  {article.scholar.name[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-ink-primary group-hover:text-primary-700 transition-colors">
              {scholarName}
            </p>
            {article.scholar.nationality && (
              <p className="text-sm text-ink-muted">
                {article.scholar.nationality}
              </p>
            )}
          </div>
          <ChevronRight className="ml-2 text-ink-muted group-hover:text-primary-700 transition-colors" />
        </Link>
      )}

      {/* ── MDX content body ────────────────────────────────────────── */}
      {renderedContent && (
        <div className="prose-islamic max-w-none">{renderedContent}</div>
      )}

      {/* ── Tags ────────────────────────────────────────────────────── */}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2" aria-label="Topics">
          {article.tags.map(({ tag }) => (
            <Link
              key={tag.id}
              href={`/articles?tag=${tag.slug}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm border border-border-default text-ink-secondary hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* ── Published date + author ───────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-ink-muted pt-4 border-t border-border-subtle">
        {article.publishedAt && (
          <span>Published {formatDate(article.publishedAt)}</span>
        )}
        {article.author && <span>Edited by {article.author.name}</span>}
      </div>
    </article>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
