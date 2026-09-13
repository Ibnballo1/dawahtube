import type { LectureSummary, LectureDetail } from "@/lib/api/types";
import type { LectureCardData } from "@/components/ui/LectureCard";
import type { QueueTrack } from "@/features/player/types/player.types";
import type { DownloadableLecture } from "@/features/downloads/types/download.types";
import { lecturesApi } from "@/lib/api/endpoints";
import { resolveLectureSource } from "../services/resolveLectureSource";

export function toCardData(lecture: LectureSummary): LectureCardData {
  return {
    id: lecture.id,
    title: lecture.title,
    scholarName: lecture.scholar?.displayName ?? null,
    thumbnailUrl: lecture.thumbnail,
    durationSecs: lecture.durationSecs,
    allowDownload: lecture.allowDownload,
  };
}

export function toQueueTrack(
  lecture: LectureDetail,
  sourceUrl: string,
): QueueTrack {
  return {
    lectureId: lecture.id,
    title: lecture.title,
    scholarName: lecture.scholar?.displayName ?? null,
    artworkUrl: lecture.thumbnail,
    mimeType: "audio/mpeg",
    durationSecs: lecture.durationSecs,
    sourceUrl,
  };
}

export function toDownloadable(lecture: LectureDetail): DownloadableLecture {
  return {
    id: lecture.id,
    title: lecture.title,
    scholarName: lecture.scholar?.displayName ?? null,
    artworkUrl: lecture.thumbnail,
    durationSecs: lecture.durationSecs,
    allowDownload: lecture.allowDownload,
  };
}

export function toLazyQueueTrack(
  lecture: LectureSummary,
  isConnected: boolean,
): QueueTrack & { resolveSource: () => Promise<string | null> } {
  return {
    lectureId: lecture.id,
    title: lecture.title,
    scholarName: lecture.scholar?.displayName ?? null,
    artworkUrl: lecture.thumbnail,
    mimeType: "audio/mpeg",
    durationSecs: lecture.durationSecs,
    sourceUrl: null,
    resolveSource: async () => {
      const detail = await lecturesApi.byId(lecture.id);
      const resolution = await resolveLectureSource(detail, isConnected);
      return resolution.kind === "unavailable" ? null : resolution.url;
    },
  };
}
