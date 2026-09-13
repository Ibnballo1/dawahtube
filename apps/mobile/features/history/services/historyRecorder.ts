import { useHistoryStore, getHistoryEntry } from "../store/historyStore";
import type { QueueTrack } from "@/features/player/types/player.types";

export function recordStart(track: QueueTrack) {
  const existing = getHistoryEntry(track.lectureId);
  useHistoryStore.getState().upsert({
    lectureId: track.lectureId,
    title: track.title,
    scholarName: track.scholarName,
    artworkUrl: track.artworkUrl,
    durationSecs: track.durationSecs,
    positionSecs: existing?.positionSecs ?? 0,
    completed: false,
    lastPlayedAt: new Date().toISOString(),
  });
}

export function recordProgress(lectureId: string, positionSecs: number) {
  const existing = getHistoryEntry(lectureId);
  if (!existing) return;
  useHistoryStore
    .getState()
    .upsert({
      ...existing,
      positionSecs,
      lastPlayedAt: new Date().toISOString(),
    });
}

export function recordCompleted(lectureId: string) {
  const existing = getHistoryEntry(lectureId);
  if (!existing) return;
  useHistoryStore.getState().upsert({ ...existing, completed: true });
}
