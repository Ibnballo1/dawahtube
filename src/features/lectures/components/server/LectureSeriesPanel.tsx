// src/features/lectures/components/server/LectureSeriesPanel.tsx
import Link from "next/link";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { cn } from "@shared/lib/utils";
import { formatDurationLong } from "@shared/lib/format";
import type { LectureSeriesContext } from "../../types/lecture.types";

interface LectureSeriesPanelProps {
  context: LectureSeriesContext;
  currentSlug: string;
}

export function LectureSeriesPanel({
  context,
  currentSlug,
}: LectureSeriesPanelProps) {
  const { series, position, prev, next, items } = context;

  return (
    <nav
      aria-label={`Series: ${series.title}`}
      className="rounded-2xl border border-primary-200 bg-primary-50 overflow-hidden"
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-5 py-4 bg-primary-700 flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-primary-200 font-medium uppercase tracking-wider">
            Series
          </span>
          <Link
            href={`/series/${series.slug}`}
            className="font-display font-bold text-white text-base leading-snug hover:text-accent-300 transition-colors line-clamp-1"
          >
            {series.title}
          </Link>
        </div>
        <Badge
          variant="default"
          size="sm"
          className="shrink-0 bg-primary-600 text-primary-100 border-primary-500"
        >
          {position + 1} / {series.itemCount}
        </Badge>
      </div>

      {/* ── Prev / Next navigation ──────────────────────────────────── */}
      <div className="grid grid-cols-2 divide-x divide-primary-200 border-b border-primary-200">
        {prev ? (
          <Link
            href={`/lectures/${prev.slug}`}
            className="flex flex-col gap-0.5 px-4 py-3 hover:bg-primary-100 transition-colors group"
            aria-label={`Previous lecture: ${prev.title}`}
          >
            <span className="text-xs text-primary-500 font-medium flex items-center gap-1">
              <ChevronLeft />
              Previous
            </span>
            <span className="text-sm font-medium text-primary-800 group-hover:text-primary-900 line-clamp-1">
              {prev.title}
            </span>
          </Link>
        ) : (
          <div className="px-4 py-3 opacity-40 flex flex-col gap-0.5">
            <span className="text-xs text-primary-500 font-medium flex items-center gap-1">
              <ChevronLeft />
              Previous
            </span>
            <span className="text-sm text-primary-400">Start of series</span>
          </div>
        )}

        {next ? (
          <Link
            href={`/lectures/${next.slug}`}
            className="flex flex-col gap-0.5 px-4 py-3 hover:bg-primary-100 transition-colors text-right group"
            aria-label={`Next lecture: ${next.title}`}
          >
            <span className="text-xs text-primary-500 font-medium flex items-center gap-1 justify-end">
              Next
              <ChevronRight />
            </span>
            <span className="text-sm font-medium text-primary-800 group-hover:text-primary-900 line-clamp-1">
              {next.title}
            </span>
          </Link>
        ) : (
          <div className="px-4 py-3 opacity-40 text-right flex flex-col gap-0.5">
            <span className="text-xs text-primary-500 font-medium flex items-center gap-1 justify-end">
              Next
              <ChevronRight />
            </span>
            <span className="text-sm text-primary-400">End of series</span>
          </div>
        )}
      </div>

      {/* ── Track listing (collapsed by default on mobile) ─────────── */}
      <details className="group" open>
        <summary className="flex items-center justify-between px-5 py-3 cursor-pointer text-sm font-semibold text-primary-700 hover:bg-primary-100 transition-colors list-none select-none">
          <span>All lectures in series</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="transition-transform duration-normal group-open:rotate-180"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </summary>

        <ol
          className="max-h-64 overflow-y-auto divide-y divide-primary-100"
          aria-label="Series track listing"
        >
          {items.map((item) => {
            const isCurrent = item.slug === currentSlug;
            return (
              <li key={item.lectureId}>
                <Link
                  href={`/lectures/${item.slug}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-5 py-2.5 text-sm",
                    "hover:bg-primary-100 transition-colors",
                    isCurrent
                      ? "bg-primary-100 font-semibold text-primary-800"
                      : "text-primary-700",
                  )}
                >
                  {/* Track number */}
                  <span
                    className={cn(
                      "size-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                      isCurrent
                        ? "bg-primary-700 text-white"
                        : "bg-primary-200 text-primary-600",
                    )}
                    aria-hidden="true"
                  >
                    {isCurrent ? <PlayingDot /> : item.position + 1}
                  </span>

                  {/* Title */}
                  <span className="flex-1 line-clamp-1">{item.title}</span>

                  {/* Duration */}
                  {item.durationSecs && (
                    <span className="text-xs text-primary-400 shrink-0 font-mono">
                      {formatDurationLong(item.durationSecs)}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </details>
    </nav>
  );
}

function ChevronLeft() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function PlayingDot() {
  return (
    <span
      className="flex gap-[2px] items-end h-3"
      aria-label="Currently playing"
    >
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[2px] bg-white rounded-full animate-waveform"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </span>
  );
}
