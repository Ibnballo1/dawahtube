// src/features/homepage/components/server/FeaturedScholars.tsx
import Link from "next/link";
import Image from "next/image";
import { Button } from "@shared/components/ui/button";
import { SectionHeader } from "@shared/components/ui/SectionHeader";
import { formatScholarName, formatCount } from "@shared/lib/format";
import { getFeaturedScholars } from "../../queries/get-homepage-data";

export async function FeaturedScholars() {
  const scholars = await getFeaturedScholars();
  if (scholars.length === 0) return null;

  return (
    <section
      className="section bg-surface-subtle border-y border-border-subtle"
      aria-labelledby="featured-scholars-heading"
    >
      <div className="container-site flex flex-col gap-10">
        <SectionHeader
          overline="Our Scholars"
          heading="Knowledge from trustworthy teachers"
          description="Verified scholars upon the Salafi manhaj — studied, authenticated, and recommended."
          headingAs="h2"
          action={
            <Link href="/scholars" aria-label="View all scholars">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight />
              </Button>
            </Link>
          }
        />

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {scholars.map((scholar) => (
            <ScholarCard key={scholar.id} scholar={scholar} />
          ))}
        </div>
      </div>
    </section>
  );
}

type ScholarCardData = Awaited<ReturnType<typeof getFeaturedScholars>>[number];

function ScholarCard({ scholar }: { scholar: ScholarCardData }) {
  const displayName = formatScholarName(
    scholar.honorifics ?? null,
    scholar.name,
  );

  return (
    <Link
      href={`/scholars/${scholar.slug}`}
      className="card card-interactive flex flex-col items-center text-center p-6 gap-4 group"
      aria-label={`View profile of ${displayName}`}
    >
      {/* Avatar */}
      <div className="relative size-20 rounded-full overflow-hidden bg-primary-100 ring-2 ring-transparent group-hover:ring-primary-300 transition-all duration-normal shrink-0">
        {scholar.avatarAsset?.publicUrl ? (
          <Image
            src={scholar.avatarAsset.publicUrl}
            alt={scholar.avatarAsset.altText ?? displayName}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-700">
            <span className="font-display font-bold text-2xl text-white">
              {scholar.name[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-display font-bold text-base text-ink-primary leading-snug group-hover:text-primary-700 transition-colors">
          {displayName}
        </h3>
        {scholar.nationality && (
          <p className="text-xs text-ink-muted">{scholar.nationality}</p>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-ink-tertiary">
        {scholar.lectureCount > 0 && (
          <span>{formatCount(scholar.lectureCount)} lectures</span>
        )}
        {scholar.articleCount > 0 && (
          <span>{formatCount(scholar.articleCount)} articles</span>
        )}
      </div>
    </Link>
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
