// src/app/(main)/reminders/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@core/database/client";
import { reminders } from "@core/database/schema";
import { eq, isNull, desc } from "drizzle-orm";
import { SectionHeader } from "@shared/components/ui/SectionHeader";
import { formatScholarName, formatRelativeDate } from "@shared/lib/format";

export const metadata: Metadata = {
  title: "Daily Reminders",
  description:
    "Short reminders upon the Qur'an and Sunnah from trusted scholars — to benefit the heart and strengthen the faith.",
};

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const rows = await db.query.reminders.findMany({
    where: (r) => eq(r.status, "published") && isNull(r.deletedAt),
    orderBy: [desc(reminders.publishedAt)],
    with: {
      scholar: {
        columns: { id: true, slug: true, name: true, honorifics: true },
        with: { avatarAsset: { columns: { publicUrl: true } } },
      },
    },
  });

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="bg-surface-subtle border-b border-border-default">
        <div className="container-site py-10">
          <SectionHeader
            overline="Benefit the Heart"
            heading="Daily Reminders"
            description="Short reminders upon the Qur'an and Sunnah to strengthen the faith."
            headingAs="h1"
          />
        </div>
      </div>

      <div className="container-site py-10 max-w-4xl">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3 text-center">
            <p className="font-display font-semibold text-lg text-ink-primary">
              No reminders yet
            </p>
            <p className="text-ink-muted text-sm">
              Reminders will appear here once published.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {rows.map((reminder) => {
              const scholarName = reminder.scholar
                ? formatScholarName(
                    reminder.scholar.honorifics ?? null,
                    reminder.scholar.name,
                  )
                : null;

              return (
                <Link
                  key={reminder.id}
                  href={`/reminders/${reminder.id}`}
                  className="card card-interactive p-6 flex flex-col gap-4 group"
                >
                  {/* Title */}
                  <h2 className="font-display font-bold text-lg text-ink-primary group-hover:text-primary-700 transition-colors leading-snug">
                    {reminder.title}
                  </h2>

                  {/* Source */}
                  {reminder.source && (
                    <p className="text-xs text-ink-muted italic">
                      — {reminder.source}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-3 mt-auto pt-3 border-t border-border-subtle">
                    {/* Scholar */}
                    {reminder.scholar && scholarName ? (
                      <div className="flex items-center gap-2">
                        {reminder.scholar.avatarAsset?.publicUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={reminder.scholar.avatarAsset.publicUrl}
                            alt={scholarName}
                            className="size-6 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="size-6 rounded-full bg-primary-700 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-white">
                              {reminder.scholar.name[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-ink-muted">
                          {scholarName}
                        </span>
                      </div>
                    ) : (
                      <span />
                    )}

                    {/* Date */}
                    {reminder.publishedAt && (
                      <span className="text-xs text-ink-muted shrink-0">
                        {formatRelativeDate(reminder.publishedAt)}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
