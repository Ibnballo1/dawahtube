// src/app/(admin)/admin/reminders/[id]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { scholars } from "@core/database/schema";
import { eq, asc } from "drizzle-orm";
import { ReminderForm } from "@features/admin/components/client/forms/ReminderForm";

export const metadata: Metadata = { title: "Edit Reminder" };

export default async function EditReminderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [reminder, scholarList] = await Promise.all([
    db.query.reminders.findFirst({ where: (r) => eq(r.id, id) }),
    db.query.scholars.findMany({
      where: (s) => eq(s.isActive, true),
      columns: { id: true, name: true, honorifics: true },
      orderBy: [asc(scholars.name)],
    }),
  ]);

  if (!reminder) notFound();

  return (
    <ReminderForm
      reminder={{
        id: reminder.id,
        title: reminder.title,
        content: reminder.content,
        source: reminder.source,
        scholarId: reminder.scholarId,
        status: reminder.status,
      }}
      scholars={scholarList}
    />
  );
}
