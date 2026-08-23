// src/app/(main)/series/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { series, seriesItems } from "@core/database/schema";
import { eq, and, isNull, asc } from "drizzle-orm";
import { Badge } from "@shared/components/ui/badge";
import {
  formatScholarName,
  formatCount,
  formatDurationLong,
  formatRelativeDate,
} from "@shared/lib/format";

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await db
    .select({ slug: series.slug })
    .from(series)
    .where(and(eq(series.status, "published"), isNull(series.deletedAt)));
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = await db.query.series.findFirst({
    where: and(
      eq(series.slug, slug),
      eq(series.status, "published"),
      isNull(series.deletedAt),
    ),
    columns: { title: true, description: true },
  });
  if (!s) return { title: "Series not found" };
  return {
    title: s.title,
    description: s.description ?? undefined,
  };
}

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const seriesRow = await db.query.series.findFirst({
    where: and(
      eq(series.slug, slug),
      eq(series.status, "published"),
      isNull(series.deletedAt),
    ),
    with: {
      scholar: {
        columns: {
          id: true,
          slug: true,
          name: true,
          honorifics: true,
          arabicName: true,
        },
        with: { avatarAsset: { columns: { publicUrl: true } } },
      },
      coverAsset: { columns: { publicUrl: true, altText: true } },
    },
  });

  if (!seriesRow) notFound();

  // Fetch ordered episodes via seriesItems join table
  const rawItems = await db.query.seriesItems.findMany({
    where: eq(seriesItems.seriesId, seriesRow.id),
    orderBy: [asc(seriesItems.position)],
    with: {
      lecture: {
        with: {
          thumbnailAsset: { columns: { publicUrl: true, altText: true } },
          audioAsset: { columns: { id: true, durationSecs: true } },
        },
      },
    },
  });

  const episodes = rawItems
    .map((item) => item.lecture)
    .filter(
      (lecture): lecture is NonNullable<typeof lecture> =>
        lecture !== null &&
        lecture.status === "published" &&
        lecture.deletedAt === null,
    );

  const displayName = seriesRow.scholar
    ? formatScholarName(
        seriesRow.scholar.honorifics ?? null,
        seriesRow.scholar.name,
      )
    : null;

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Series header */}
      <div className="bg-surface-subtle border-b border-border-default">
        <div className="container-site py-10">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Thumbnail */}
            <div className="relative w-full sm:w-48 aspect-video sm:aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary-800 to-primary-950 shrink-0">
              {seriesRow.coverAsset?.publicUrl ? (
                <Image
                  src={seriesRow.coverAsset.publicUrl}
                  alt={seriesRow.coverAsset.altText ?? seriesRow.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 640px) 100vw, 192px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="rgba(255,255,255,0.2)"
                    aria-hidden="true"
                  >
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              {/* Breadcrumb */}
              <nav
                className="flex items-center gap-2 text-sm text-ink-muted"
                aria-label="Breadcrumb"
              >
                <Link
                  href="/"
                  className="hover:text-ink-secondary transition-colors"
                >
                  Home
                </Link>
                <ChevronRight />
                <Link
                  href="/series"
                  className="hover:text-ink-secondary transition-colors"
                >
                  Series
                </Link>
                <ChevronRight />
                <span
                  className="text-ink-tertiary truncate"
                  aria-current="page"
                >
                  {seriesRow.title}
                </span>
              </nav>

              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">
                  Series
                </Badge>
                <span className="text-xs text-ink-muted">
                  {formatCount(episodes.length)} episodes
                </span>
              </div>

              <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink-primary leading-tight">
                {seriesRow.title}
              </h1>

              {seriesRow.description && (
                <p className="text-ink-tertiary leading-relaxed text-sm sm:text-base max-w-2xl">
                  {seriesRow.description}
                </p>
              )}

              {/* Scholar */}
              {seriesRow.scholar && displayName && (
                <Link
                  href={`/scholars/${seriesRow.scholar.slug}`}
                  className="flex items-center gap-2.5 w-fit group mt-1"
                >
                  {seriesRow.scholar.avatarAsset?.publicUrl ? (
                    <Image
                      src={seriesRow.scholar.avatarAsset.publicUrl}
                      alt={displayName}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-primary-700 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {seriesRow.scholar.name[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-ink-secondary group-hover:text-primary-700 transition-colors">
                      {displayName}
                    </span>
                    {seriesRow.scholar.arabicName && (
                      <span
                        className="text-xs font-arabic text-ink-muted"
                        dir="rtl"
                        lang="ar"
                      >
                        {seriesRow.scholar.arabicName}
                      </span>
                    )}
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Episode list */}
      <div className="container-site py-10 max-w-4xl">
        <h2 className="font-display font-bold text-xl text-ink-primary mb-6">
          Episodes ({episodes.length})
        </h2>

        {episodes.length === 0 ? (
          <div className="text-center py-16 text-ink-muted text-sm">
            No episodes published yet. Check back soon.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {episodes.map((episode, idx) => (
              <EpisodeRow
                key={episode.id}
                episode={episode}
                position={idx + 1}
                total={episodes.length}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Episode row ──────────────────────────────────────────────────────────────

type Episode = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  durationSecs: number | null;
  publishedAt: Date | null;
  thumbnailAsset: { publicUrl: string | null; altText: string | null } | null;
  audioAsset: { id: string; durationSecs: number | null } | null;
};

function EpisodeRow({
  episode,
  position,
  total,
}: {
  episode: Episode;
  position: number;
  total: number;
}) {
  const duration =
    episode.durationSecs ?? episode.audioAsset?.durationSecs ?? null;

  return (
    <Link
      href={`/lectures/${episode.slug}`}
      className="card card-interactive flex gap-4 p-4 group"
      aria-label={`Episode ${position}: ${episode.title}`}
    >
      {/* Position number */}
      <div className="size-10 rounded-xl bg-surface-subtle border border-border-default flex items-center justify-center shrink-0 group-hover:bg-primary-50 group-hover:border-primary-200 transition-colors">
        <span className="font-display font-bold text-sm text-ink-tertiary group-hover:text-primary-700 transition-colors">
          {position}
        </span>
      </div>

      {/* Thumbnail */}
      <div className="relative w-20 aspect-video rounded-lg overflow-hidden bg-surface-muted shrink-0 hidden sm:block">
        {episode.thumbnailAsset?.publicUrl ? (
          <Image
            src={episode.thumbnailAsset.publicUrl}
            alt={episode.thumbnailAsset.altText ?? episode.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-slow"
            sizes="80px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-950 flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="rgba(255,255,255,0.4)"
              aria-hidden="true"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <h3 className="font-display font-semibold text-sm text-ink-primary group-hover:text-primary-700 transition-colors line-clamp-2 leading-snug">
          {episode.title}
        </h3>

        {episode.description && (
          <p className="text-xs text-ink-muted line-clamp-1">
            {episode.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-ink-muted mt-auto">
          {duration && (
            <span className="flex items-center gap-1">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {formatDurationLong(duration)}
            </span>
          )}
          {episode.publishedAt && (
            <span>{formatRelativeDate(episode.publishedAt)}</span>
          )}
        </div>
      </div>

      {/* Progress indicator (position / total) */}
      <div className="flex flex-col items-end justify-center shrink-0 hidden md:flex">
        <span className="text-xs text-ink-muted">
          {position} / {total}
        </span>
      </div>
    </Link>
  );
}

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
