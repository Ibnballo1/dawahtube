import { useHistoryStore, getHistoryEntry } from "../store/historyStore";
import { enqueue } from "@/features/sync/store/outboxStore";
import type { HistoryEntry } from "../types/history.types";
import type { QueueTrack } from "@/features/player/types/player.types";

const LOCAL_WRITE_MS = 5_000; // how often progress is saved on the device
const SYNC_PUSH_MS = 30_000; // how often progress is queued for the server while playing

let lastLocalWrite = 0;
let lastPush = 0;

function push(entry: HistoryEntry) {
  lastPush = Date.now();
  enqueue({
    kind: "history.put",
    lectureId: entry.lectureId,
    progressSecs: Math.floor(entry.positionSecs),
    completed: entry.completed,
    playedAt: entry.lastPlayedAt,
  });
}

export function recordStart(track: QueueTrack) {
  const existing = getHistoryEntry(track.lectureId);
  const entry: HistoryEntry = {
    lectureId: track.lectureId,
    title: track.title,
    scholarName: track.scholarName,
    artworkUrl: track.artworkUrl,
    durationSecs: track.durationSecs,
    positionSecs: existing?.positionSecs ?? 0,
    completed: false,
    lastPlayedAt: new Date().toISOString(),
  };
  useHistoryStore.getState().upsert(entry);
  lastLocalWrite = Date.now();
  push(entry);
}

/** Called on every player tick; throttled internally. `force` for pause/background/track change. */
export function recordProgress(
  lectureId: string,
  positionSecs: number,
  force = false,
) {
  const existing = getHistoryEntry(lectureId);
  if (!existing) return;
  const now = Date.now();
  if (!force && now - lastLocalWrite < LOCAL_WRITE_MS) return;
  lastLocalWrite = now;
  const entry: HistoryEntry = {
    ...existing,
    positionSecs,
    lastPlayedAt: new Date().toISOString(),
  };
  useHistoryStore.getState().upsert(entry);
  if (force || now - lastPush >= SYNC_PUSH_MS) push(entry);
}

export function recordCompleted(lectureId: string) {
  const existing = getHistoryEntry(lectureId);
  if (!existing) return;
  const entry: HistoryEntry = {
    ...existing,
    completed: true,
    lastPlayedAt: new Date().toISOString(),
  };
  useHistoryStore.getState().upsert(entry);
  push(entry);
}
