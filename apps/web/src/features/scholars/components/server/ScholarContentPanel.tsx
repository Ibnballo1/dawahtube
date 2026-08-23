// src/features/scholars/components/server/ScholarContentPanel.tsx
import Link from "next/link";
import Image from "next/image";
import { db } from "@core/database/client";
import { series } from "@core/database/schema";
import { Badge } from "@shared/components/ui/badge";
import { ScholarContentTabs } from "../client/ScholarContentTabs";
import {
  formatDurationLong,
  formatRelativeDate,
  formatReadingTime,
  formatCount,
} from "@shared/lib/format";
import { eq, and, isNull, desc } from "drizzle-orm";
import type { ScholarContentResult } from "../../types/scholar.types";

interface ScholarContentPanelProps {
  content: ScholarContentResult;
  scholarSlug: string;
  scholarId: string;
}

export async function ScholarContentPanel({
  content,
  scholarSlug,
  scholarId,
}: ScholarContentPanelProps) {
  const { lectures, articles, totalLectures, totalArticles } = content;

  const scholarSeries = await db.query.series.findMany({
    where: and(
      eq(series.scholarId, scholarId),
      eq(series.status, "published"),
      isNull(series.deletedAt),
    ),
    orderBy: [desc(series.createdAt)],
    with: { coverAsset: { columns: { publicUrl: true, altText: true } } },
  });

  const hasLectures = lectures.length > 0;
  const hasArticles = articles.length > 0;
  const hasSeries = scholarSeries.length > 0;

  if (!hasLectures && !hasArticles && !hasSeries) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-center">
        <p className="font-display font-semibold text-ink-primary text-lg">
          No content yet
        </p>
        <p className="text-ink-muted text-sm max-w-[36ch]">
          Content will appear here once published.
        </p>
      </div>
    );
  }

  return (
    <ScholarContentTabs
      totalLectures={totalLectures}
      totalArticles={totalArticles}
      totalSeries={scholarSeries.length}
    >
      {/* Lectures panel */}
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
              {lectures.map((l) => (
                <Link
                  key={l.id}
                  href={`/lectures/${l.slug}`}
                  role="listitem"
                  className="card card-interactive flex gap-4 p-4 group"
                >
                  <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-surface-muted shrink-0">
                    {l.thumbnailAsset?.publicUrl ? (
                      <Image
                        src={l.thumbnailAsset.publicUrl}
                        alt={l.thumbnailAsset.altText ?? l.title}
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
                    {l.audioAsset?.durationSecs && (
                      <span className="duration-pill absolute bottom-1 right-1 text-[9px] px-1 py-0">
                        {formatDurationLong(l.audioAsset.durationSecs)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    {l.category && (
                      <Badge
                        variant="primary"
                        size="sm"
                        className="w-fit text-[10px] px-2 py-0"
                      >
                        {l.category.name}
                      </Badge>
                    )}
                    <h3 className="font-display font-semibold text-sm text-ink-primary leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
                      {l.title}
                    </h3>
                    {l.publishedAt && (
                      <p className="text-xs text-ink-muted mt-auto">
                        {formatRelativeDate(l.publishedAt)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            {totalLectures >= 20 && (
              <div className="flex justify-center pt-4">
                <Link
                  href={`/lectures?scholar=${scholarSlug}`}
                  className="text-sm text-primary-700 hover:text-primary-800 font-medium flex items-center gap-1 transition-colors"
                >
                  View all {totalLectures} lectures →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <EmptyTab label="lectures" />
        )}
      </div>

      {/* Articles panel */}
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
              {articles.map((a) => (
                <Link
                  key={a.id}
                  href={`/articles/${a.slug}`}
                  role="listitem"
                  className="card card-interactive flex gap-4 p-4 group"
                >
                  {a.coverAsset?.publicUrl && (
                    <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-surface-muted shrink-0">
                      <Image
                        src={a.coverAsset.publicUrl}
                        alt={a.coverAsset.altText ?? a.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-slow"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    {a.category && (
                      <Badge
                        variant="default"
                        size="sm"
                        className="w-fit text-[10px] px-2 py-0"
                      >
                        {a.category.name}
                      </Badge>
                    )}
                    <h3 className="font-display font-semibold text-sm text-ink-primary leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
                      {a.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-auto text-xs text-ink-muted">
                      <span>{formatReadingTime(a.readingTimeMins)}</span>
                      {a.publishedAt && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{formatRelativeDate(a.publishedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {totalArticles >= 20 && (
              <div className="flex justify-center pt-4">
                <Link
                  href={`/articles?scholar=${scholarSlug}`}
                  className="text-sm text-primary-700 hover:text-primary-800 font-medium flex items-center gap-1 transition-colors"
                >
                  View all {totalArticles} articles →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <EmptyTab label="articles" />
        )}
      </div>

      {/* Series panel */}
      <div id="tab-panel-series" role="tabpanel" aria-labelledby="tab-series">
        {hasSeries ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            role="list"
          >
            {scholarSeries.map((s) => (
              <Link
                key={s.id}
                href={`/series/${s.slug}`}
                role="listitem"
                className="card card-interactive flex flex-col group"
              >
                <div className="relative aspect-video bg-gradient-to-br from-primary-800 to-primary-950 overflow-hidden">
                  {s.coverAsset?.publicUrl ? (
                    <Image
                      src={s.coverAsset.publicUrl}
                      alt={s.coverAsset.altText ?? s.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-slow"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="rgba(255,255,255,0.15)"
                        aria-hidden="true"
                      >
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                      </svg>
                    </div>
                  )}
                  <span className="duration-pill absolute bottom-2 right-2">
                    {formatCount(s.itemCount ?? 0)} episodes
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-1.5">
                  <h3 className="font-display font-semibold text-sm text-ink-primary leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
                    {s.title}
                  </h3>
                  {s.description && (
                    <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyTab label="series" />
        )}
      </div>
    </ScholarContentTabs>
  );
}

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-12 gap-2 text-center">
      <p className="text-ink-muted text-sm">No {label} published yet.</p>
    </div>
  );
}
