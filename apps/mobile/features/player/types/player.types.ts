import type { LectureSummary } from "@/lib/api/types";

export interface QueueTrack {
  lectureId: string;
  title: string;
  scholarName: string | null;
  artworkUrl: string | null;
  sourceUrl: string | null;
  mimeType: string;
  durationSecs: number | null;
}

export type PlaybackSpeed = 0.75 | 1 | 1.25 | 1.5 | 2;
export const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.75, 1, 1.25, 1.5, 2];

export type SleepTimerOption = 15 | 30 | 45 | 60 | "end-of-lecture";

export type PlayerErrorKind = "not-ready" | "load-failed" | "network" | null;

export function toQueueTrack(
  lecture: LectureSummary,
  sourceUrl: string,
): QueueTrack {
  return {
    lectureId: lecture.id,
    title: lecture.title,
    scholarName: lecture.scholar?.name ?? null,
    artworkUrl: lecture.thumbnail ?? null,
    sourceUrl,
    mimeType: "audio/mpeg", // refined by caller when the real asset is available
    durationSecs: lecture.durationSecs,
  };
}
