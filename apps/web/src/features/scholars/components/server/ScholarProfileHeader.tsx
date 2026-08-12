// src/features/scholars/components/server/ScholarProfileHeader.tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { formatScholarName, formatCount } from "@shared/lib/format";
import { renderArticleMdx } from "@features/articles/lib/render-article-mdx";
import type { ScholarProfile } from "../../types/scholar.types";

interface ScholarProfileHeaderProps {
  scholar: ScholarProfile;
}

export async function ScholarProfileHeader({
  scholar,
}: ScholarProfileHeaderProps) {
  const displayName = formatScholarName(
    scholar.honorifics ?? null,
    scholar.name,
  );

  // Biography stored as MDX — rendered server-side, zero client JS
  let biographyContent: React.ReactNode = null;
  if (scholar.biography) {
    try {
      biographyContent = await renderArticleMdx(scholar.biography);
    } catch {
      biographyContent = <p>{scholar.biography}</p>;
    }
  }

  return (
    <div className="relative">
      {/* ── Banner ─────────────────────────────────────────────────── */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-700 overflow-hidden">
        {scholar.bannerAsset?.publicUrl && (
          <Image
            src={scholar.bannerAsset.publicUrl}
            alt=""
            fill
            className="object-cover opacity-40"
            priority
            sizes="100vw"
            aria-hidden="true"
          />
        )}
        {/* Decorative Arabic watermark */}
        <p
          className="absolute inset-0 flex items-center justify-end pr-12 font-arabic text-[10rem] leading-none text-white/[0.04] select-none pointer-events-none"
          aria-hidden="true"
          dir="rtl"
          lang="ar"
        >
          علم
        </p>
      </div>

      {/* ── Profile info ────────────────────────────────────────────── */}
      <div className="container-site">
        <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end gap-5 pb-6 border-b border-border-default">
          {/* Avatar */}
          <div className="relative size-28 sm:size-36 rounded-2xl overflow-hidden bg-primary-100 border-4 border-surface-base shadow-lg shrink-0">
            {scholar.avatarAsset?.publicUrl ? (
              <Image
                src={scholar.avatarAsset.publicUrl}
                alt={displayName}
                fill
                className="object-cover"
                sizes="144px"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-primary-700 flex items-center justify-center">
                <span className="font-display font-bold text-5xl text-white">
                  {scholar.name[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-sm text-ink-muted"
            >
              <Link
                href="/"
                className="hover:text-ink-secondary transition-colors"
              >
                Home
              </Link>
              <ChevronRight />
              <Link
                href="/scholars"
                className="hover:text-ink-secondary transition-colors"
              >
                Scholars
              </Link>
              <ChevronRight />
              <span
                className="text-ink-tertiary truncate max-w-[20ch]"
                aria-current="page"
              >
                {displayName}
              </span>
            </nav>

            <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink-primary leading-tight">
              {displayName}
            </h1>

            {/* Arabic name */}
            {scholar.arabicName && (
              <p
                className="font-arabic text-arabic-lg text-primary-700 leading-relaxed"
                dir="rtl"
                lang="ar"
              >
                {scholar.arabicName}
              </p>
            )}

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-3">
              {scholar.nationality && (
                <Badge variant="default" size="sm">
                  {scholar.nationality}
                </Badge>
              )}
              {scholar.location && (
                <span className="text-sm text-ink-muted flex items-center gap-1">
                  <PinIcon />
                  {scholar.location}
                </span>
              )}
              {scholar.isFeatured && (
                <Badge variant="gold" size="sm">
                  Featured Scholar
                </Badge>
              )}
            </div>

            {/* Content counts */}
            <div
              className="flex gap-6 text-sm"
              role="list"
              aria-label="Content statistics"
            >
              {scholar.lectureCount > 0 && (
                <div role="listitem" className="flex flex-col">
                  <span className="font-display font-bold text-xl text-ink-primary">
                    {formatCount(scholar.lectureCount)}
                  </span>
                  <span className="text-ink-muted">Lectures</span>
                </div>
              )}
              {scholar.articleCount > 0 && (
                <div role="listitem" className="flex flex-col">
                  <span className="font-display font-bold text-xl text-ink-primary">
                    {formatCount(scholar.articleCount)}
                  </span>
                  <span className="text-ink-muted">Articles</span>
                </div>
              )}
            </div>
          </div>

          {/* External links */}
          <div className="flex gap-2 sm:self-end shrink-0">
            {scholar.websiteUrl && (
              <a
                href={scholar.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${displayName}'s website`}
                className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/90"
              >
                <GlobeIcon />
                Website
              </a>
            )}
            {scholar.twitterHandle && (
              <a
                href={`https://twitter.com/${scholar.twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${displayName} on X (Twitter)`}
                className="inline-flex items-center justify-center rounded-md hover:bg-secondary/10 px-2 py-2 text-sm font-medium transition-colors"
              >
                <TwitterIcon />
              </a>
            )}
          </div>
        </div>

        {/* Biography */}
        {biographyContent && (
          <div className="py-8 max-w-3xl">
            <h2 className="font-display font-bold text-xl text-ink-primary mb-4">
              Biography
            </h2>
            <div className="prose-islamic">{biographyContent}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Icon helpers ───────────────────────────────────────────────────────────────

function ChevronRight() {
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
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function PinIcon() {
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
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function GlobeIcon() {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10A15 15 0 0 1 12 2z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
