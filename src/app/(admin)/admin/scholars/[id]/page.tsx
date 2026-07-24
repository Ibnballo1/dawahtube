// src/app/(admin)/admin/scholars/[id]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { eq } from "drizzle-orm";
import { ScholarForm } from "@features/admin/components/client/forms/ScholarForm";

export const metadata: Metadata = { title: "Edit Scholar" };

export default async function EditScholarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scholar = await db.query.scholars.findFirst({
    where: (s) => eq(s.id, id),
  });
  if (!scholar) notFound();

  return (
    <ScholarForm
      scholar={{
        id: scholar.id,
        name: scholar.name,
        arabicName: scholar.arabicName,
        honorifics: scholar.honorifics,
        nationality: scholar.nationality,
        location: scholar.location,
        biography: scholar.biography,
        websiteUrl: scholar.websiteUrl,
        twitterHandle: scholar.twitterHandle,
        isActive: scholar.isActive,
        defaultLanguage: scholar.defaultLanguage,
        metaTitle: scholar.metaTitle,
        metaDescription: scholar.metaDescription,
      }}
    />
  );
}
