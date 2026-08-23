// src/app/(main)/series/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { series } from "@core/database/schema";
import { eq, isNull, desc, and } from "drizzle-orm";
import { SectionHeader } from "@shared/components/ui/SectionHeader";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { formatScholarName, formatCount } from "@shared/lib/format";

export const metadata: Metadata = {
  title: "Lecture Series",
  description:
    "Browse complete lecture series from trusted Nigerian scholars — structured multi-part lessons upon the Qur'an and Sunnah.",
};

export const dynamic = "force-dynamic";

export default async function SeriesPage() {
  const rows = await db.query.series.findMany({
    where: and(eq(series.status, "published"), isNull(series.deletedAt)),
    orderBy: [desc(series.createdAt)],
    with: {
      scholar: {
        columns: { id: true, slug: true, name: true, honorifics: true },
        with: { avatarAsset: { columns: { publicUrl: true } } },
      },
      coverAsset: { columns: { publicUrl: true, altText: true } },
    },
  });

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="bg-surface-subtle border-b border-border-default">
        <div className="container-site py-10">
          <SectionHeader
            overline="Structured Learning"
            heading="Lecture Series"
            description="Complete multi-part series from trusted scholars — follow a topic from beginning to end."
            headingAs="h1"
          />
        </div>
      </div>

      <div className="container-site py-10">
        {rows.length === 0 ? (
          <EmptyState
            title="No series yet"
            description="Lecture series will appear here once they are published."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rows.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Series card ──────────────────────────────────────────────────────────────

type SeriesItem = Awaited<
  ReturnType<
    typeof db.query.series.findMany<{
      with: {
        scholar: {
          columns: { id: true; slug: true; name: true; honorifics: true };
          with: { avatarAsset: { columns: { publicUrl: true } } };
        };
        coverAsset: { columns: { publicUrl: true; altText: true } };
      };
    }>
  >
>[number];

function SeriesCard({ series: s }: { series: SeriesItem }) {
  const displayName = s.scholar
    ? formatScholarName(s.scholar.honorifics ?? null, s.scholar.name)
    : null;

  return (
    <Link
      href={`/series/${s.slug}`}
      className="card card-interactive flex flex-col group"
    >
      {/* Thumbnail / Cover */}
      <div className="relative aspect-video bg-gradient-to-br from-primary-800 to-primary-950 overflow-hidden">
        {s.coverAsset?.publicUrl ? (
          <Image
            src={s.coverAsset.publicUrl}
            alt={s.coverAsset.altText ?? s.coverAltText ?? s.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-slow"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="rgba(255,255,255,0.15)"
              aria-hidden="true"
            >
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
            </svg>
          </div>
        )}

        {/* Episode count pill */}
        <div className="absolute bottom-2 right-2">
          <span className="duration-pill">
            {formatCount(s.itemCount ?? 0)} episodes
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h2 className="font-display font-bold text-base text-ink-primary leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">
          {s.title}
        </h2>

        {s.description && (
          <p className="text-sm text-ink-tertiary line-clamp-2 leading-relaxed">
            {s.description}
          </p>
        )}

        {/* Scholar */}
        {s.scholar && displayName && (
          <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border-subtle">
            {s.scholar.avatarAsset?.publicUrl ? (
              <Image
                src={s.scholar.avatarAsset.publicUrl}
                alt={displayName}
                width={24}
                height={24}
                className="rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="size-6 rounded-full bg-primary-700 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-white">
                  {s.scholar.name[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-xs text-ink-muted truncate">
              {displayName}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
