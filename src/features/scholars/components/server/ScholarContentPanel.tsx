// src/features/scholars/components/server/ScholarContentPanel.tsx
//
// Architecture note on tabs + SEO:
// We use CSS show/hide (not conditional rendering) so BOTH the lectures
// list and articles list are in the initial HTML. This means:
//   1. Search engines index all content without JS
//   2. No loading flash when switching tabs
//   3. No fetch waterfall on tab switch
//
// The ScholarContentTabs client component manages the active tab purely
// via CSS class toggling — it never fetches data.

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@shared/components/ui/badge";
import { ScholarContentTabs } from "../client/ScholarContentTabs";
import {
  formatDurationLong,
  formatRelativeDate,
  formatReadingTime,
} from "@shared/lib/format";
import type { ScholarContentResult } from "../../types/scholar.types";

interface ScholarContentPanelProps {
  content: ScholarContentResult;
  scholarSlug: string;
}

export function ScholarContentPanel({
  content,
  scholarSlug,
}: ScholarContentPanelProps) {
  const { lectures, articles, totalLectures, totalArticles } = content;
  const hasLectures = lectures.length > 0;
  const hasArticles = articles.length > 0;

  if (!hasLectures && !hasArticles) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-center">
        <p className="font-display font-semibold text-ink-primary text-lg">
          No content yet
        </p>
        <p className="text-ink-muted text-sm max-w-[36ch]">
          Lectures and articles by this scholar will appear here once published.
        </p>
      </div>
    );
  }

  return (
    <ScholarContentTabs
      totalLectures={totalLectures}
      totalArticles={totalArticles}
    >
      {/* ── Lectures panel ──────────────────────────────────────────── */}
      <div
        id="tab-panel-lectures"
        role="tabpanel"
        aria-labelledby="tab-lectures"
      >
        {hasLectures ? (
          <div className="flex flex-col gap-4">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              role="list"
            >
              {lectures.map((lecture) => (
                <LectureRow key={lecture.id} lecture={lecture} />
              ))}
            </div>

            {totalLectures >= 20 && (
              <div className="flex justify-center pt-4">
                <Link
                  href={`/lectures?scholar=${scholarSlug}`}
                  className="text-sm text-primary-700 hover:text-primary-800 font-medium flex items-center gap-1 transition-colors"
                >
                  View all {totalLectures} lectures
                  <ArrowRight />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <EmptyTab label="lectures" />
        )}
      </div>

      {/* ── Articles panel ──────────────────────────────────────────── */}
      <div
        id="tab-panel-articles"
        role="tabpanel"
        aria-labelledby="tab-articles"
      >
        {hasArticles ? (
          <div className="flex flex-col gap-4">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              role="list"
            >
              {articles.map((article) => (
                <ArticleRow key={article.id} article={article} />
              ))}
            </div>

            {totalArticles >= 20 && (
              <div className="flex justify-center pt-4">
                <Link
                  href={`/articles?scholar=${scholarSlug}`}
                  className="text-sm text-primary-700 hover:text-primary-800 font-medium flex items-center gap-1 transition-colors"
                >
                  View all {totalArticles} articles
                  <ArrowRight />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <EmptyTab label="articles" />
        )}
      </div>
    </ScholarContentTabs>
  );
}

// ─── Lecture card row ──────────────────────────────────────────────────────────

type LectureRow = ScholarContentResult["lectures"][number];

function LectureRow({ lecture }: { lecture: LectureRow }) {
  return (
    <Link
      href={`/lectures/${lecture.slug}`}
      role="listitem"
      className="card card-interactive flex gap-4 p-4 group"
      aria-label={lecture.title}
    >
      {/* Thumbnail */}
      <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-surface-muted shrink-0">
        {lecture.thumbnailAsset?.publicUrl ? (
          <Image
            src={lecture.thumbnailAsset.publicUrl}
            alt={lecture.thumbnailAsset.altText ?? lecture.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-slow"
            sizes="96px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-950 flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="rgba(255,255,255,0.3)"
              aria-hidden="true"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        )}
        {lecture.audioAsset?.durationSecs && (
          <span className="duration-pill absolute bottom-1 right-1 text-[9px] px-1 py-0">
            {formatDurationLong(lecture.audioAsset.durationSecs)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        {lecture.category && (
          <Badge
            variant="primary"
            size="sm"
            className="w-fit text-[10px] px-2 py-0"
          >
            {lecture.category.name}
          </Badge>
        )}
        <h3 className="font-display font-semibold text-sm text-ink-primary leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
          {lecture.title}
        </h3>
        {lecture.publishedAt && (
          <p className="text-xs text-ink-muted mt-auto">
            {formatRelativeDate(lecture.publishedAt)}
          </p>
        )}
      </div>
    </Link>
  );
}

// ─── Article card row ─────────────────────────────────────────────────────────

type ArticleRow = ScholarContentResult["articles"][number];

function ArticleRow({ article }: { article: ArticleRow }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      role="listitem"
      className="card card-interactive flex gap-4 p-4 group"
      aria-label={article.title}
    >
      {/* Cover */}
      {article.coverAsset?.publicUrl && (
        <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-surface-muted shrink-0">
          <Image
            src={article.coverAsset.publicUrl}
            alt={article.coverAsset.altText ?? article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-slow"
            sizes="80px"
          />
        </div>
      )}

      {/* Info */}
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        {article.category && (
          <Badge
            variant="default"
            size="sm"
            className="w-fit text-[10px] px-2 py-0"
          >
            {article.category.name}
          </Badge>
        )}
        <h3 className="font-display font-semibold text-sm text-ink-primary leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 mt-auto text-xs text-ink-muted">
          <span>{formatReadingTime(article.readingTimeMins)}</span>
          {article.publishedAt && (
            <>
              <span aria-hidden="true">·</span>
              <span>{formatRelativeDate(article.publishedAt)}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Empty tab ────────────────────────────────────────────────────────────────

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-12 gap-2 text-center">
      <p className="text-ink-muted text-sm">No {label} published yet.</p>
    </div>
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
