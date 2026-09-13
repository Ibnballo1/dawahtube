import * as FileSystem from "expo-file-system/legacy";
import { useDownloadsStore, getDownloadRecord } from "../store/downloadsStore";
import { lecturesApi } from "@/lib/api/endpoints";
import type {
  DownloadRecord,
  DownloadableLecture,
} from "../types/download.types";

const DOWNLOAD_DIR = FileSystem.documentDirectory + "downloads/";
const activeTasks = new Map<string, FileSystem.DownloadResumable>();
const lastProgressWrite = new Map<string, number>();
const PROGRESS_THROTTLE_MS = 300;

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
  if (!info.exists)
    await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
}

function localPathFor(lectureId: string) {
  return `${DOWNLOAD_DIR}${lectureId}.audio`;
}

function progressCallback(lectureId: string) {
  return (progress: FileSystem.DownloadProgressData) => {
    const now = Date.now();
    if (now - (lastProgressWrite.get(lectureId) ?? 0) < PROGRESS_THROTTLE_MS)
      return;
    lastProgressWrite.set(lectureId, now);
    const pct =
      progress.totalBytesExpectedToWrite > 0
        ? progress.totalBytesWritten / progress.totalBytesExpectedToWrite
        : 0;
    useDownloadsStore.getState().setProgress(lectureId, pct);
  };
}

async function finish(record: DownloadRecord, uri: string) {
  const info = await FileSystem.getInfoAsync(uri);
  useDownloadsStore.getState().upsert({
    ...record,
    localPath: uri,
    fileSizeBytes: info.exists && "size" in info ? (info.size ?? 0) : 0,
    status: "completed",
    downloadedAt: new Date().toISOString(),
    resumeData: null,
  });
}

function failUnlessPaused(lectureId: string, record: DownloadRecord) {
  if (getDownloadRecord(lectureId)?.status !== "paused") {
    useDownloadsStore.getState().upsert({ ...record, status: "failed" });
  }
}

export async function startDownload(
  lecture: DownloadableLecture,
  sourceUrl: string,
) {
  if (!lecture.allowDownload)
    throw new Error("This lecture is not available for download.");
  await ensureDir();

  const record: DownloadRecord = {
    lectureId: lecture.id,
    title: lecture.title,
    scholarName: lecture.scholarName,
    artworkUrl: lecture.artworkUrl,
    durationSecs: lecture.durationSecs,
    localPath: null,
    fileSizeBytes: 0,
    status: "downloading",
    downloadedAt: null,
    resumeData: null,
    sourceUrl,
  };
  useDownloadsStore.getState().upsert(record);

  const task = FileSystem.createDownloadResumable(
    sourceUrl,
    localPathFor(lecture.id),
    {},
    progressCallback(lecture.id),
  );
  activeTasks.set(lecture.id, task);

  try {
    const result = await task.downloadAsync();
    if (!result) throw new Error("Download did not complete.");
    await finish(record, result.uri);
  } catch {
    failUnlessPaused(lecture.id, record);
  } finally {
    activeTasks.delete(lecture.id);
  }
}

export async function pauseDownload(lectureId: string) {
  const task = activeTasks.get(lectureId);
  const record = getDownloadRecord(lectureId);
  if (!task || !record) return;
  try {
    await task.pauseAsync();
    useDownloadsStore.getState().upsert({
      ...record,
      status: "paused",
      resumeData: JSON.stringify(task.savable()),
    });
  } catch {
    /* leave as-is */
  }
}

export async function resumeDownload(lectureId: string) {
  const record = getDownloadRecord(lectureId);
  if (!record) return;

  let task = activeTasks.get(lectureId);
  if (!task && record.resumeData) {
    const snapshot = JSON.parse(record.resumeData);
    task = new FileSystem.DownloadResumable(
      snapshot.url,
      snapshot.fileUri,
      snapshot.options,
      progressCallback(lectureId),
      snapshot.resumeData,
    );
    activeTasks.set(lectureId, task);
  }
  if (!task) return;

  useDownloadsStore.getState().upsert({ ...record, status: "downloading" });
  try {
    const result = await task.resumeAsync();
    if (!result) throw new Error("Resume did not complete.");
    await finish(record, result.uri);
  } catch {
    failUnlessPaused(lectureId, record);
  } finally {
    activeTasks.delete(lectureId);
  }
}

export async function cancelDownload(lectureId: string) {
  const task = activeTasks.get(lectureId);
  if (task) {
    try {
      await task.pauseAsync();
    } catch {
      /* best effort */
    }
    activeTasks.delete(lectureId);
  }
  await deleteDownload(lectureId);
}

export async function retryDownload(lectureId: string) {
  const record = getDownloadRecord(lectureId);
  if (!record) return;
  try {
    const fresh = await lecturesApi.streamUrl(lectureId);
    await startDownload(
      {
        id: record.lectureId,
        title: record.title,
        scholarName: record.scholarName,
        artworkUrl: record.artworkUrl,
        durationSecs: record.durationSecs,
        allowDownload: true,
      },
      fresh.url,
    );
  } catch {
    useDownloadsStore.getState().upsert({ ...record, status: "failed" });
  }
}

export async function deleteDownload(lectureId: string) {
  const record = getDownloadRecord(lectureId);
  if (record?.localPath) {
    try {
      await FileSystem.deleteAsync(record.localPath, { idempotent: true });
    } catch {
      /* already gone */
    }
  }
  useDownloadsStore.getState().remove(lectureId);
}
