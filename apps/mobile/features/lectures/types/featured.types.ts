import type {
  FeaturedLecture,
  FeaturedScholar,
  FeaturedReminder,
} from "@/lib/api/types";
import type { LectureCardData } from "@/components/ui/LectureCard";
import { resolveImageUrl } from "@/lib/assets/resolveImageUrl";
import { DEFAULT_IMAGES } from "@/lib/assets/defaultImages";

export function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function featuredLectureToCardData(
  lecture: FeaturedLecture,
): LectureCardData {
  return {
    id: lecture.id,
    title: lecture.title,
    scholarName: lecture.scholar?.displayName ?? null,
    thumbnailUrl: resolveImageUrl(lecture.thumbnail, DEFAULT_IMAGES.lecture),
    durationSecs: lecture.durationSecs,
    allowDownload: false, // not returned by /featured — see flagged gap
  };
}

export interface FeaturedScholarCardData {
  id: string;
  slug: string;
  displayName: string;
  avatarUrl: string;
}
export function featuredScholarToCardData(
  scholar: FeaturedScholar,
): FeaturedScholarCardData {
  return {
    id: scholar.id,
    slug: scholar.slug,
    displayName: scholar.displayName,
    avatarUrl: resolveImageUrl(scholar.avatar, DEFAULT_IMAGES.scholar),
  };
}
