// src/features/homepage/components/server/FeaturedLectures.tsx
import Link from "next/link";
import Image from "next/image";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { SectionHeader } from "@shared/components/ui/SectionHeader";
import { EmptyState } from "@shared/components/ui/EmptyState";
import {
  formatDurationLong,
  formatScholarName,
  formatCount,
} from "@shared/lib/format";
import { getFeaturedLectures } from "../../queries/get-homepage-data";

export async function FeaturedLectures() {
  const lectures = await getFeaturedLectures();

  return (
    <section
      className="section bg-surface-base"
      aria-labelledby="featured-lectures-heading"
    >
      <div className="container-site flex flex-col gap-10">
        <SectionHeader
          overline="Featured Lectures"
          heading="Guided by the Sunnah"
          description="Carefully selected lectures from trusted scholars — upon authentic evidence and sound understanding."
          headingAs="h2"
          action={
            <Link href="/lectures" aria-label="View all lectures">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight />
              </Button>
            </Link>
          }
        />

        {lectures.length === 0 ? (
          <EmptyState
            title="Lectures coming soon"
            description="Our content team is uploading the first lectures. Check back shortly."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lectures.map((lecture, i) => (
              <LectureCard
                key={lecture.id}
                lecture={lecture}
                priority={i < 3}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Lecture Card ──────────────────────────────────────────────────────────────

type LectureCardData = Awaited<ReturnType<typeof getFeaturedLectures>>[number];

function LectureCard({
  lecture,
  priority,
}: {
  lecture: LectureCardData;
  priority: boolean;
}) {
  const scholarName = lecture.scholar
    ? formatScholarName(
        lecture.scholar.honorifics ?? null,
        lecture.scholar.name,
      )
    : null;

  return (
    <article className="card card-interactive flex flex-col group">
      {/* Thumbnail */}
      <Link
        href={`/lectures/${lecture.slug}`}
        className="block relative aspect-video bg-surface-muted overflow-hidden rounded-t-xl"
        tabIndex={-1}
        aria-hidden="true"
      >
        {lecture.thumbnailAsset?.publicUrl?.trim() ? (
          <Image
            src={lecture.thumbnailAsset.publicUrl.trim()}
            alt={lecture.thumbnailAsset.altText || lecture.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-slow"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            // Add unoptimized in dev if media.dawahtube.com isn't reachable locally:
            unoptimized={process.env.NODE_ENV === "development"}
          />
        ) : (
          <PlaceholderThumb />
        )}

        {/* Duration badge */}
        {lecture.audioAsset?.durationSecs && (
          <span className="duration-pill absolute bottom-2 right-2">
            {formatDurationLong(lecture.audioAsset.durationSecs)}
          </span>
        )}

        {/* Play icon on hover */}
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-normal bg-black/20"
        >
          <span className="size-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </span>
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 gap-3 p-5">
        {/* Category badge */}
        {lecture.category && (
          <Badge variant="primary" size="sm" className="w-fit">
            {lecture.category.name}
          </Badge>
        )}

        {/* Title */}
        <h3 className="font-display font-bold text-lg text-ink-primary leading-snug line-clamp-2">
          <Link
            href={`/lectures/${lecture.slug}`}
            className="hover:text-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 rounded-sm"
          >
            {lecture.title}
          </Link>
        </h3>

        {/* Scholar */}
        {lecture.scholar && (
          <Link
            href={`/scholars/${lecture.scholar.slug}`}
            className="flex items-center gap-2 group/scholar w-fit"
          >
            <ScholarAvatar name={lecture.scholar.name} />
            <span className="text-sm text-ink-tertiary group-hover/scholar:text-primary-700 transition-colors">
              {scholarName}
            </span>
          </Link>
        )}

        {/* View count */}
        {lecture.viewCount > 0 && (
          <p className="text-xs text-ink-muted mt-auto">
            {formatCount(lecture.viewCount)} views
          </p>
        )}
      </div>
    </article>
  );
}

function ScholarAvatar({ name }: { name: string }) {
  const initial = name[0]?.toUpperCase() ?? "?";
  return (
    <span className="size-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
      {initial}
    </span>
  );
}

function PlaceholderThumb() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-950 flex items-center justify-center">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polygon
          points="10 8 16 12 10 16 10 8"
          fill="rgba(255,255,255,0.15)"
          stroke="none"
        />
      </svg>
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
