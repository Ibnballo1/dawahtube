// src/core/auth/permissions.ts
export const PERMISSIONS = {
  // Lectures
  LECTURE_VIEW: "lecture:view",
  LECTURE_CREATE: "lecture:create",
  LECTURE_EDIT: "lecture:edit",
  LECTURE_PUBLISH: "lecture:publish",
  LECTURE_DELETE: "lecture:delete",

  // Articles
  ARTICLE_VIEW: "article:view",
  ARTICLE_CREATE: "article:create",
  ARTICLE_EDIT: "article:edit",
  ARTICLE_PUBLISH: "article:publish",
  ARTICLE_DELETE: "article:delete",

  // Books
  BOOK_VIEW: "book:view",
  BOOK_CREATE: "book:create",
  BOOK_EDIT: "book:edit",
  BOOK_PUBLISH: "book:publish",
  BOOK_DELETE: "book:delete",

  // Scholars
  SCHOLAR_VIEW: "scholar:view",
  SCHOLAR_CREATE: "scholar:create",
  SCHOLAR_EDIT: "scholar:edit",
  SCHOLAR_DELETE: "scholar:delete",

  // Reminders
  REMINDER_CREATE: "reminder:create",
  REMINDER_EDIT: "reminder:edit",
  REMINDER_DELETE: "reminder:delete",

  // Admin
  USER_MANAGE: "user:manage",
  ROLE_MANAGE: "role:manage",
  ANALYTICS_VIEW: "analytics:view",
  AUDIT_VIEW: "audit:view",
  FEATURED_MANAGE: "featured:manage", // Homepage CMS — see #7
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Default role configurations (seeded to DB)
export const DEFAULT_ROLES: Record<
  string,
  { label: string; permissions: Permission[] }
> = {
  super_admin: {
    label: "Super Admin",
    permissions: Object.values(PERMISSIONS), // all
  },
  admin: {
    label: "Admin",
    permissions: [
      PERMISSIONS.LECTURE_CREATE,
      PERMISSIONS.LECTURE_EDIT,
      PERMISSIONS.LECTURE_PUBLISH,
      PERMISSIONS.LECTURE_DELETE,
      PERMISSIONS.ARTICLE_CREATE,
      PERMISSIONS.ARTICLE_EDIT,
      PERMISSIONS.ARTICLE_PUBLISH,
      PERMISSIONS.ARTICLE_DELETE,
      PERMISSIONS.BOOK_CREATE,
      PERMISSIONS.BOOK_EDIT,
      PERMISSIONS.BOOK_PUBLISH,
      PERMISSIONS.BOOK_DELETE,
      PERMISSIONS.SCHOLAR_CREATE,
      PERMISSIONS.SCHOLAR_EDIT,
      PERMISSIONS.REMINDER_CREATE,
      PERMISSIONS.REMINDER_EDIT,
      PERMISSIONS.FEATURED_MANAGE,
      PERMISSIONS.ANALYTICS_VIEW,
    ],
  },
  editor: {
    label: "Editor",
    permissions: [
      PERMISSIONS.LECTURE_CREATE,
      PERMISSIONS.LECTURE_EDIT,
      PERMISSIONS.ARTICLE_CREATE,
      PERMISSIONS.ARTICLE_EDIT,
      PERMISSIONS.BOOK_CREATE,
      PERMISSIONS.BOOK_EDIT,
      PERMISSIONS.REMINDER_CREATE,
      PERMISSIONS.REMINDER_EDIT,
    ],
  },
  reader: {
    label: "Reader",
    permissions: [
      PERMISSIONS.LECTURE_VIEW,
      PERMISSIONS.ARTICLE_VIEW,
      PERMISSIONS.BOOK_VIEW,
      PERMISSIONS.SCHOLAR_VIEW,
    ],
  },
};

export async function requirePermission(permission: Permission) {
  // Placeholder implementation - replace with real auth logic
  const userPermissions: Permission[] = [
    PERMISSIONS.LECTURE_CREATE,
    PERMISSIONS.ARTICLE_EDIT,
    PERMISSIONS.FEATURED_MANAGE,
  ]; // Example: fetched from user session or DB

  if (!userPermissions.includes(permission)) {
    throw new Error("Insufficient permissions");
  }
}
