import { useDownloadsStore, totalStorageUsage } from "../store/downloadsStore";
import * as downloadManager from "../services/downloadManager";

export function useDownloads() {
  const records = useDownloadsStore((s) => s.records);
  const progress = useDownloadsStore((s) => s.progress);
  return {
    records: Object.values(records),
    progress,
    totalStorageBytes: totalStorageUsage(),
    start: downloadManager.startDownload,
    pause: downloadManager.pauseDownload,
    resume: downloadManager.resumeDownload,
    cancel: downloadManager.cancelDownload,
    retry: downloadManager.retryDownload,
    remove: downloadManager.deleteDownload,
  };
}

export function useDownloadRecord(lectureId: string) {
  return useDownloadsStore((s) => s.records[lectureId]);
}
export function useDownloadProgress(lectureId: string) {
  return useDownloadsStore((s) => s.progress[lectureId] ?? 0);
}
