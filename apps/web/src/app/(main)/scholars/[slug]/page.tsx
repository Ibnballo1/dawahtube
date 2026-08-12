// src/app/scholars/[slug]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getScholarBySlug,
  getAllActiveScholarSlugs,
  getScholarContent,
} from "@features/scholars/queries/scholar.queries";
import { ScholarProfileHeader } from "@features/scholars/components/server/ScholarProfileHeader";
import { ScholarContentPanel } from "@features/scholars/components/server/ScholarContentPanel";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { env } from "@core/config/env";
import { formatScholarName } from "@shared/lib/format";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllActiveScholarSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const scholar = await getScholarBySlug(slug);
  if (!scholar) return { title: "Scholar not found" };

  const displayName = formatScholarName(
    scholar.honorifics ?? null,
    scholar.name,
  );

  return {
    title: scholar.metaTitle ?? displayName,
    description:
      scholar.metaDescription ??
      `Lectures and articles by ${displayName} — upon the Qur'an and Sunnah.`,
    openGraph: {
      title: displayName,
      description: scholar.metaDescription ?? undefined,
      type: "profile",
      url: `/scholars/${scholar.slug}`,
      images: scholar.avatarAsset?.publicUrl
        ? [{ url: scholar.avatarAsset.publicUrl, alt: displayName }]
        : undefined,
    },
  };
}

export default async function ScholarProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scholar = await getScholarBySlug(slug);
  if (!scholar) notFound();

  const content = await getScholarContent(scholar.id);
  const displayName = formatScholarName(
    scholar.honorifics ?? null,
    scholar.name,
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: displayName,
    url: `${env.NEXT_PUBLIC_APP_URL}/scholars/${scholar.slug}`,
    image: scholar.avatarAsset?.publicUrl,
    nationality: scholar.nationality
      ? { "@type": "Country", name: scholar.nationality }
      : undefined,
    sameAs: [
      scholar.websiteUrl ?? null,
      scholar.twitterHandle
        ? `https://twitter.com/${scholar.twitterHandle}`
        : null,
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-surface-base">
        {/* Profile header — banner, avatar, name, bio, stats */}
        <ScholarProfileHeader scholar={scholar} />

        {/* Content tabs — lectures / articles */}
        <div className="container-site py-10">
          <Suspense
            fallback={
              <div className="flex flex-col gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            }
          >
            <ScholarContentPanel content={content} scholarSlug={slug} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
