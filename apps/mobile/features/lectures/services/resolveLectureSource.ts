import type { LectureDetail } from "@/lib/api/types";
import { lecturesApi } from "@/lib/api/endpoints";
import { getDownloadRecord } from "@/features/downloads/store/downloadsStore";

export type SourceResolution =
  | { kind: "local"; url: string }
  | { kind: "remote"; url: string }
  | { kind: "unavailable"; reason: "no-audio" | "offline" | "failed" };

export async function resolveLectureSource(
  lecture: LectureDetail,
  isConnected: boolean,
): Promise<SourceResolution> {
  const downloaded = getDownloadRecord(lecture.id);
  if (downloaded?.status === "completed" && downloaded.localPath) {
    return { kind: "local", url: downloaded.localPath };
  }
  if (!lecture.hasAudio) return { kind: "unavailable", reason: "no-audio" };
  if (!isConnected) return { kind: "unavailable", reason: "offline" };

  try {
    const stream = await lecturesApi.streamUrl(lecture.id);
    return { kind: "remote", url: stream.url };
  } catch {
    return { kind: "unavailable", reason: "failed" };
  }
}
