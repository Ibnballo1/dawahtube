// src/app/api/v1/featured/route.ts
//
// Returns all active featured slot assignments with their content data.
// Mobile app uses this to build the home screen:
//   - hero_lecture       → featured hero lecture
//   - featured_lectures  → horizontal scroll row
//   - featured_scholars  → scholar grid
//   - daily_reminder     → reminder card

import { type NextRequest } from "next/server";
import { db } from "@core/database/client";
import {
  featuredSlots,
  lectures,
  scholars,
  reminders,
} from "@core/database/schema";
import { eq, and, isNull, asc } from "drizzle-orm";
import { ok, err, withCors, OPTIONS } from "../_helpers";

export { OPTIONS };

export async function GET(_req: NextRequest) {
  try {
    // Get all active, non-expired slots
    const slots = await db.query.featuredSlots.findMany({
      where: and(eq(featuredSlots.isActive, true)),
      orderBy: [asc(featuredSlots.slotKey), asc(featuredSlots.position)],
    });

    if (!slots.length) return withCors(ok({}));

    // Group slots by key for easy lookup
    const byKey: Record<string, typeof slots> = {};
    for (const slot of slots) {
      if (!byKey[slot.slotKey]) byKey[slot.slotKey] = [];
      byKey[slot.slotKey]!.push(slot);
    }

    // Fetch lecture IDs referenced in featured slots
    const lectureIds = slots
      .filter((s) => s.entityType === "lecture")
      .map((s) => s.entityId);

    const scholarIds = slots
      .filter((s) => s.entityType === "scholar")
      .map((s) => s.entityId);

    const reminderIds = slots
      .filter((s) => s.entityType === "reminder")
      .map((s) => s.entityId);

    // Parallel fetch all referenced entities
    const [lectureRows, scholarRows, reminderRows] = await Promise.all([
      lectureIds.length
        ? db.query.lectures.findMany({
            where: (l, { inArray, and, isNull }) =>
              and(inArray(l.id, lectureIds), isNull(l.deletedAt)),
            with: {
              scholar: {
                columns: { id: true, slug: true, name: true, honorifics: true },
              },
              thumbnailAsset: { columns: { publicUrl: true, altText: true } },
              audioAsset: { columns: { id: true, durationSecs: true } },
            },
          })
        : Promise.resolve([]),

      scholarIds.length
        ? db.query.scholars.findMany({
            where: (s, { inArray }) => inArray(s.id, scholarIds),
            with: { avatarAsset: { columns: { publicUrl: true } } },
          })
        : Promise.resolve([]),

      reminderIds.length
        ? db.query.reminders.findMany({
            where: (r, { inArray }) => inArray(r.id, reminderIds),
            with: {
              scholar: {
                columns: { id: true, slug: true, name: true, honorifics: true },
              },
            },
          })
        : Promise.resolve([]),
    ]);

    // Index by ID for fast lookup
    const lectureMap = Object.fromEntries(lectureRows.map((l) => [l.id, l]));
    const scholarMap = Object.fromEntries(scholarRows.map((s) => [s.id, s]));
    const reminderMap = Object.fromEntries(reminderRows.map((r) => [r.id, r]));

    // Shape the response by slot key
    const featured: Record<string, unknown> = {};

    for (const [key, slotList] of Object.entries(byKey)) {
      const shaped = slotList
        .map((slot) => {
          if (slot.entityType === "lecture") {
            const l = lectureMap[slot.entityId];
            if (!l) return null;
            return {
              id: l.id,
              slug: l.slug,
              title: l.title,
              description: l.description,
              durationSecs:
                l.durationSecs ?? l.audioAsset?.durationSecs ?? null,
              hasAudio: !!l.audioAsset,
              thumbnail: l.thumbnailAsset?.publicUrl ?? null,
              scholar: l.scholar
                ? {
                    id: l.scholar.id,
                    slug: l.scholar.slug,
                    displayName: [l.scholar.honorifics, l.scholar.name]
                      .filter(Boolean)
                      .join(" "),
                  }
                : null,
            };
          }

          if (slot.entityType === "scholar") {
            const s = scholarMap[slot.entityId];
            if (!s) return null;
            return {
              id: s.id,
              slug: s.slug,
              displayName: [s.honorifics, s.name].filter(Boolean).join(" "),
              lectureCount: s.lectureCount,
              avatar: s.avatarAsset?.publicUrl ?? null,
            };
          }

          if (slot.entityType === "reminder") {
            const r = reminderMap[slot.entityId];
            if (!r) return null;
            return {
              id: r.id,
              title: r.title,
              content: r.content,
              source: r.source,
              scholar: r.scholar
                ? {
                    id: r.scholar.id,
                    slug: r.scholar.slug,
                    displayName: [r.scholar.honorifics, r.scholar.name]
                      .filter(Boolean)
                      .join(" "),
                  }
                : null,
            };
          }

          return null;
        })
        .filter(Boolean);

      // Single-slot keys return object, multi-slot keys return array
      featured[key] = slotList.length === 1 ? (shaped[0] ?? null) : shaped;
    }

    return withCors(ok(featured));
  } catch (e) {
    console.error("[GET /api/v1/featured]", e);
    return withCors(err("Failed to fetch featured content", 500));
  }
}
