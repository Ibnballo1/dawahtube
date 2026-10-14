// src/app/(main)/account/bookmarks/page.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import auth from "@core/auth/config";
import { getBookmarks } from "@features/account/actions/history-bookmark.actions";
import { Badge } from "@shared/components/ui/badge";
import {
  formatScholarName,
  formatDurationLong,
  formatRelativeDate,
} from "@shared/lib/format";
import { RemoveBookmarkButton } from "@/features/account/components/RemoveBookmarkButton";

export const metadata: Metadata = { title: "My Bookmarks" };
export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  if (!session?.user) redirect("/sign-in?redirect=/account/bookmarks");

  const bookmarkList = await getBookmarks(100);

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
          <h1 className="font-display font-bold text-3xl text-ink-primary mt-3">
            My Bookmarks
          </h1>
          <p className="text-ink-muted text-sm mt-1">
            {bookmarkList.length} saved lecture
            {bookmarkList.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="container-site py-8 max-w-3xl">
        {bookmarkList.length === 0 ? (
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
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-display font-semibold text-lg text-ink-primary">
                No bookmarks yet
              </p>
              <p className="text-ink-muted text-sm mt-1 max-w-[36ch]">
                Bookmark lectures to save them here for easy access later.
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
            {bookmarkList.map((bm) => {
              const lecture = bm.lecture;
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

              return (
                <div
                  key={bm.id}
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
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    {lecture.category && (
                      <Badge
                        variant="primary"
                        size="sm"
                        className="text-[10px] w-fit"
                      >
                        {lecture.category.name}
                      </Badge>
                    )}
                    <Link
                      href={`/lectures/${lecture.slug}`}
                      className="font-display font-semibold text-sm text-ink-primary hover:text-primary-700 transition-colors line-clamp-1"
                    >
                      {lecture.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-ink-muted">
                      {scholarName && <span>{scholarName}</span>}
                      {duration && <span>{formatDurationLong(duration)}</span>}
                      <span>Saved {formatRelativeDate(bm.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
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
                    <RemoveBookmarkButton lectureId={lecture.id} />
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
