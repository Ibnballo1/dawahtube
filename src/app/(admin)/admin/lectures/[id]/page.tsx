// src/app/(admin)/admin/lectures/[id]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { scholars, lectureCategories } from "@core/database/schema";
import { eq, asc } from "drizzle-orm";
import { LectureForm } from "@features/admin/components/client/forms/LectureForm";

export const metadata: Metadata = { title: "Edit Lecture" };

export default async function EditLecturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [lecture, scholarList, categoryList] = await Promise.all([
    db.query.lectures.findFirst({
      where: (l) => eq(l.id, id),
      with: {
        audioAsset: { columns: { id: true, durationSecs: true } },
        thumbnailAsset: {
          columns: { id: true, publicUrl: true, altText: true },
        },
      },
    }),
    db.query.scholars.findMany({
      where: (s) => eq(s.isActive, true),
      columns: { id: true, name: true, honorifics: true },
      orderBy: [asc(scholars.name)],
    }),
    db.query.lectureCategories.findMany({
      where: (c) => eq(c.isActive, true),
      columns: { id: true, name: true },
      orderBy: [asc(lectureCategories.name)],
    }),
  ]);

  if (!lecture) notFound();

  return (
    <LectureForm
      lecture={{
        id: lecture.id,
        title: lecture.title,
        description: lecture.description,
        transcript: lecture.transcript,
        scholarId: lecture.scholarId,
        categoryId: lecture.categoryId,
        durationSecs: lecture.durationSecs,
        allowDownload: lecture.allowDownload,
        status: lecture.status,
        defaultLanguage: lecture.defaultLanguage,
        metaTitle: lecture.metaTitle,
        metaDescription: lecture.metaDescription,
        audioAssetId: lecture.audioAsset?.id ?? null,
        thumbnailAssetId: lecture.thumbnailAsset?.id ?? null,
        thumbnailUrl: lecture.thumbnailAsset?.publicUrl ?? null,
      }}
      scholars={scholarList}
      categories={categoryList}
    />
  );
}
