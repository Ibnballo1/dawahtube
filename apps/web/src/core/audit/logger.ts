// src/core/audit/logger.ts

import { db } from "@core/database/client";
import { auditLogs } from "@core/database/schema";
import auth from "@/core/auth/config";
import { headers } from "next/headers";
import type { AuditEntry } from "./types";

// Add after imports, before writeAuditLog function
// Drizzle does not expose raw query methods on the db object for arbitrary SQL,
// so we protect via the repository pattern: no update/delete methods are
// exported from this module. The schema-level protection is the absence of
// any updateAuditLog or deleteAuditLog export in the entire codebase.
//
// Additional protection: the DB user used by the app (connection string) is
// granted INSERT-only on audit_logs. See docs/database-permissions.md.

// Exported: ONLY insert operations
// export { writeAuditLog, withAudit };
// NOT exported and NOT defined: updateAuditLog, deleteAuditLog, truncateAuditLogs

export async function writeAuditLog(
  entry: Omit<AuditEntry, "userId">,
): Promise<void> {
  const headersList = await headers();

  // Pass the awaited headers so Better Auth can read the session cookies
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) return;

  await db.insert(auditLogs).values({
    id: crypto.randomUUID(),
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId,
    before: entry.before ?? null,
    after: entry.after ?? null,
    metadata: {
      ip: headersList.get("x-forwarded-for") ?? "unknown",
      userAgent: headersList.get("user-agent") ?? "unknown",
      userId: session.user.id,
      ...entry.metadata,
    },
  });
}

// Higher-order wrapper for audited Server Actions
export function withAudit<TInput, TOutput>(
  action: (input: TInput) => Promise<TOutput>,
  auditConfig: { entity: string; actionType: AuditEntry["action"] },
) {
  return async (input: TInput): Promise<TOutput> => {
    const result = await action(input);
    await writeAuditLog({
      action: auditConfig.actionType,
      entity: auditConfig.entity,
      entityId: (result as { id?: string })?.id ?? "unknown",
      after: result as Record<string, unknown>,
    });
    return result;
  };
}
