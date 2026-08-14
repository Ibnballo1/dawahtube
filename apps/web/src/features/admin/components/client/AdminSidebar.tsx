"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  FileVideo,
  Users,
  FileText,
  FileTerminal,
  BookOpen,
  BookSearch,
  Bell,
  Star,
  UserCog,
  Menu,
  X,
  Home,
  LogOut,
} from "lucide-react";
import { authClient } from "@core/auth/client";
import { cn } from "@shared/lib/utils";
import { PERMISSIONS } from "@core/auth/permissions";
import type { AdminUser } from "../../types/admin.types";

interface AdminSidebarProps {
  user: AdminUser;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    exact: true,
    icon: LayoutDashboard,
  },
  {
    label: "Lectures",
    href: "/admin/lectures",
    permission: PERMISSIONS.LECTURE_VIEW,
    icon: Video,
  },
  {
    label: "Lecture Categories",
    href: "/admin/categories/lectures",
    permission: PERMISSIONS.LECTURE_EDIT,
    icon: FileVideo,
  },
  {
    label: "Scholars",
    href: "/admin/scholars",
    permission: PERMISSIONS.SCHOLAR_VIEW,
    icon: Users,
  },
  {
    label: "Articles",
    href: "/admin/articles",
    permission: PERMISSIONS.ARTICLE_VIEW,
    icon: FileText,
  },
  {
    label: "Article Categories",
    href: "/admin/categories/articles",
    permission: PERMISSIONS.ARTICLE_EDIT,
    icon: FileTerminal,
  },
  {
    label: "Library",
    href: "/admin/library",
    permission: PERMISSIONS.BOOK_VIEW,
    icon: BookOpen,
  },
  {
    label: "Book Categories",
    href: "/admin/categories/library",
    permission: PERMISSIONS.BOOK_EDIT,
    icon: BookSearch,
  },
  {
    label: "Reminders",
    href: "/admin/reminders",
    permission: PERMISSIONS.REMINDER_CREATE,
    icon: Bell,
  },
  {
    label: "Featured",
    href: "/admin/featured",
    permission: PERMISSIONS.FEATURED_MANAGE,
    icon: Star,
  },
  {
    label: "Users",
    href: "/admin/users",
    permission: PERMISSIONS.USER_MANAGE,
    icon: UserCog,
  },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Safely fallback to an empty array if user.permissions is undefined
  const userPermissions = user.permissions ?? [];

  // Super admins bypass individual permission checks, or match against user.permissions array
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.permission) return true;
    if (user.role === "super_admin") return true;
    return userPermissions.includes(item.permission as never);
  });

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
        className="lg:hidden fixed top-3 left-4 z-modal size-10 flex items-center justify-center rounded-lg bg-surface-card border border-border-default shadow-md"
        onClick={() => setOpen(true)}
        aria-label="Open admin navigation"
      >
        <Menu className="size-5 text-ink-primary" />
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
        {/* Header / Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10 shrink-0">
          <div className="size-7 rounded-md bg-primary-700 flex items-center justify-center text-accent-400 font-bold text-xs">
            DT
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
            <X className="size-4" />
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
              const Icon = item.icon;

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
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        active ? "text-accent-400" : "text-white/40",
                      )}
                    />
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
                {user.role?.replace("_", " ")}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Home className="size-3.5" />
              Site
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-white/50 hover:text-red-400 hover:bg-white/5 transition-colors disabled:opacity-40"
            >
              <LogOut className="size-3.5" />
              {signingOut ? "…" : "Sign out"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
