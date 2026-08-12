// src/app/page.tsx  (or src/app/(public)/page.tsx)
import { Suspense } from "react";
import type { Metadata } from "next";
import { HeroSection } from "@features/homepage/components/server/HeroSection";
import { MissionSection } from "@features/homepage/components/server/MissionSection";
import { FeaturedLectures } from "@features/homepage/components/server/FeaturedLectures";
import { FeaturedScholars } from "@features/homepage/components/server/FeaturedScholars";
import { LatestArticles } from "@features/homepage/components/server/LatestArticles";
import { DailyReminder } from "@features/homepage/components/server/DailyReminder";
import { LibraryHighlights } from "@features/homepage/components/server/LibraryHighlights";
import {
  LectureCardSkeleton,
  ScholarCardSkeleton,
  ArticleCardSkeleton,
  BookCardSkeleton,
} from "@shared/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Da'wahTube — Authentic Islamic Knowledge",
  description:
    "Lectures, articles, books and daily reminders upon the Qur'an and Sunnah according to the understanding of the Salaf-us-Saalih.",
};

// Revalidate every 30 minutes — balanced freshness vs performance
export const revalidate = 1800;

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      {/* ── Mission ──────────────────────────────────────────────────── */}
      {/* No Suspense — no data fetch, renders instantly */}
      <MissionSection />

      {/* ── Featured Lectures ─────────────────────────────────────────── */}
      <Suspense
        fallback={
          <GridSkeleton
            Card={LectureCardSkeleton}
            count={6}
            cols="lg:grid-cols-3"
          />
        }
      >
        <FeaturedLectures />
      </Suspense>

      {/* ── Featured Scholars ─────────────────────────────────────────── */}
      <Suspense
        fallback={
          <GridSkeleton
            Card={ScholarCardSkeleton}
            count={4}
            cols="sm:grid-cols-2 lg:grid-cols-4"
          />
        }
      >
        <FeaturedScholars />
      </Suspense>

      {/* ── Latest Articles ───────────────────────────────────────────── */}
      <Suspense
        fallback={
          <GridSkeleton
            Card={ArticleCardSkeleton}
            count={4}
            cols="sm:grid-cols-2 lg:grid-cols-4"
          />
        }
      >
        <LatestArticles />
      </Suspense>

      {/* ── Daily Reminder ────────────────────────────────────────────── */}
      <Suspense fallback={<ReminderSkeleton />}>
        <DailyReminder />
      </Suspense>

      {/* ── Library Highlights ────────────────────────────────────────── */}
      <Suspense
        fallback={
          <GridSkeleton
            Card={BookCardSkeleton}
            count={4}
            cols="sm:grid-cols-2 lg:grid-cols-4"
          />
        }
      >
        <LibraryHighlights />
      </Suspense>
    </>
  );
}

// ─── Skeleton fallbacks ───────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div
      className="min-h-[88vh] bg-surface-muted animate-pulse"
      aria-busy="true"
      aria-label="Loading hero section"
    />
  );
}

function GridSkeleton({
  Card,
  count,
  cols,
}: {
  Card: React.ComponentType;
  count: number;
  cols: string;
}) {
  return (
    <section className="section bg-surface-base" aria-busy="true">
      <div className="container-site">
        <div className="mb-10 flex flex-col gap-3">
          <div className="skeleton w-28 h-3 rounded" />
          <div className="skeleton w-72 h-8 rounded-lg" />
          <div className="skeleton w-10 h-0.5 rounded" />
          <div className="skeleton w-96 h-5 rounded" />
        </div>
        <div className={`grid grid-cols-1 ${cols} gap-6`}>
          {Array.from({ length: count }).map((_, i) => (
            <Card key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReminderSkeleton() {
  return (
    <section className="section bg-primary-950 animate-pulse" aria-busy="true">
      <div className="container-site max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
        <div className="skeleton w-28 h-3 rounded opacity-20" />
        <div className="skeleton w-80 h-8 rounded-lg opacity-20" />
        <div className="skeleton w-full h-24 rounded-xl opacity-20" />
      </div>
    </section>
  );
}
