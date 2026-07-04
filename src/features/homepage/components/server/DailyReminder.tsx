// src/features/homepage/components/server/DailyReminder.tsx
import Link from "next/link";
import { Button } from "@shared/components/ui/button";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@core/content/mdx-components";
import { getDailyReminder } from "../../queries/get-homepage-data";
import { formatScholarName } from "@shared/lib/format";

export async function DailyReminder() {
  const reminder = await getDailyReminder();
  if (!reminder) return null;

  // Render MDX content server-side — no client JS required for readers
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
      // Fallback to plain text if MDX fails (e.g. invalid MDX in DB)
      renderedContent = <p>{reminder.content}</p>;
    }
  }

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

          {/* Reminder title */}
          <h2
            id="reminder-heading"
            className="font-display font-bold text-3xl text-white leading-tight tracking-snug"
          >
            {reminder.title}
          </h2>

          {/* MDX content */}
          {renderedContent && (
            <div className="prose-reminder w-full text-left">
              {renderedContent}
            </div>
          )}

          {/* Source */}
          {reminder.source && (
            <p className="text-sm text-white/40 italic">— {reminder.source}</p>
          )}

          {/* Scholar attribution */}
          {reminder.scholar && (
            <Link
              href={`/scholars/${reminder.scholar.slug}`}
              className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              <span className="size-6 rounded-full bg-primary-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {reminder.scholar.name[0]?.toUpperCase()}
              </span>
              {formatScholarName(
                reminder.scholar.honorifics ?? null,
                reminder.scholar.name,
              )}
            </Link>
          )}

          {/* Browse more reminders CTA */}
          <Button
            variant="secondary"
            className="border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40 hover:text-white"
            asChild
          >
            <Link href="/reminders">Browse all reminders</Link>
          </Button>
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
