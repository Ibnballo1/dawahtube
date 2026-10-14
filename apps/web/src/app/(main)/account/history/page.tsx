// src/app/(main)/account/history/page.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import auth from "@core/auth/config";
import { getListeningHistory } from "@features/account/actions/history-bookmark.actions";
import {
  formatScholarName,
  formatDurationLong,
  formatRelativeDate,
} from "@shared/lib/format";
import { ClearHistoryButton } from "@/features/account/components/ClearHistoryButton";

export const metadata: Metadata = { title: "Listening History" };
export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  if (!session?.user) redirect("/sign-in?redirect=/account/history");

  const history = await getListeningHistory(50);

  return (
    <div className="min-h-screen bg-surface-base">
      <div className="bg-surface-subtle border-b border-border-default">
        <div className="container-site py-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/account"
              className="text-ink-muted hover:text-ink-primary transition-colors text-sm"
            >
              ← Account
            </Link>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-3xl text-ink-primary mt-3">
                Listening History
              </h1>
              <p className="text-ink-muted text-sm mt-1">
                {history.length} lecture{history.length !== 1 ? "s" : ""} played
              </p>
            </div>
            {history.length > 0 && <ClearHistoryButton />}
          </div>
        </div>
      </div>

      <div className="container-site py-8 max-w-3xl">
        {history.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4 text-center">
            <div className="size-16 rounded-2xl bg-surface-subtle border border-border-default flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className="font-display font-semibold text-lg text-ink-primary">
                No history yet
              </p>
              <p className="text-ink-muted text-sm mt-1 max-w-[36ch]">
                Lectures you listen to will appear here.
              </p>
            </div>
            <Link
              href="/lectures"
              className="px-5 py-2.5 rounded-xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors"
            >
              Browse lectures
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border-subtle bg-surface-card border border-border-default rounded-2xl overflow-hidden">
            {history.map((entry) => {
              const lecture = entry.lecture;
              const scholarName = lecture.scholar
                ? formatScholarName(
                    lecture.scholar.honorifics ?? null,
                    lecture.scholar.name,
                  )
                : null;
              const duration =
                lecture.durationSecs ??
                lecture.audioAsset?.durationSecs ??
                null;
              const progress =
                duration && entry.progressSecs
                  ? Math.round((entry.progressSecs / duration) * 100)
                  : 0;

              return (
                <div
                  key={entry.id}
                  className="group flex items-center gap-4 px-5 py-4 hover:bg-surface-subtle transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative size-12 rounded-lg overflow-hidden bg-surface-muted shrink-0">
                    {lecture.thumbnailAsset?.publicUrl ? (
                      <Image
                        src={lecture.thumbnailAsset.publicUrl}
                        alt={lecture.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <Image
                        src="/images/lecture-default.png"
                        alt={lecture.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    )}
                    {/* Completed badge */}
                    {entry.completed && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2.5"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <Link
                      href={`/lectures/${lecture.slug}`}
                      className="font-display font-semibold text-sm text-ink-primary hover:text-primary-700 transition-colors line-clamp-1"
                    >
                      {lecture.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-ink-muted">
                      {scholarName && <span>{scholarName}</span>}
                      {duration && <span>{formatDurationLong(duration)}</span>}
                    </div>

                    {/* Progress bar */}
                    {progress > 0 && !entry.completed && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-border-default rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-700 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-ink-muted tabular-nums shrink-0">
                          {progress}%
                        </span>
                      </div>
                    )}
                    {entry.completed && (
                      <span className="text-[10px] text-green-600 font-medium">
                        ✓ Completed
                      </span>
                    )}
                  </div>

                  {/* Date + play */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-ink-muted">
                      {formatRelativeDate(entry.playedAt)}
                    </span>
                    <Link
                      href={`/lectures/${lecture.slug}`}
                      className="size-8 rounded-full border border-border-default flex items-center justify-center text-ink-muted hover:bg-primary-700 hover:border-primary-700 hover:text-white transition-all duration-fast"
                      aria-label={`Play ${lecture.title}`}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
