// src/features/admin/actions/recording.actions.ts
"use server";

import { db } from "@core/database/client";
import { pendingRecordings, lectures } from "@core/database/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidateTag, revalidatePath } from "next/cache";
import { requirePermission } from "@core/auth/guard";
import { PERMISSIONS } from "@core/auth/permissions";
import { writeAuditLog } from "@core/audit/logger";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import auth from "@core/auth/config";
import { z } from "zod";
import type { ActionResult } from "../types/admin.types";

// ─── Submit a recording (recorder role) ──────────────────────────────────────

const submitSchema = z.object({
  title: z.string().max(255).optional(),
  scholarId: z.string().optional(),
  audioAssetId: z.string().min(1),
  durationSecs: z.number().int().min(0).optional(),
  notes: z.string().max(1000).optional(),
});

export async function submitRecording(
  input: z.infer<typeof submitSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  if (!session?.user) return { ok: false, error: "Not authenticated" };

  const data = submitSchema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const id = `rec_${nanoid(16)}`;

  await db.insert(pendingRecordings).values({
    id,
    title: data.data.title ?? null,
    scholarId: data.data.scholarId ?? null,
    audioAssetId: data.data.audioAssetId,
    durationSecs: data.data.durationSecs ?? null,
    notes: data.data.notes ?? null,
    recordedBy: session.user.id,
    status: "pending",
  });

  await writeAuditLog({
    action: "create",
    entity: "pending_recording",
    entityId: id,
  });

  revalidatePath("/admin/pending-recordings");

  return { ok: true, data: { id } };
}

// ─── Get all pending recordings (admin) ──────────────────────────────────────

export async function getPendingRecordings() {
  await requirePermission(PERMISSIONS.LECTURE_CREATE);

  return db.query.pendingRecordings.findMany({
    where: eq(pendingRecordings.status, "pending"),
    orderBy: [desc(pendingRecordings.createdAt)],
    with: {
      scholar: {
        columns: { id: true, slug: true, name: true, honorifics: true },
      },
      recordedBy: { columns: { id: true, name: true, email: true } },
      audioAsset: {
        columns: {
          id: true,
          key: true,
          bucket: true,
          durationSecs: true,
          sizeBytes: true,
        },
      },
    },
  });
}

// ─── Approve — convert to draft lecture ──────────────────────────────────────

export async function approveRecording(
  id: string,
  title: string,
): Promise<ActionResult<{ lectureId: string }>> {
  await requirePermission(PERMISSIONS.LECTURE_CREATE);

  const recording = await db.query.pendingRecordings.findFirst({
    where: eq(pendingRecordings.id, id),
    with: {
      audioAsset: { columns: { id: true, durationSecs: true } },
    },
  });

  if (!recording) return { ok: false, error: "Recording not found" };

  // Create a draft lecture from the recording
  const lectureId = `lec_${nanoid(16)}`;
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  await db.insert(lectures).values({
    id: lectureId,
    slug,
    title,
    scholarId: recording.scholarId ?? null,
    audioAssetId: recording.audioAssetId ?? null,
    durationSecs:
      recording.durationSecs ??
      (recording.audioAsset as { durationSecs: number | null } | null)
        ?.durationSecs ??
      null,
    status: "draft",
    defaultLanguage: "en",
    allowDownload: true,
  });

  // Mark recording as approved
  await db
    .update(pendingRecordings)
    .set({ status: "approved", updatedAt: new Date() })
    .where(eq(pendingRecordings.id, id));

  await writeAuditLog({
    action: "update",
    entity: "pending_recording",
    entityId: id,
    after: { status: "approved", lectureId },
  });

  revalidatePath("/admin/pending-recordings");
  revalidatePath("/admin/lectures");

  return { ok: true, data: { lectureId } };
}

// ─── Reject ───────────────────────────────────────────────────────────────────

export async function rejectRecording(
  id: string,
  reason: string,
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.LECTURE_CREATE);

  await db
    .update(pendingRecordings)
    .set({ status: "rejected", rejectedReason: reason, updatedAt: new Date() })
    .where(eq(pendingRecordings.id, id));

  await writeAuditLog({
    action: "update",
    entity: "pending_recording",
    entityId: id,
    after: { status: "rejected", reason },
  });

  revalidatePath("/admin/pending-recordings");

  return { ok: true };
}
