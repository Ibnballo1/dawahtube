// src/features/lectures/components/server/LectureSeriesPanel.tsx
//
// Shown on the lecture detail page when the lecture belongs to a series.
// Renders the full episode list with the current episode highlighted.
// Uses CSS show/hide — no client JS needed.

import Link from "next/link";
import Image from "next/image";
import { db } from "@core/database/client";
import { seriesItems, lectures } from "@core/database/schema";
import { eq, and, isNull, asc } from "drizzle-orm";
import { Badge } from "@shared/components/ui/badge";
import { formatDurationLong } from "@shared/lib/format";

interface LectureSeriesPanelProps {
  seriesId: string;
  seriesSlug: string;
  seriesTitle: string;
  currentLectureId: string;
}

export async function LectureSeriesPanel({
  seriesId,
  seriesSlug,
  seriesTitle,
  currentLectureId,
}: LectureSeriesPanelProps) {
  // Fetch series items and include the related published lecture
  const items = await db.query.seriesItems.findMany({
    where: eq(seriesItems.seriesId, seriesId),
    orderBy: [asc(seriesItems.position)],
    with: {
      lecture: {
        with: {
          thumbnailAsset: { columns: { publicUrl: true, altText: true } },
          audioAsset: { columns: { durationSecs: true } },
        },
      },
    },
  });

  // Filter down to valid, non-deleted, published lectures
  const episodes = items
    .map((item) => item.lecture)
    .filter(
      (lecture): lecture is NonNullable<typeof lecture> =>
        lecture !== null &&
        lecture.status === "published" &&
        lecture.deletedAt === null,
    );

  if (episodes.length === 0) return null;

  const currentIdx = episodes.findIndex((e) => e.id === currentLectureId);
  const prevEp = currentIdx > 0 ? episodes[currentIdx - 1] : null;
  const nextEp =
    currentIdx < episodes.length - 1 ? episodes[currentIdx + 1] : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Series header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="label-overline">Part of a series</span>
          <Link
            href={`/series/${seriesSlug}`}
            className="font-display font-bold text-lg text-ink-primary hover:text-primary-700 transition-colors"
          >
            {seriesTitle}
          </Link>
          <span className="text-xs text-ink-muted">
            Episode {currentIdx + 1} of {episodes.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="hidden sm:flex flex-col items-end gap-1">
          <span className="text-xs text-ink-muted">
            {currentIdx + 1}/{episodes.length}
          </span>
          <div className="w-24 h-1.5 bg-border-default rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-700 rounded-full transition-all"
              style={{
                width: `${((currentIdx + 1) / episodes.length) * 100}%`,
              }}
              role="progressbar"
              aria-valuenow={currentIdx + 1}
              aria-valuemin={1}
              aria-valuemax={episodes.length}
              aria-label={`Episode ${currentIdx + 1} of ${episodes.length}`}
            />
          </div>
        </div>
      </div>

      {/* Prev / Next navigation */}
      {(prevEp || nextEp) && (
        <div className="grid grid-cols-2 gap-3">
          {prevEp ? (
            <Link
              href={`/lectures/${prevEp.slug}`}
              className="card p-3 flex items-center gap-3 group hover:border-border-emphasis transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-ink-muted shrink-0"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-ink-muted uppercase tracking-wide">
                  Previous
                </span>
                <span className="text-xs font-medium text-ink-secondary group-hover:text-primary-700 transition-colors line-clamp-1">
                  {prevEp.title}
                </span>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextEp ? (
            <Link
              href={`/lectures/${nextEp.slug}`}
              className="card p-3 flex items-center gap-3 group hover:border-border-emphasis transition-colors text-right justify-end"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-ink-muted uppercase tracking-wide">
                  Next
                </span>
                <span className="text-xs font-medium text-ink-secondary group-hover:text-primary-700 transition-colors line-clamp-1">
                  {nextEp.title}
                </span>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-ink-muted shrink-0"
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}

      {/* Full episode list */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border-subtle bg-surface-subtle flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wide">
            All episodes
          </span>
          <Link
            href={`/series/${seriesSlug}`}
            className="text-xs text-primary-700 hover:text-primary-800 font-medium transition-colors"
          >
            View series →
          </Link>
        </div>

        <div className="divide-y divide-border-subtle max-h-96 overflow-y-auto">
          {episodes.map((ep, idx) => {
            const isCurrent = ep.id === currentLectureId;
            const duration =
              ep.durationSecs ?? ep.audioAsset?.durationSecs ?? null;

            return (
              <Link
                key={ep.id}
                href={`/lectures/${ep.slug}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`flex items-center gap-3 px-4 py-3 group transition-colors ${
                  isCurrent
                    ? "bg-primary-50 border-l-2 border-primary-700"
                    : "hover:bg-surface-subtle"
                }`}
              >
                {/* Position / playing indicator */}
                <div className="size-7 rounded-full flex items-center justify-center shrink-0">
                  {isCurrent ? (
                    <div className="waveform-bars scale-75">
                      <span style={{ height: "8px" }} />
                      <span style={{ height: "14px" }} />
                      <span style={{ height: "10px" }} />
                      <span style={{ height: "14px" }} />
                      <span style={{ height: "8px" }} />
                    </div>
                  ) : (
                    <span
                      className={`text-xs font-bold ${
                        isCurrent ? "text-primary-700" : "text-ink-muted"
                      }`}
                    >
                      {idx + 1}
                    </span>
                  )}
                </div>

                {/* Thumbnail */}
                <div className="relative size-10 rounded-md overflow-hidden bg-surface-muted shrink-0 hidden sm:block">
                  {ep.thumbnailAsset?.publicUrl ? (
                    <Image
                      src={ep.thumbnailAsset.publicUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-primary-900 flex items-center justify-center">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="rgba(255,255,255,0.5)"
                        aria-hidden="true"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Title */}
                <span
                  className={`flex-1 text-sm line-clamp-1 transition-colors ${
                    isCurrent
                      ? "font-semibold text-primary-700"
                      : "font-medium text-ink-secondary group-hover:text-ink-primary"
                  }`}
                >
                  {ep.title}
                </span>

                {/* Duration */}
                {duration && (
                  <span className="text-xs text-ink-muted shrink-0 hidden sm:block">
                    {formatDurationLong(duration)}
                  </span>
                )}

                {/* Current badge */}
                {isCurrent && (
                  <Badge variant="primary" size="sm" className="shrink-0">
                    Playing
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
