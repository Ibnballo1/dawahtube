// src/app/(admin)/admin/reminders/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { reminders } from "@core/database/schema";
import { isNull, desc } from "drizzle-orm";
import { AdminContentTable } from "@features/admin/components/server/AdminContentTable";
import {
  PublishButton,
  DeleteButton,
} from "@features/admin/components/client/ContentRowActions";
import {
  publishReminder,
  deleteReminder,
} from "@features/admin/actions/content.actions";
import { Button } from "@shared/components/ui/button";

export const metadata: Metadata = { title: "Manage Reminders" };
export const dynamic = "force-dynamic";

export default async function AdminRemindersPage() {
  const rows = await db.query.reminders.findMany({
    where: isNull(reminders.deletedAt),
    orderBy: [desc(reminders.updatedAt)],
    limit: 50,
    with: {
      scholar: { columns: { id: true, name: true, honorifics: true } },
    },
  });

  const tableRows = rows.map((reminder) => ({
    id: reminder.id,
    title: reminder.title,
    status: reminder.status,
    updatedAt: reminder.updatedAt,
    editHref: `/admin/reminders/${reminder.id}`,
    extra: reminder.scholar?.name ?? undefined,
    actions: (
      <div className="flex items-center gap-1">
        <PublishButton
          id={reminder.id}
          status={reminder.status}
          onPublish={publishReminder}
        />
        <DeleteButton
          id={reminder.id}
          title={reminder.title}
          onDelete={deleteReminder}
        />
      </div>
    ),
  }));

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary">
            Reminders
          </h1>
          <p className="text-ink-muted text-sm mt-0.5">{rows.length} total</p>
        </div>
        <Button>
          <Link href="/admin/reminders/new">
            <PlusIcon /> New reminder
          </Link>
        </Button>
      </div>

      <AdminContentTable
        rows={tableRows}
        emptyLabel="No reminders yet. Create your first daily reminder."
        newHref="/admin/reminders/new"
        newLabel="New reminder"
      />
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
