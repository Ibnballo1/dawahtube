// src/features/admin/types/admin.types.ts

import type { Permission } from "@core/auth/permissions";

// ─── Admin user context ───────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  permissions: Permission[];
}

// ─── Admin nav items ──────────────────────────────────────────────────────────

export interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  permission?: Permission; // hide item if user lacks this permission
  badge?: number; // unread count, pending items, etc.
  children?: AdminNavItem[];
}

// ─── Table action result ──────────────────────────────────────────────────────
// Returned by every admin Server Action that mutates a row.

export type ActionResult<T = void> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; field?: string };

// ─── Content status transition map ────────────────────────────────────────────
// Which status transitions are allowed from each state.

export const STATUS_TRANSITIONS = {
  draft: ["review", "published", "archived"],
  review: ["draft", "scheduled", "published", "archived"],
  scheduled: ["published", "draft", "archived"],
  published: ["archived"],
  archived: ["draft"],
} as const;

export type ContentStatus = keyof typeof STATUS_TRANSITIONS;

// ─── Admin dashboard stats ────────────────────────────────────────────────────

export interface DashboardStats {
  lectures: {
    total: number;
    published: number;
    draft: number;
    pending: number;
  };
  articles: {
    total: number;
    published: number;
    draft: number;
    pending: number;
  };
  books: { total: number; published: number; draft: number };
  scholars: { total: number; active: number };
  users: { total: number };
  recentAuditLogs: Array<{
    id: string;
    action: string;
    entity: string;
    entityId: string;
    userId: string | null;
    userName: string | null;
    createdAt: Date;
  }>;
}
