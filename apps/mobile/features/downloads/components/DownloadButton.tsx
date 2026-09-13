import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useDownloadRecord,
  useDownloadProgress,
  useDownloads,
} from "../hooks/useDownloads";
import type { DownloadableLecture } from "../types/download.types";

interface Props {
  lecture: DownloadableLecture;
  sourceUrl?: string | null;
  getSourceUrl?: () => Promise<string | null>;
}

export function DownloadButton({
  lecture,
  sourceUrl = null,
  getSourceUrl,
}: Props) {
  const record = useDownloadRecord(lecture.id);
  const progress = useDownloadProgress(lecture.id);
  const { start, pause, resume, retry, remove } = useDownloads();

  if (!lecture.allowDownload) return null;

  const handleStart = async () => {
    const url = sourceUrl ?? (getSourceUrl ? await getSourceUrl() : null);
    if (url) start(lecture, url);
  };

  if (!record || record.status === "failed") {
    return (
      <Pressable
        onPress={() =>
          record?.status === "failed" ? retry(lecture.id) : handleStart()
        }
        accessibilityRole="button"
        accessibilityLabel={
          record?.status === "failed" ? "Retry download" : "Download lecture"
        }
        hitSlop={10}
      >
        <Ionicons
          name={record?.status === "failed" ? "refresh" : "download-outline"}
          size={20}
          color="#F8FAFC"
        />
      </Pressable>
    );
  }

  if (record.status === "downloading" || record.status === "queued") {
    return (
      <Pressable
        onPress={() => pause(lecture.id)}
        accessibilityRole="button"
        accessibilityLabel={`Pause download, ${Math.round(progress * 100)} percent complete`}
        hitSlop={10}
      >
        <Ionicons name="pause-circle-outline" size={22} color="#D4AF37" />
      </Pressable>
    );
  }

  if (record.status === "paused") {
    return (
      <Pressable
        onPress={() => resume(lecture.id)}
        accessibilityRole="button"
        accessibilityLabel="Resume download"
        hitSlop={10}
      >
        <Ionicons name="play-circle-outline" size={22} color="#D4AF37" />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => remove(lecture.id)}
      accessibilityRole="button"
      accessibilityLabel="Downloaded — tap to delete"
      hitSlop={10}
    >
      <Ionicons name="checkmark-circle" size={22} color="#065F46" />
    </Pressable>
  );
}
