// src/features/lectures/components/server/RelatedLectures.tsx
import Link from "next/link";
import Image from "next/image";
import {
  formatDurationLong,
  formatScholarName,
  formatRelativeDate,
} from "@shared/lib/format";

type RelatedLectureRow = {
  id: string;
  slug: string;
  title: string;
  durationSecs: number | null;
  publishedAt: Date | null;
  viewCount: string;
  scholar: {
    id: string;
    slug: string;
    name: string;
    honorifics: string | null;
    avatarAsset: { publicUrl: string | null; altText: string | null } | null;
  } | null;
  thumbnailAsset: { publicUrl: string | null; altText: string | null } | null;
};

interface RelatedLecturesProps {
  lectures: RelatedLectureRow[];
}

export function RelatedLectures({ lectures }: RelatedLecturesProps) {
  if (lectures.length === 0) return null;

  return (
    <div className="flex flex-col gap-4" aria-label="Related lectures">
      <h2 className="font-display font-bold text-lg text-ink-primary">
        Related lectures
      </h2>

      <ol className="flex flex-col gap-3" role="list">
        {lectures.map((lecture) => (
          <RelatedLectureCard key={lecture.id} lecture={lecture} />
        ))}
      </ol>
    </div>
  );
}

function RelatedLectureCard({ lecture }: { lecture: RelatedLectureRow }) {
  const scholarName = lecture.scholar
    ? formatScholarName(
        lecture.scholar.honorifics ?? null,
        lecture.scholar.name,
      )
    : null;

  return (
    <li role="listitem">
      <Link
        href={`/lectures/${lecture.slug}`}
        className="flex gap-3 group rounded-xl p-2 -mx-2 hover:bg-surface-subtle transition-colors"
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

          {/* Duration */}
          {lecture.durationSecs && (
            <span className="duration-pill absolute bottom-1 right-1 text-[9px] px-1 py-0">
              {formatDurationLong(lecture.durationSecs)}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1 min-w-0 flex-1 py-0.5">
          <h3 className="text-sm font-semibold text-ink-primary leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
            {lecture.title}
          </h3>

          {scholarName && (
            <p className="text-xs text-ink-tertiary line-clamp-1">
              {scholarName}
            </p>
          )}

          {lecture.publishedAt && (
            <p className="text-xs text-ink-muted mt-auto">
              {formatRelativeDate(lecture.publishedAt)}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}
