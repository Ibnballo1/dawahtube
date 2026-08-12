// src/features/homepage/components/server/HeroSection.tsx
import Link from "next/link";
import Image from "next/image";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import {
  formatDurationLong,
  formatScholarName,
  formatCount,
} from "@shared/lib/format";
import {
  getHeroLecture,
  getPlatformStats,
} from "../../queries/get-homepage-data";
import { HeroPlayButton } from "../clients/HeroPlayButton";

export async function HeroSection() {
  const [heroLecture, stats] = await Promise.all([
    getHeroLecture(),
    getPlatformStats(),
  ]);

  return (
    <section
      className="relative min-h-[88vh] flex items-center geometric-bg overflow-hidden"
      aria-label="Hero — welcome to Da'wahTube"
    >
      {/* ── Emerald gradient backdrop ──────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800"
      />

      {/* ── Decorative Arabic calligraphy watermark ────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none"
      >
        <p
          className="font-arabic text-[20vw] leading-none text-white/[0.03] select-none"
          dir="rtl"
          lang="ar"
        >
          علم
        </p>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="container-site relative z-10 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left column — headline + CTAs */}
        <div className="flex flex-col gap-8">
          {/* Overline */}
          <div className="flex items-center gap-3">
            <span className="block w-8 h-px bg-accent-700" aria-hidden="true" />
            <span className="label-overline text-accent-500 tracking-widest">
              Upon the Qur&apos;an &amp; Sunnah
            </span>
          </div>

          {/* Main heading */}
          <h1 className="font-display font-extrabold text-white leading-none tracking-tight">
            <span className="block text-4xl sm:text-5xl">Authentic</span>
            <span className="block text-4xl sm:text-5xl text-accent-400 mt-1">
              Islamic
            </span>
            <span className="block text-4xl sm:text-5xl mt-1">Knowledge</span>
          </h1>

          {/* Arabic subheading */}
          <p
            className="font-arabic text-arabic-lg text-white/70 leading-loose"
            dir="rtl"
            lang="ar"
            aria-label="According to the understanding of the Salaf"
          >
            عَلَى مَنْهَجِ السَّلَفِ الصَّالِحِ
          </p>

          {/* Description */}
          <p className="text-md text-white/60 leading-relaxed max-w-[42ch]">
            Lectures, articles, books and daily reminders from trusted Nigerian
            scholars — verified upon sound evidence.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" variant="outline">
              <Link href="/lectures">
                <PlayIcon />
                Browse Lectures
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
            >
              <Link href="/scholars">Our Scholars</Link>
            </Button>
          </div>

          {/* Platform stats */}
          <div
            className="flex flex-wrap gap-8 pt-4 border-t border-white/10"
            role="list"
            aria-label="Platform statistics"
          >
            <StatPill
              value={formatCount(stats.lectureCount)}
              label="Lectures"
            />
            <StatPill
              value={formatCount(stats.scholarCount)}
              label="Scholars"
            />
            <StatPill
              value={formatCount(stats.articleCount)}
              label="Articles"
            />
            <StatPill value={formatCount(stats.bookCount)} label="Books" />
          </div>
        </div>

        {/* Right column — featured lecture card */}
        {heroLecture && (
          <div className="relative">
            {/* Glow effect behind card */}
            <div
              aria-hidden="true"
              className="absolute -inset-4 bg-primary-600/20 rounded-3xl blur-2xl"
            />

            <article
              className="relative bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
              aria-label={`Featured lecture: ${heroLecture.title}`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-primary-800">
                {heroLecture.thumbnailAsset?.publicUrl ? (
                  <Image
                    src={heroLecture.thumbnailAsset.publicUrl}
                    alt={
                      heroLecture.thumbnailAsset.altText ?? heroLecture.title
                    }
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <PlaceholderThumbnail />
                )}

                {/* Duration overlay */}
                {heroLecture.audioAsset?.durationSecs && (
                  <span className="duration-pill absolute bottom-3 right-3">
                    {formatDurationLong(heroLecture.audioAsset.durationSecs)}
                  </span>
                )}

                {/* Play button overlay */}
                <HeroPlayButton lectureSlug={heroLecture.slug} />
              </div>

              {/* Card body */}
              <div className="p-6 flex flex-col gap-3">
                {heroLecture.category && (
                  <Badge variant="primary" size="sm">
                    {heroLecture.category.name}
                  </Badge>
                )}

                <h2 className="font-display font-bold text-white text-xl leading-snug line-clamp-2">
                  {heroLecture.title}
                </h2>

                {heroLecture.scholar && (
                  <div className="flex items-center gap-3">
                    {/* Scholar avatar */}
                    <div className="size-8 rounded-full bg-primary-700 flex items-center justify-center shrink-0">
                      {heroLecture.scholar.avatarAsset?.publicUrl ? (
                        <Image
                          src={heroLecture.scholar.avatarAsset.publicUrl}
                          alt={formatScholarName(
                            heroLecture.scholar.honorifics ?? null,
                            heroLecture.scholar.name,
                          )}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-white">
                          {heroLecture.scholar.name[0]}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-white/70">
                      {formatScholarName(
                        heroLecture.scholar.honorifics ?? null,
                        heroLecture.scholar.name,
                      )}
                    </span>
                  </div>
                )}

                <Link
                  href={`/lectures/${heroLecture.slug}`}
                  className="mt-1 text-sm text-accent-400 hover:text-accent-300 transition-colors font-medium flex items-center gap-1"
                >
                  Listen now
                  <ArrowIcon />
                </Link>
              </div>
            </article>
          </div>
        )}

        {/* If no hero lecture configured, show platform tagline card */}
        {!heroLecture && (
          <div className="relative flex flex-col gap-6">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 flex flex-col gap-5">
              <p
                className="font-arabic text-arabic-xl text-accent-400 leading-loose text-right"
                dir="rtl"
                lang="ar"
              >
                طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ
              </p>
              <p className="text-white/50 text-sm italic">
                &ldquo;Seeking knowledge is an obligation upon every
                Muslim.&rdquo;
              </p>
              <p className="text-white/30 text-xs">— Sunan Ibn Mājah 224</p>
            </div>
            <Button size="lg" variant="outline">
              <Link href="/lectures">
                <PlayIcon />
                Start Learning
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* ── Scroll indicator ───────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40"
      >
        <span className="text-white text-xs tracking-widest uppercase font-medium">
          Scroll
        </span>
        <span className="block w-px h-8 bg-white/40" />
      </div>
    </section>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div role="listitem" className="flex flex-col gap-0.5">
      <span className="font-display font-bold text-2xl text-white leading-none">
        {value}
      </span>
      <span className="text-xs text-white/50 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function PlaceholderThumbnail() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-primary-800">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polygon
          points="10 8 16 12 10 16 10 8"
          fill="rgba(255,255,255,0.2)"
          stroke="none"
        />
      </svg>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function ArrowIcon() {
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
