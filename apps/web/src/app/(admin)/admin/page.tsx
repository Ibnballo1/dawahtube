// src/app/(admin)/admin/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { getDashboardStats } from "@features/admin/queries/admin.queries";
import { formatRelativeDate } from "@shared/lib/format";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      {/* Page header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-primary">
          Dashboard
        </h1>
        <p className="text-ink-muted text-sm mt-1">
          Platform overview and recent activity
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Lectures"
          total={stats.lectures.total}
          published={stats.lectures.published}
          pending={stats.lectures.pending}
          draft={stats.lectures.draft}
          href="/admin/lectures"
          color="emerald"
        />
        <StatCard
          label="Articles"
          total={stats.articles.total}
          published={stats.articles.published}
          pending={stats.articles.pending}
          draft={stats.articles.draft}
          href="/admin/articles"
          color="blue"
        />
        <StatCard
          label="Books"
          total={stats.books.total}
          published={stats.books.published}
          draft={stats.books.draft}
          href="/admin/library"
          color="amber"
        />
        <StatCard
          label="Scholars"
          total={stats.scholars.total}
          published={stats.scholars.active}
          href="/admin/scholars"
          color="purple"
          publishedLabel="Active"
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-col gap-3">
        <h2 className="font-display font-semibold text-lg text-ink-primary">
          Quick actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "New lecture",
              href: "/admin/lectures/new",
              color:
                "bg-primary-50 text-primary-700 hover:bg-primary-100 border-primary-200",
            },
            {
              label: "New article",
              href: "/admin/articles/new",
              color:
                "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
            },
            {
              label: "New scholar",
              href: "/admin/scholars/new",
              color:
                "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200",
            },
            {
              label: "Manage homepage",
              href: "/admin/featured",
              color:
                "bg-accent-200/50 text-amber-700 hover:bg-accent-200 border-amber-200",
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors duration-fast ${action.color}`}
            >
              <PlusIcon />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent audit log */}
      {stats.recentAuditLogs.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-display font-semibold text-lg text-ink-primary">
            Recent activity
          </h2>
          <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                    Action
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden sm:table-cell">
                    User
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                    When
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {stats.recentAuditLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-surface-subtle transition-colors"
                  >
                    <td className="px-4 py-3">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-4 py-3 text-ink-secondary capitalize">
                      {log.entity}
                      <span className="text-ink-muted ml-1 font-mono text-xs">
                        {log.entityId.slice(-6)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-tertiary hidden sm:table-cell">
                      {log.userName ?? "System"}
                    </td>
                    <td className="px-4 py-3 text-ink-muted text-xs">
                      {formatRelativeDate(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  total,
  published,
  pending,
  draft,
  href,
  color,
  publishedLabel = "Published",
}: {
  label: string;
  total: number;
  published: number;
  pending?: number;
  draft?: number;
  href: string;
  color: "emerald" | "blue" | "amber" | "purple";
  publishedLabel?: string;
}) {
  const colours = {
    emerald: {
      bg: "bg-primary-50",
      text: "text-primary-700",
      border: "border-primary-100",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-100",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-100",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-100",
    },
  }[color];

  return (
    <Link
      href={href}
      className="bg-surface-card border border-border-default rounded-xl p-5 flex flex-col gap-3 hover:shadow-md hover:border-border-emphasis transition-all duration-normal group"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink-secondary">
          {label}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${colours.bg} ${colours.text} border ${colours.border}`}
        >
          {total}
        </span>
      </div>
      <div className="flex flex-col gap-1 text-xs text-ink-muted">
        <span className="text-green-600 font-medium">
          {publishedLabel}: {published}
        </span>
        {pending !== undefined && pending > 0 && (
          <span className="text-yellow-600">Pending: {pending}</span>
        )}
        {draft !== undefined && <span>Draft: {draft}</span>}
      </div>
      <span
        className={`text-xs font-medium ${colours.text} opacity-0 group-hover:opacity-100 transition-opacity`}
      >
        Manage →
      </span>
    </Link>
  );
}

function ActionBadge({ action }: { action: string }) {
  const colours: Record<string, string> = {
    create: "bg-green-50 text-green-700",
    publish: "bg-blue-50 text-blue-700",
    update: "bg-yellow-50 text-yellow-700",
    delete: "bg-red-50 text-red-700",
    unpublish: "bg-orange-50 text-orange-700",
    archive: "bg-slate-100 text-slate-600",
  };
  const cls = colours[action] ?? "bg-surface-muted text-ink-secondary";
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}
    >
      {action}
    </span>
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
