// src/core/audit/types.ts
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "restore"
  | "login"
  | "logout"
  | "permission_change"
  | "featured_update";

export interface AuditEntry {
  userId: string;
  action: AuditAction;
  entity: string; // 'lecture', 'article', etc.
  entityId: string;
  before?: Record<string, unknown>; // snapshot before change
  after?: Record<string, unknown>; // snapshot after change
  metadata?: Record<string, unknown>; // IP, user-agent, etc.
}
