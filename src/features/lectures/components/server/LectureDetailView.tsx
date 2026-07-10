// src/features/lectures/components/server/LectureDetailView.tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import {
  formatDate,
  formatDurationLong,
  formatScholarName,
  formatCount,
} from "@shared/lib/format";
import { AudioPlayer } from "../client/AudioPlayer";
import type { LectureDetail } from "../../types/lecture.types";

interface LectureDetailViewProps {
  lecture: LectureDetail;
}

export function LectureDetailView({ lecture }: LectureDetailViewProps) {
  const scholarName = lecture.scholar
    ? formatScholarName(
        lecture.scholar.honorifics ?? null,
        lecture.scholar.name,
      )
    : null;
  const viewCount = Number(lecture.viewCount);

  return (
    <article aria-labelledby="lecture-title" className="flex flex-col gap-6">
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
          href="/lectures"
          className="hover:text-ink-secondary transition-colors"
        >
          Lectures
        </Link>
        {lecture.category && (
          <>
            <ChevronRight />
            <Link
              href={`/lectures?category=${lecture.category.id}`}
              className="hover:text-ink-secondary transition-colors"
            >
              {lecture.category.name}
            </Link>
          </>
        )}
        <ChevronRight />
        <span
          className="text-ink-tertiary line-clamp-1 max-w-[20ch]"
          aria-current="page"
        >
          {lecture.title}
        </span>
      </nav>

      {/* ── Thumbnail ───────────────────────────────────────────────── */}
      {lecture.thumbnailAsset?.publicUrl && (
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-muted shadow-lg">
          <Image
            src={lecture.thumbnailAsset.publicUrl}
            alt={lecture.thumbnailAsset.altText ?? lecture.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
        </div>
      )}

      {/* ── Category + meta badges ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {lecture.category && (
          <Badge variant="primary" size="md">
            {lecture.category.name}
          </Badge>
        )}
        {lecture.durationSecs && (
          <Badge variant="default" size="md">
            <ClockIcon />
            {formatDurationLong(lecture.durationSecs)}
          </Badge>
        )}
        {viewCount > 0 && (
          <Badge variant="default" size="md">
            <EyeIcon />
            {formatCount(viewCount)} views
          </Badge>
        )}
        {lecture.isFeatured && (
          <Badge variant="gold" size="md">
            Featured
          </Badge>
        )}
      </div>

      {/* ── Title ───────────────────────────────────────────────────── */}
      <h1
        id="lecture-title"
        className="font-display font-bold text-2xl sm:text-3xl text-ink-primary leading-tight tracking-snug"
      >
        {lecture.title}
      </h1>

      {/* ── Scholar card ────────────────────────────────────────────── */}
      {lecture.scholar && (
        <Link
          href={`/scholars/${lecture.scholar.slug}`}
          className="flex items-center gap-4 p-4 rounded-xl border border-border-default hover:border-primary-200 hover:shadow-primary-sm transition-all duration-normal group w-fit"
          aria-label={`View profile of ${scholarName}`}
        >
          <div className="relative size-12 rounded-full overflow-hidden bg-primary-100 shrink-0 ring-2 ring-transparent group-hover:ring-primary-300 transition-all">
            {lecture.scholar.avatarAsset?.publicUrl ? (
              <Image
                src={lecture.scholar.avatarAsset.publicUrl}
                alt={scholarName ?? ""}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="absolute inset-0 bg-primary-700 flex items-center justify-center">
                <span className="font-display font-bold text-lg text-white">
                  {lecture.scholar.name[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-ink-primary group-hover:text-primary-700 transition-colors">
              {scholarName}
            </p>
            {lecture.scholar.nationality && (
              <p className="text-sm text-ink-muted">
                {lecture.scholar.nationality}
              </p>
            )}
          </div>
          <ChevronRight className="ml-2 text-ink-muted group-hover:text-primary-700 transition-colors" />
        </Link>
      )}

      {/* ── Audio player ─────────────────────────────────────────────── */}
      {lecture.audioAsset && (
        <AudioPlayer
          lectureId={lecture.id}
          lectureTitle={lecture.title}
          scholarName={scholarName}
          audioKey={lecture.audioAsset.key}
          audioUrl={lecture.audioAsset.publicUrl ?? ""}
          durationSecs={
            lecture.audioAsset.durationSecs ?? lecture.durationSecs ?? 0
          }
          allowDownload={lecture.allowDownload}
          thumbnailUrl={lecture.thumbnailAsset?.publicUrl ?? null}
        />
      )}

      {/* ── Description ─────────────────────────────────────────────── */}
      {lecture.description && (
        <div className="prose-islamic">
          <h2 className="text-lg font-semibold text-ink-primary mb-3">
            About this lecture
          </h2>
          <p className="text-ink-secondary leading-loose">
            {lecture.description}
          </p>
        </div>
      )}

      {/* ── Tags ────────────────────────────────────────────────────── */}
      {lecture.tags.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Topics">
          {lecture.tags.map(({ tag }) => (
            <Link
              key={tag.id}
              href={`/lectures?tag=${tag.slug}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm border border-border-default text-ink-secondary hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* ── Transcript ──────────────────────────────────────────────── */}
      {lecture.transcript && (
        <details className="group rounded-xl border border-border-default overflow-hidden">
          <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-colors list-none">
            <span className="font-semibold text-base">Full Transcript</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform duration-normal group-open:rotate-180"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <div className="px-5 pb-5 pt-1 max-h-96 overflow-y-auto border-t border-border-subtle">
            <p className="text-sm text-ink-secondary leading-loose whitespace-pre-wrap">
              {lecture.transcript}
            </p>
          </div>
        </details>
      )}

      {/* ── Published date ───────────────────────────────────────────── */}
      {lecture.publishedAt && (
        <p className="text-xs text-ink-muted pt-2 border-t border-border-subtle">
          Published {formatDate(lecture.publishedAt)}
        </p>
      )}
    </article>
  );
}

// ── Icon sub-components ────────────────────────────────────────────────────────
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
