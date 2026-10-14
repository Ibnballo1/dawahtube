import type { SearchLectureHit } from "@/lib/api/types";
import type { LectureCardData } from "@/components/ui/LectureCard";
import { resolveImageUrl } from "@/lib/assets/resolveImageUrl";
import { DEFAULT_IMAGES } from "@/lib/assets/defaultImages";

export function toCardData(hit: SearchLectureHit): LectureCardData {
  return {
    id: hit.id,
    title: hit.title,
    scholarName: hit.scholar?.displayName ?? null,
    thumbnailUrl: resolveImageUrl(hit.thumbnail, DEFAULT_IMAGES.lecture),
    durationSecs: hit.durationSecs,
    allowDownload: false, // search doesn't return this; unknown until opening the lecture
  };
}
