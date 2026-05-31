// src/core/jobs/publish-scheduled.ts
// Called by a Vercel Cron job at /api/cron/publish-scheduled
// vercel.json:  { "crons": [{ "path": "/api/cron/publish-scheduled", "schedule": "*/5 * * * *" }] }
import { db } from "@core/database/client";
import { lectures, articles, books } from "@core/database/schema";
import { eq, and, lte, sql } from "drizzle-orm";

export async function publishScheduledContent() {
  const now = new Date();

  const tables = [
    { table: lectures, name: "lectures" },
    { table: articles, name: "articles" },
    { table: books, name: "books" },
  ];

  const results: Record<string, number> = {};

  for (const { table, name } of tables) {
    const updated = await db
      .update(table)
      .set({ status: "published", publishedAt: now, updatedAt: now })
      .where(and(eq(table.status, "scheduled"), lte(table.scheduledAt, now)))
      .returning({ id: table.id });

    results[name] = updated.length;
  }

  return results;
}
