// src/app/(admin)/admin/lectures/new/page.tsx
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { scholars, lectureCategories } from "@core/database/schema";
import { eq, asc } from "drizzle-orm";
import { LectureForm } from "@features/admin/components/client/forms/LectureForm";

export const metadata: Metadata = { title: "New Lecture" };

export default async function NewLecturePage() {
  const [scholarList, categoryList] = await Promise.all([
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

  return <LectureForm scholars={scholarList} categories={categoryList} />;
}
