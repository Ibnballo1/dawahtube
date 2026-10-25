import { ApiError } from "@/lib/api/errors";
import { storage } from "@/lib/storage/mmkv";
import { resolveImageUrl } from "@/lib/assets/resolveImageUrl";
import { DEFAULT_IMAGES } from "@/lib/assets/defaultImages";
import { useBookmarksStore } from "@/features/bookmarks/store/bookmarksStore";
import { useHistoryStore } from "@/features/history/store/historyStore";
import type {
  LectureBookmark,
  TimestampBookmark,
} from "@/features/bookmarks/types/bookmark.types";
import type { HistoryEntry } from "@/features/history/types/history.types";
import {
  useOutboxStore,
  removeOp,
  getSyncedUserId,
  setSyncedUserId,
} from "../store/outboxStore";
import { syncApi } from "./syncApi";
import {
  opKey,
  type OutboxOp,
  type ServerBookmark,
  type ServerHistoryEntry,
  type SyncResponse,
} from "../types/sync.types";

const POSITION_KEY = (lectureId: string) => `position:${lectureId}`;

function safeIso(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// ─── Server → local mapping ──────────────────────────────────────────────────

function toLocalBookmark(s: ServerBookmark): LectureBookmark {
  return {
    lectureId: s.lectureId,
    title: s.lecture.title,
    scholarName: s.lecture.scholar?.displayName ?? null,
    artworkUrl: resolveImageUrl(s.lecture.thumbnail, DEFAULT_IMAGES.lecture),
    createdAt: s.createdAt,
  };
}

function toLocalHistory(s: ServerHistoryEntry): HistoryEntry {
  // Seed the player's saved position so "Continue from…" works on this device too.
  if (!s.completed) storage.set(POSITION_KEY(s.lectureId), s.progressSecs);
  return {
    lectureId: s.lectureId,
    title: s.lecture.title,
    scholarName: s.lecture.scholar?.displayName ?? null,
    artworkUrl: resolveImageUrl(s.lecture.thumbnail, DEFAULT_IMAGES.lecture),
    durationSecs: s.lecture.durationSecs,
    positionSecs: s.progressSecs,
    completed: s.completed,
    lastPlayedAt: s.playedAt,
  };
}

function adoptServerState(state: SyncResponse) {
  const lecture: Record<string, LectureBookmark> = {};
  for (const b of state.bookmarks) lecture[b.lectureId] = toLocalBookmark(b);
  const timestamps: Record<string, TimestampBookmark> = {};
  for (const t of state.timestampBookmarks)
    timestamps[t.id] = { ...t, lectureTitle: t.lectureTitle };
  useBookmarksStore.getState().setAll(lecture, timestamps);

  const entries: Record<string, HistoryEntry> = {};
  for (const h of state.history) entries[h.lectureId] = toLocalHistory(h);
  useHistoryStore.getState().setAll(entries);
}

// ─── Outbox flushing ─────────────────────────────────────────────────────────

async function sendOp(op: OutboxOp) {
  switch (op.kind) {
    case "bookmark.put":
      return syncApi.putBookmark(op.lectureId, op.createdAt);
    case "bookmark.delete":
      return syncApi.deleteBookmark(op.lectureId);
    case "history.put":
      return syncApi.putHistory(op.lectureId, {
        progressSecs: op.progressSecs,
        completed: op.completed,
        playedAt: op.playedAt,
      });
    case "history.clear":
      return syncApi.clearHistory();
    case "tbookmark.put":
      return syncApi.putTimestampBookmark(op.id, {
        lectureId: op.lectureId,
        timestampSecs: op.timestampSecs,
        note: op.note,
        createdAt: op.createdAt,
      });
    case "tbookmark.delete":
      return syncApi.deleteTimestampBookmark(op.id);
  }
}

let flushing: Promise<void> | null = null;

export function flushOutbox(): Promise<void> {
  if (flushing) return flushing;
  flushing = (async () => {
    while (true) {
      const op = useOutboxStore.getState().ops[0];
      if (!op) return;
      try {
        await sendOp(op);
        removeOp(op);
      } catch (error) {
        const status =
          error instanceof ApiError && error.kind === "http"
            ? error.status
            : undefined;
        // Permanent rejection (lecture removed, bad payload, limit reached): retrying never helps.
        if (
          status &&
          status >= 400 &&
          status < 500 &&
          status !== 401 &&
          status !== 429
        ) {
          removeOp(op);
          continue;
        }
        return; // offline, server error, expired session, rate limited: keep it queued
      }
    }
  })().finally(() => {
    flushing = null;
  });
  return flushing;
}

// ─── Pull + reconcile ────────────────────────────────────────────────────────

async function pullAndReconcile() {
  const [serverBookmarks, serverHistory, serverTimestamps] = await Promise.all([
    syncApi.bookmarks(),
    syncApi.history(),
    syncApi.timestampBookmarks(),
  ]);

  // Read local state and pending ops AFTER the network wait, so anything the
  // user did during the request is in the outbox and protected below.
  const pending = new Map(
    useOutboxStore.getState().ops.map((o) => [opKey(o), o]),
  );
  const bookmarks = useBookmarksStore.getState();
  const history = useHistoryStore.getState();

  // Lecture bookmarks
  const nextLecture: Record<string, LectureBookmark> = {};
  const serverBookmarkIds = new Set(serverBookmarks.map((b) => b.lectureId));
  for (const sb of serverBookmarks) {
    if (pending.get(`bookmark:${sb.lectureId}`)?.kind === "bookmark.delete")
      continue;
    nextLecture[sb.lectureId] =
      bookmarks.lectureBookmarks[sb.lectureId] ?? toLocalBookmark(sb);
  }
  for (const [id, local] of Object.entries(bookmarks.lectureBookmarks)) {
    if (
      !serverBookmarkIds.has(id) &&
      pending.get(`bookmark:${id}`)?.kind === "bookmark.put"
    ) {
      nextLecture[id] = local; // not pushed yet
    }
  }

  // Timestamp bookmarks
  const nextTimestamps: Record<string, TimestampBookmark> = {};
  const serverTimestampIds = new Set(serverTimestamps.map((t) => t.id));
  for (const st of serverTimestamps) {
    if (pending.get(`tbookmark:${st.id}`)?.kind === "tbookmark.delete")
      continue;
    nextTimestamps[st.id] = bookmarks.timestampBookmarks[st.id] ?? st;
  }
  for (const [id, local] of Object.entries(bookmarks.timestampBookmarks)) {
    if (
      !serverTimestampIds.has(id) &&
      pending.get(`tbookmark:${id}`)?.kind === "tbookmark.put"
    ) {
      nextTimestamps[id] = local;
    }
  }
  bookmarks.setAll(nextLecture, nextTimestamps);

  // History (skipped entirely while a "clear" is still waiting to reach the server)
  if (!pending.has("history:*")) {
    const nextEntries: Record<string, HistoryEntry> = {};
    const serverHistoryIds = new Set(serverHistory.map((h) => h.lectureId));
    for (const sh of serverHistory) {
      const local = history.entries[sh.lectureId];
      const localIsNewer =
        local && new Date(local.lastPlayedAt) >= new Date(sh.playedAt);
      if (local && (pending.has(`history:${sh.lectureId}`) || localIsNewer)) {
        nextEntries[sh.lectureId] = local;
      } else {
        nextEntries[sh.lectureId] = toLocalHistory(sh);
      }
    }
    for (const [id, local] of Object.entries(history.entries)) {
      if (!serverHistoryIds.has(id) && pending.has(`history:${id}`))
        nextEntries[id] = local;
    }
    history.setAll(nextEntries);
  }
}

// ─── First sign-in merge ─────────────────────────────────────────────────────

async function initialMerge(userId: string) {
  const { lectureBookmarks, timestampBookmarks } = useBookmarksStore.getState();
  const { entries } = useHistoryStore.getState();

  const state = await syncApi.merge({
    bookmarks: Object.values(lectureBookmarks)
      .slice(0, 500)
      .map((b) => ({
        lectureId: b.lectureId,
        createdAt: safeIso(b.createdAt),
      })),
    history: Object.values(entries)
      .sort(
        (a, b) =>
          new Date(b.lastPlayedAt).getTime() -
          new Date(a.lastPlayedAt).getTime(),
      )
      .slice(0, 500)
      .map((e) => ({
        lectureId: e.lectureId,
        progressSecs: Math.floor(e.positionSecs),
        completed: e.completed,
        playedAt: safeIso(e.lastPlayedAt),
      })),
    timestampBookmarks: Object.values(timestampBookmarks)
      .slice(0, 500)
      .map((t) => ({
        id: t.id,
        lectureId: t.lectureId,
        timestampSecs: Math.floor(t.timestampSecs),
        note: t.note,
        createdAt: safeIso(t.createdAt),
      })),
  });

  adoptServerState(state);
  setSyncedUserId(userId); // from here on, local changes are queued for the server
}

// ─── Public API ──────────────────────────────────────────────────────────────

let inFlight: Promise<void> | null = null;

export function syncNow(userId: string): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const bound = getSyncedUserId();
      if (bound && bound !== userId) wipeLocalUserData(); // safety net; sign-out normally already did this
      if (getSyncedUserId() !== userId) {
        await initialMerge(userId);
      } else {
        await flushOutbox();
        await pullAndReconcile();
      }
    } catch (error) {
      console.warn("[sync] will retry on next trigger:", error);
    }
  })().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/** Removes everything account-bound from this device. */
export function wipeLocalUserData() {
  useBookmarksStore.getState().reset();
  useHistoryStore.getState().reset();
  useOutboxStore.getState().clear();
  setSyncedUserId(null);
  // MMKV v3 API. If tsc says `delete` doesn't exist, you're on v4: use `remove`.
  for (const key of storage.getAllKeys()) {
    if (key.startsWith("position:")) storage.remove(key);
  }
}
