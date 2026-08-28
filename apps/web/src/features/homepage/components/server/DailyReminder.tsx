// src/features/homepage/components/server/DailyReminder.tsx
import Link from "next/link";
import Image from "next/image";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@core/content/mdx-components";
import { getDailyReminder } from "../../queries/get-homepage-data";
import { formatScholarName } from "@shared/lib/format";

export async function DailyReminder() {
  const reminder = await getDailyReminder();
  if (!reminder) return null;

  // Render MDX server-side — no client JS required.
  // Falls back gracefully to plain text paragraphs if MDX parsing fails
  // (e.g. reminder contains special characters or unregistered components).
  let renderedContent: React.ReactNode = null;

  if (reminder.content) {
    try {
      const { content } = await compileMDX({
        source: reminder.content,
        components: mdxComponents,
        options: { parseFrontmatter: false },
      });
      renderedContent = content;
    } catch {
      // Plain text fallback — split on double newlines to preserve paragraphs
      renderedContent = (
        <div className="space-y-4">
          {reminder.content
            .split(/\n\n+/)
            .filter(Boolean)
            .map((para, i) => (
              <p key={i} className="text-white/75 leading-relaxed">
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
    <section
      className="section bg-primary-950 relative overflow-hidden"
      aria-labelledby="reminder-heading"
    >
      {/* Decorative Arabic watermark */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <p
          className="font-arabic text-[30vw] leading-none text-white/[0.02]"
          dir="rtl"
          lang="ar"
        >
          ذِكْر
        </p>
      </div>

      {/* Gold top border accent */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-700 to-transparent"
      />

      <div className="container-site relative z-10">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-8">
          {/* Overline */}
          <div className="flex flex-col items-center gap-3">
            <span className="label-overline text-accent-500">
              Daily Reminder
            </span>
            <span className="block w-8 h-px bg-accent-700" aria-hidden="true" />
          </div>

          {/* Title */}
          <h2
            id="reminder-heading"
            className="font-display font-bold text-2xl sm:text-3xl text-white leading-tight"
          >
            {reminder.title}
          </h2>

          {/* MDX / plain text content */}
          {renderedContent && (
            <div className="prose-reminder w-full text-left">
              {renderedContent}
            </div>
          )}

          {/* Source citation */}
          {reminder.source && (
            <p className="text-sm text-white/40 italic">— {reminder.source}</p>
          )}

          {/* Scholar attribution */}
          {reminder.scholar && scholarName && (
            <Link
              href={`/scholars/${reminder.scholar.slug}`}
              className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white/80 transition-colors group"
            >
              {reminder.imageAsset?.publicUrl ? (
                <div className="relative size-7 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={reminder.imageAsset.publicUrl}
                    alt={scholarName}
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                </div>
              ) : (
                <span className="size-7 rounded-full bg-primary-700 flex items-center justify-center text-xs font-bold text-white shrink-0 group-hover:bg-primary-600 transition-colors">
                  {reminder.scholar.name[0]?.toUpperCase()}
                </span>
              )}
              <span className="group-hover:text-white/80 transition-colors">
                {scholarName}
              </span>
            </Link>
          )}

          {/* CTA */}
          <Link
            href="/reminders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white/70 border border-white/20 hover:bg-white/10 hover:border-white/40 hover:text-white transition-colors"
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
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Browse all reminders
          </Link>
        </div>
      </div>

      {/* Gold bottom border accent */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-700 to-transparent"
      />
    </section>
  );
}
