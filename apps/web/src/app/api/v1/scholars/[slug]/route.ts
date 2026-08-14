// src/app/api/v1/scholars/[slug]/route.ts
import { type NextRequest } from "next/server";
import { db } from "@core/database/client";
import { scholars } from "@core/database/schema";
import { eq, and, isNull } from "drizzle-orm";
import { ok, err, withCors, OPTIONS } from "../../_helpers";

export { OPTIONS };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const scholar = await db.query.scholars.findFirst({
      where: and(
        eq(scholars.slug, slug),
        eq(scholars.isActive, true),
        isNull(scholars.deletedAt),
      ),
      with: {
        avatarAsset: { columns: { publicUrl: true, altText: true } },
        bannerAsset: { columns: { publicUrl: true, altText: true } },
      },
    });

    if (!scholar) return withCors(err("Scholar not found", 404));

    return withCors(
      ok({
        id: scholar.id,
        slug: scholar.slug,
        name: scholar.name,
        displayName: [scholar.honorifics, scholar.name]
          .filter(Boolean)
          .join(" "),
        arabicName: scholar.arabicName,
        honorifics: scholar.honorifics,
        nationality: scholar.nationality,
        location: scholar.location,
        biography: scholar.biography, // raw MDX — mobile renders as plain text
        websiteUrl: scholar.websiteUrl,
        twitterHandle: scholar.twitterHandle,
        lectureCount: scholar.lectureCount,
        articleCount: scholar.articleCount,
        isFeatured: scholar.isFeatured,
        avatar: scholar.avatarAsset?.publicUrl ?? null,
        banner: scholar.bannerAsset?.publicUrl ?? null,
      }),
    );
  } catch (e) {
    console.error("[GET /api/v1/scholars/:slug]", e);
    return withCors(err("Failed to fetch scholar", 500));
  }
}
