// src/app/(admin)/admin/bulk-upload/page.tsx
//
// Server wrapper — fetches scholars and categories, passes to client component.
// The actual bulk upload UI is the default export from the client component above.
// Rename bulk-upload-page.tsx to BulkUploadClient.tsx and import here.

import type { Metadata } from "next";
import { db } from "@core/database/client";
import { scholars, lectureCategories } from "@core/database/schema";
import { eq, asc, isNull } from "drizzle-orm";
import BulkUploadClient from "@features/admin/components/client/BulkUploadClient";

export const metadata: Metadata = { title: "Bulk Upload" };

export default async function BulkUploadPage() {
  const [scholarList, categoryList] = await Promise.all([
    db.query.scholars.findMany({
      where: (s) => eq(s.isActive, true) && isNull(s.deletedAt),
      columns: { id: true, name: true, honorifics: true },
      orderBy: [asc(scholars.name)],
    }),
    db.query.lectureCategories.findMany({
      where: (c) => eq(c.isActive, true),
      columns: { id: true, name: true },
      orderBy: [asc(lectureCategories.name)],
    }),
  ]);

  return <BulkUploadClient scholars={scholarList} categories={categoryList} />;
}
