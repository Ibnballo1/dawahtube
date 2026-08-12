// src/app/(admin)/admin/reminders/new/page.tsx
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { scholars } from "@core/database/schema";
import { eq, asc } from "drizzle-orm";
import { ReminderForm } from "@features/admin/components/client/forms/ReminderForm";

export const metadata: Metadata = { title: "New Reminder" };

export default async function NewReminderPage() {
  const scholarList = await db.query.scholars.findMany({
    where: (s) => eq(s.isActive, true),
    columns: { id: true, name: true, honorifics: true },
    orderBy: [asc(scholars.name)],
  });

  return <ReminderForm scholars={scholarList} />;
}
