// src/app/lectures/[slug]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getLectureBySlug,
  getAllPublishedLectureSlugs,
  getRelatedLectures,
  getLectureSeriesContext,
} from "@features/lectures/queries/lecture.queries";
import { LectureDetailView } from "@/features/lectures/components/server/LectureDetailView";
import { LectureSeriesPanel } from "@/features/lectures/components/server/LectureSeriesPanel";
import { RelatedLectures } from "@/features/lectures/components/server/RelatedLectures";
import { LectureViewTracker } from "@/features/lectures/components/client/LectureViewTracker";
import { LectureCardSkeleton, Skeleton } from "@shared/components/ui/skeleton";
import { env } from "@core/config/env";

// ── ISR: rebuild every hour, serve stale while revalidating ───────────────────
export const revalidate = 3600;

// ── Pre-render all published lecture slugs at build time ──────────────────────
export async function generateStaticParams() {
  const slugs = await getAllPublishedLectureSlugs();
  return slugs.map((slug) => ({ slug }));
}

// ── Dynamic metadata from lecture data ───────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lecture = await getLectureBySlug(slug);
  if (!lecture) return { title: "Lecture not found" };

  const scholarName = lecture.scholar
    ? [lecture.scholar.honorifics, lecture.scholar.name]
        .filter(Boolean)
        .join(" ")
    : undefined;

  return {
    title: lecture.metaTitle ?? lecture.title,
    description: lecture.metaDescription ?? lecture.description ?? undefined,
    openGraph: {
      title: lecture.metaTitle ?? lecture.title,
      description: lecture.metaDescription ?? lecture.description ?? undefined,
      type: "article",
      url: `/lectures/${lecture.slug}`,
      images: lecture.thumbnailAsset?.publicUrl
        ? [{ url: lecture.thumbnailAsset.publicUrl, alt: lecture.title }]
        : undefined,
    },
    other: {
      // Audio content signals for search engines
      "og:audio": lecture.audioAsset?.key
        ? `${env.NEXT_PUBLIC_APP_URL}/api/audio/${lecture.slug}`
        : "",
      "og:audio:type": "audio/mpeg",
      "article:author": scholarName ?? "",
      "article:section": lecture.category?.name ?? "",
    },
  };
}

// ── Page component ────────────────────────────────────────────────────────────
export default async function LectureDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lecture = await getLectureBySlug(slug);
  if (!lecture) notFound();

  // Fetch related data in parallel — independent of main lecture fetch
  const [seriesContext, relatedLectures] = await Promise.all([
    getLectureSeriesContext(lecture.id),
    getRelatedLectures(
      lecture.id,
      lecture.categoryId ?? null,
      lecture.scholarId ?? null,
    ),
  ]);

  // JSON-LD structured data for this lecture
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: lecture.title,
    description: lecture.description,
    url: `${env.NEXT_PUBLIC_APP_URL}/lectures/${lecture.slug}`,
    datePublished: lecture.publishedAt?.toISOString(),
    author: lecture.scholar
      ? {
          "@type": "Person",
          name: [lecture.scholar.honorifics, lecture.scholar.name]
            .filter(Boolean)
            .join(" "),
          url: `${env.NEXT_PUBLIC_APP_URL}/scholars/${lecture.scholar.slug}`,
        }
      : undefined,
    duration: lecture.durationSecs
      ? `PT${Math.floor(lecture.durationSecs / 60)}M${lecture.durationSecs % 60}S`
      : undefined,
    image: lecture.thumbnailAsset?.publicUrl,
    partOfSeries: seriesContext
      ? {
          "@type": "PodcastSeries",
          name: seriesContext.series.title,
          url: `${env.NEXT_PUBLIC_APP_URL}/series/${seriesContext.series.slug}`,
        }
      : undefined,
  };

  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Client-side view tracker — fires once on mount */}
      <LectureViewTracker lectureId={lecture.id} />

      <div className="min-h-screen bg-surface-base">
        <div className="container-site py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
            {/* ── Main column ─────────────────────────────────────── */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Series context panel (if lecture is in a series) */}
              {seriesContext && (
                <LectureSeriesPanel
                  context={seriesContext}
                  currentSlug={slug}
                />
              )}

              {/* Main lecture view: player + metadata */}
              <LectureDetailView lecture={lecture} />
            </div>

            {/* ── Sidebar ──────────────────────────────────────────── */}
            <aside className="lg:col-span-1" aria-label="Related lectures">
              <Suspense
                fallback={
                  <div className="flex flex-col gap-4">
                    <Skeleton className="w-40 h-5 rounded" />
                    {Array.from({ length: 4 }).map((_, i) => (
                      <LectureCardSkeleton key={i} />
                    ))}
                  </div>
                }
              >
                <RelatedLectures
                  lectures={relatedLectures.map((lecture) => ({
                    ...lecture,
                    viewCount: String(lecture.viewCount ?? 0),
                  }))}
                />
              </Suspense>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
