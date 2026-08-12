// src/features/lectures/actions/lecture.actions.ts
"use server";

import { db } from "@core/database/client";
import { lectureViews, lectures } from "@core/database/schema";
import { eq, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { nanoid } from "nanoid";
import { z } from "zod";

// ─── Track a lecture view ─────────────────────────────────────────────────────
// Called from the client LectureViewTracker component on mount.
// sessionId is generated client-side (nanoid stored in sessionStorage).
// No auth required — anonymous tracking only.

const trackViewSchema = z.object({
  lectureId: z.string().min(1),
  sessionId: z.string().min(1).max(64),
  durationSecs: z.number().int().min(0).optional(),
});

export async function trackLectureView(
  input: z.infer<typeof trackViewSchema>,
): Promise<{ ok: boolean }> {
  const data = trackViewSchema.safeParse(input);
  if (!data.success) return { ok: false };

  try {
    // Upsert: same (lectureId, sessionId) pair only counts once
    await db
      .insert(lectureViews)
      .values({
        id: `lv_${nanoid(16)}`,
        lectureId: data.data.lectureId,
        sessionId: data.data.sessionId,
        durationSecs: data.data.durationSecs ?? null,
      })
      .onConflictDoUpdate({
        target: [lectureViews.lectureId, lectureViews.sessionId],
        set: { durationSecs: data.data.durationSecs ?? null },
      });

    // Increment the denormalised view_count on the lecture row
    // Cast to bigint via sql template to avoid integer overflow
    await db
      .update(lectures)
      .set({ viewCount: sql`(${lectures.viewCount}::bigint + 1)::text` })
      .where(eq(lectures.id, data.data.lectureId));

    return { ok: true };
  } catch {
    // Analytics failures must never crash the page
    return { ok: false };
  }
}

// ─── Admin: revalidate a lecture's cache after update ────────────────────────

export async function revalidateLecture(slug: string): Promise<void> {
  revalidateTag(`lecture-${slug}`, "max");
  revalidateTag("lectures", "max");
  revalidateTag("homepage-featured", "max");
}

// ─── Admin: revalidate lecture filter options after new lecture added ─────────

export async function revalidateLectureFilters(): Promise<void> {
  revalidateTag("lecture-filters", "max");
}
