import type { SeriesEpisode } from "@/lib/api/types";
import type { LectureCardData } from "@/components/ui/LectureCard";
import type { QueueTrack } from "@/features/player/types/player.types";
import { lecturesApi } from "@/lib/api/endpoints";
import { resolveLectureSource } from "@/features/lectures/services/resolveLectureSource";
import { resolveImageUrl } from "@/lib/assets/resolveImageUrl";
import { DEFAULT_IMAGES } from "@/lib/assets/defaultImages";

export function episodeToCardData(
  episode: SeriesEpisode,
  scholarName: string | null,
): LectureCardData {
  return {
    id: episode.id,
    title: episode.title,
    scholarName,
    thumbnailUrl: resolveImageUrl(episode.thumbnail, DEFAULT_IMAGES.lecture),
    durationSecs: episode.durationSecs,
    allowDownload: false, // not returned by /series/:slug yet — see flagged gap
  };
}

export function episodeToLazyQueueTrack(
  episode: SeriesEpisode,
  scholarName: string | null,
  isConnected: boolean,
): QueueTrack {
  return {
    lectureId: episode.id,
    title: episode.title,
    scholarName,
    artworkUrl: resolveImageUrl(episode.thumbnail, DEFAULT_IMAGES.lecture),
    mimeType: "audio/mpeg",
    durationSecs: episode.durationSecs,
    sourceUrl: null,
    resolveSource: async () => {
      const detail = await lecturesApi.byId(episode.id);
      const resolution = await resolveLectureSource(detail, isConnected);
      return resolution.kind === "unavailable" ? null : resolution.url;
    },
  };
}
