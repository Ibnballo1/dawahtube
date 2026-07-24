"use client";
// src/features/admin/components/client/AdminSidebar.tsx

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@core/auth/client";
import { useRouter } from "next/navigation";
import { cn } from "@shared/lib/utils";
import { PERMISSIONS } from "@core/auth/permissions";
import type { AdminUser } from "../../types/admin.types";

interface AdminSidebarProps {
  user: AdminUser;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    exact: true,
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Lectures",
    href: "/admin/lectures",
    permission: PERMISSIONS.LECTURE_VIEW,
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
  },
  {
    label: "Scholars",
    href: "/admin/scholars",
    permission: PERMISSIONS.SCHOLAR_VIEW,
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Articles",
    href: "/admin/articles",
    permission: PERMISSIONS.ARTICLE_VIEW,
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: "Library",
    href: "/admin/library",
    permission: PERMISSIONS.BOOK_VIEW,
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    label: "Reminders",
    href: "/admin/reminders",
    permission: PERMISSIONS.REMINDER_CREATE,
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    label: "Featured",
    href: "/admin/featured",
    permission: PERMISSIONS.FEATURED_MANAGE,
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    label: "Users",
    href: "/admin/users",
    permission: PERMISSIONS.USER_MANAGE,
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) =>
      !item.permission || user.permissions.includes(item.permission as never),
  );

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* ── Mobile toggle ───────────────────────────────────────────── */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-modal size-10 flex items-center justify-center rounded-lg bg-surface-card border border-border-default shadow-md"
        onClick={() => setOpen(true)}
        aria-label="Open admin navigation"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* ── Mobile overlay ──────────────────────────────────────────── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-overlay bg-ink-primary/50"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ───────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-sticky w-64 flex flex-col",
          "bg-primary-950 border-r border-white/10",
          "transition-transform duration-slow ease-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Admin navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10 shrink-0">
          <div className="size-7 rounded-md bg-primary-700 flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M14 4L16.2 10.5H23L17.4 14.5L19.6 21L14 17L8.4 21L10.6 14.5L5 10.5H11.8L14 4Z"
                fill="#D4AF37"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm text-white leading-none">
              Da&apos;wahTube
            </span>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">
              Admin
            </span>
          </div>

          {/* Close button — mobile only */}
          <button
            type="button"
            className="lg:hidden ml-auto text-white/50 hover:text-white p-1"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav
          className="flex-1 overflow-y-auto py-4 px-3"
          aria-label="Admin menu"
        >
          <ul className="flex flex-col gap-0.5" role="list">
            {visibleItems.map((item) => {
              const active = isActive(item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                      "transition-colors duration-fast",
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <span
                      className={cn(
                        active ? "text-accent-400" : "text-white/40",
                      )}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info + sign out */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="size-8 rounded-full bg-primary-700 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">
                {user.initials}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-white truncate">
                {user.name}
              </span>
              <span className="text-[10px] text-white/40 capitalize">
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Site
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-white/50 hover:text-red-400 hover:bg-white/5 transition-colors disabled:opacity-40"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {signingOut ? "…" : "Sign out"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
