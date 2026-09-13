import type { SearchLectureResult } from "@/lib/api/types";
import type { LectureCardData } from "@/components/ui/LectureCard";

export function toCardData(result: SearchLectureResult): LectureCardData {
  return {
    id: result.id,
    title: result.title,
    scholarName: result.scholarName,
    thumbnailUrl: result.thumbnailUrl,
    durationSecs: result.durationSecs,
    allowDownload: result.allowDownload,
  };
}
