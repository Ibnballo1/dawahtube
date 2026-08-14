// src/app/api/v1/reminders/route.ts
import { type NextRequest } from "next/server";
import { db } from "@core/database/client";
import { reminders } from "@core/database/schema";
import { eq, isNull, desc } from "drizzle-orm";
import { ok, err, withCors, OPTIONS } from "../_helpers";

export { OPTIONS };

// GET /api/v1/reminders — returns the latest published reminder
// Mobile app uses this for the daily reminder notification and home screen widget.
export async function GET(_req: NextRequest) {
  try {
    const reminder = await db.query.reminders.findFirst({
      where: (r) =>
        eq(reminders.status, "published") && isNull(reminders.deletedAt),
      orderBy: [desc(reminders.publishedAt)],
      with: {
        scholar: {
          columns: { id: true, slug: true, name: true, honorifics: true },
        },
      },
    });

    if (!reminder) return withCors(ok(null));

    return withCors(
      ok({
        id: reminder.id,
        title: reminder.title,
        content: reminder.content, // raw MDX — mobile strips to plain text
        source: reminder.source,
        scholar: reminder.scholar
          ? {
              id: reminder.scholar.id,
              slug: reminder.scholar.slug,
              displayName: [reminder.scholar.honorifics, reminder.scholar.name]
                .filter(Boolean)
                .join(" "),
            }
          : null,
      }),
    );
  } catch (e) {
    console.error("[GET /api/v1/reminders]", e);
    return withCors(err("Failed to fetch reminder", 500));
  }
}
