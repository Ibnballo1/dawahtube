// src/app/(main)/reminders/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import { db } from "@core/database/client";
import { reminders } from "@core/database/schema";
import { eq, and, isNull, desc, ne } from "drizzle-orm";
import { articleMdxComponents } from "@core/content/mdx-components";
import {
  formatScholarName,
  formatRelativeDate,
  formatDate,
} from "@shared/lib/format";

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await db
    .select({ slug: reminders.id })
    .from(reminders)
    .where(and(eq(reminders.status, "published"), isNull(reminders.deletedAt)));
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const reminder = await db.query.reminders.findFirst({
    where: (r) =>
      and(eq(r.id, slug), eq(r.status, "published"), isNull(r.deletedAt)),
    columns: { title: true, source: true },
  });
  if (!reminder) return { title: "Reminder not found" };
  return {
    title: reminder.title,
    description: reminder.source
      ? `${reminder.title} — ${reminder.source}`
      : reminder.title,
  };
}

export default async function ReminderDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const reminder = await db.query.reminders.findFirst({
    where: (r) =>
      and(eq(r.id, slug), eq(r.status, "published"), isNull(r.deletedAt)),
    with: {
      scholar: {
        columns: {
          id: true,
          // slug: true,
          name: true,
          honorifics: true,
          arabicName: true,
        },
        with: { avatarAsset: { columns: { publicUrl: true, altText: true } } },
      },
      imageAsset: { columns: { publicUrl: true, altText: true } },
    },
  });

  if (!reminder) notFound();

  // Fetch 3 other reminders for the "More reminders" section
  const moreReminders = await db.query.reminders.findMany({
    where: (r) =>
      and(
        ne(r.id, reminder.id),
        eq(r.status, "published"),
        isNull(r.deletedAt),
      ),
    orderBy: [desc(reminders.publishedAt)],
    limit: 3,
    columns: { id: true, title: true, publishedAt: true },
  });

  // Render MDX
  let renderedContent: React.ReactNode = null;
  if (reminder.content) {
    try {
      const { content } = await compileMDX({
        source: reminder.content,
        // Use light-mode components for the detail page (white background)
        components: articleMdxComponents,
        options: { parseFrontmatter: false },
      });
      renderedContent = content;
    } catch {
      // Plain text fallback
      renderedContent = (
        <div className="space-y-4">
          {reminder.content
            .split(/\n\n+/)
            .filter(Boolean)
            .map((para, i) => (
              <p key={i} className="text-ink-secondary leading-relaxed">
                {para.trim()}
              </p>
            ))}
        </div>
      );
    }
  }

  const scholarName = reminder.scholar
    ? formatScholarName(
        reminder.scholar.honorifics ?? null,
        reminder.scholar.name,
      )
    : null;

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Breadcrumb */}
      <div className="bg-surface-subtle border-b border-border-default">
        <div className="container-site py-4">
          <nav
            className="flex items-center gap-2 text-sm text-ink-muted"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="hover:text-ink-secondary transition-colors"
            >
              Home
            </Link>
            <ChevronRight />
            <Link
              href="/reminders"
              className="hover:text-ink-secondary transition-colors"
            >
              Reminders
            </Link>
            <ChevronRight />
            <span
              className="text-ink-tertiary line-clamp-1"
              aria-current="page"
            >
              {reminder.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="container-site py-12 max-w-3xl">
        <article>
          {/* Header */}
          <header className="flex flex-col gap-5 mb-10">
            {/* Overline */}
            <div className="flex items-center gap-3">
              <span className="label-overline">Daily Reminder</span>
              <span className="rule-gold" aria-hidden="true" />
            </div>

            {/* Title */}
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink-primary leading-tight">
              {reminder.title}
            </h1>

            {/* Source */}
            {reminder.source && (
              <p className="text-sm text-ink-muted italic">
                — {reminder.source}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-4 flex-wrap text-sm text-ink-muted border-t border-border-subtle pt-4">
              {/* Scholar */}
              {reminder.scholar && scholarName && (
                <Link
                  href={`/scholars/${reminder.scholar.id}`}
                  className="flex items-center gap-2 hover:text-ink-primary transition-colors group"
                >
                  {reminder.scholar.avatarAsset?.publicUrl ? (
                    <Image
                      src={reminder.scholar.avatarAsset.publicUrl}
                      alt={scholarName}
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-7 rounded-full bg-primary-700 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-white">
                        {reminder.scholar.name[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="group-hover:text-primary-700 transition-colors">
                    {scholarName}
                  </span>
                </Link>
              )}

              {/* Date */}
              {reminder.publishedAt && (
                <time dateTime={new Date(reminder.publishedAt).toISOString()}>
                  {formatDate(reminder.publishedAt)}
                </time>
              )}
            </div>
          </header>

          {/* Optional cover image */}
          {reminder.imageAsset?.publicUrl && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 bg-surface-muted">
              <Image
                src={reminder.imageAsset.publicUrl}
                alt={reminder.imageAsset.altText ?? reminder.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          {/* MDX content */}
          {renderedContent && (
            <div className="prose-islamic">{renderedContent}</div>
          )}

          {/* Share / back */}
          <footer className="mt-12 pt-8 border-t border-border-default flex items-center justify-between gap-4 flex-wrap">
            <Link
              href="/reminders"
              className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink-primary transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              All reminders
            </Link>

            <p className="text-xs text-ink-muted italic">
              May Allah benefit us through it.
            </p>
          </footer>
        </article>

        {/* More reminders */}
        {moreReminders.length > 0 && (
          <aside className="mt-14">
            <h2 className="font-display font-bold text-xl text-ink-primary mb-5">
              More reminders
            </h2>
            <div className="flex flex-col gap-3">
              {moreReminders.map((r) => (
                <Link
                  key={r.id}
                  href={`/reminders/${r.id}`}
                  className="card card-interactive flex items-center justify-between gap-4 px-5 py-4 group"
                >
                  <span className="font-medium text-sm text-ink-primary group-hover:text-primary-700 transition-colors line-clamp-1">
                    {r.title}
                  </span>
                  {r.publishedAt && (
                    <span className="text-xs text-ink-muted shrink-0">
                      {formatRelativeDate(r.publishedAt)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function ChevronRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
