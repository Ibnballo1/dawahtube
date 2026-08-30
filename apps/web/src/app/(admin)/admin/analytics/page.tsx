// src/app/(admin)/admin/analytics/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  getPlatformTotals,
  getTopLectures,
  getTopArticles,
  getTopScholars,
  getRecentlyPublished,
} from "@features/admin/queries/analytics.queries";
import {
  formatCount,
  formatRelativeDate,
  formatScholarName,
} from "@shared/lib/format";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [totals, topLectures, topArticles, topScholars, recent] =
    await Promise.all([
      getPlatformTotals(),
      getTopLectures(10),
      getTopArticles(10),
      getTopScholars(10),
      getRecentlyPublished(8),
    ]);

  const totalViews = totals.lectureViews + totals.articleViews;

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-primary">
          Analytics
        </h1>
        <p className="text-ink-muted text-sm mt-1">
          Platform performance overview
        </p>
      </div>

      {/* Platform totals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total views"
          value={formatCount(totalViews)}
          sub="lectures + articles"
          icon="👁"
          highlight
        />
        <StatCard
          label="Lecture views"
          value={formatCount(totals.lectureViews)}
          sub={`${totals.publishedLectures} published`}
          icon="🎧"
        />
        <StatCard
          label="Article views"
          value={formatCount(totals.articleViews)}
          sub={`${totals.publishedArticles} published`}
          icon="📄"
        />
        <StatCard
          label="Book downloads"
          value={formatCount(totals.bookDownloads)}
          sub={`${totals.publishedBooks} published`}
          icon="📚"
        />
        <StatCard
          label="Scholars"
          value={formatCount(totals.totalScholars)}
          sub="active"
          icon="👨‍🏫"
        />
      </div>

      {/* Two-column: top lectures + top articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top lectures */}
        <div className="flex flex-col gap-3">
          <h2 className="font-display font-semibold text-lg text-ink-primary">
            Top lectures by views
          </h2>
          <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
            {topLectures.length === 0 ? (
              <EmptyAnalytics label="lecture views" />
            ) : (
              <div className="divide-y divide-border-subtle">
                {topLectures.map((lecture, idx) => (
                  <div
                    key={lecture.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-surface-subtle transition-colors"
                  >
                    <span className="text-xs font-bold text-ink-muted w-5 shrink-0 text-center">
                      {idx + 1}
                    </span>
                    {lecture.thumbnailAsset?.publicUrl && (
                      <div className="relative size-8 rounded overflow-hidden bg-surface-muted shrink-0">
                        <Image
                          src={lecture.thumbnailAsset.publicUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <Link
                        href={`/lectures/${lecture.slug}`}
                        target="_blank"
                        className="text-sm font-medium text-ink-primary hover:text-primary-700 transition-colors line-clamp-1"
                      >
                        {lecture.title}
                      </Link>
                      {lecture.scholar && (
                        <span className="text-xs text-ink-muted">
                          {formatScholarName(
                            lecture.scholar.honorifics ?? null,
                            lecture.scholar.name,
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-sm font-semibold text-ink-primary tabular-nums">
                        {formatCount(lecture.viewCount)}
                      </span>
                      <span className="text-[10px] text-ink-muted">views</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top articles */}
        <div className="flex flex-col gap-3">
          <h2 className="font-display font-semibold text-lg text-ink-primary">
            Top articles by views
          </h2>
          <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
            {topArticles.length === 0 ? (
              <EmptyAnalytics label="article views" />
            ) : (
              <div className="divide-y divide-border-subtle">
                {topArticles.map((article, idx) => (
                  <div
                    key={article.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-surface-subtle transition-colors"
                  >
                    <span className="text-xs font-bold text-ink-muted w-5 shrink-0 text-center">
                      {idx + 1}
                    </span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <Link
                        href={`/articles/${article.slug}`}
                        target="_blank"
                        className="text-sm font-medium text-ink-primary hover:text-primary-700 transition-colors line-clamp-1"
                      >
                        {article.title}
                      </Link>
                      {article.scholar && (
                        <span className="text-xs text-ink-muted">
                          {formatScholarName(
                            article.scholar.honorifics ?? null,
                            article.scholar.name,
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-sm font-semibold text-ink-primary tabular-nums">
                        {formatCount(article.viewCount)}
                      </span>
                      <span className="text-[10px] text-ink-muted">views</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top scholars */}
      <div className="flex flex-col gap-3">
        <h2 className="font-display font-semibold text-lg text-ink-primary">
          Top scholars by lecture views
        </h2>
        <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
          {topScholars.length === 0 ? (
            <EmptyAnalytics label="scholar data" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-subtle">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                      #
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                      Scholar
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                      Lectures
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                      Total views
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {topScholars.map((row, idx) => {
                    const displayName = formatScholarName(
                      row.scholar.honorifics ?? null,
                      row.scholar.name,
                    );
                    return (
                      <tr
                        key={row.scholar.id}
                        className="hover:bg-surface-subtle transition-colors"
                      >
                        <td className="px-4 py-3 text-xs font-bold text-ink-muted">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {row.scholar.avatarAsset?.publicUrl ? (
                              <Image
                                src={row.scholar.avatarAsset.publicUrl}
                                alt={displayName}
                                width={28}
                                height={28}
                                className="rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="size-7 rounded-full bg-primary-700 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-white">
                                  {row.scholar.name[0]?.toUpperCase()}
                                </span>
                              </div>
                            )}
                            <Link
                              href={`/scholars/${row.scholar.slug}`}
                              target="_blank"
                              className="font-medium text-ink-primary hover:text-primary-700 transition-colors"
                            >
                              {displayName}
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-ink-secondary tabular-nums">
                          {formatCount(row.lectureCount)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-ink-primary tabular-nums">
                          {formatCount(row.totalViews)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recently published */}
      <div className="flex flex-col gap-3">
        <h2 className="font-display font-semibold text-lg text-ink-primary">
          Recently published
        </h2>
        <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-subtle">
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden sm:table-cell">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden md:table-cell">
                  Scholar
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Views
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden lg:table-cell">
                  Published
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {recent.map((item) => (
                <tr
                  key={`${item.type}-${item.id}`}
                  className="hover:bg-surface-subtle transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/${item.type === "lecture" ? "lectures" : "articles"}/${item.slug}`}
                      target="_blank"
                      className="font-medium text-ink-primary hover:text-primary-700 transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        item.type === "lecture"
                          ? "bg-primary-50 text-primary-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-tertiary text-xs hidden md:table-cell">
                    {item.scholar
                      ? formatScholarName(
                          item.scholar.honorifics ?? null,
                          item.scholar.name,
                        )
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-ink-primary tabular-nums">
                    {formatCount(item.viewCount)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-ink-muted hidden lg:table-cell">
                    {item.publishedAt
                      ? formatRelativeDate(item.publishedAt)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-surface-card border rounded-xl p-5 flex flex-col gap-2 ${
        highlight ? "border-primary-200 bg-primary-50" : "border-border-default"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-secondary">{label}</span>
        <span className="text-lg" role="img" aria-hidden="true">
          {icon}
        </span>
      </div>
      <span
        className={`font-display font-bold text-2xl tabular-nums ${
          highlight ? "text-primary-700" : "text-ink-primary"
        }`}
      >
        {value}
      </span>
      <span className="text-xs text-ink-muted">{sub}</span>
    </div>
  );
}

function EmptyAnalytics({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-ink-muted text-sm">
      No {label} yet. Data will appear as users engage with content.
    </div>
  );
}
