export type DownloadStatus =
  "queued" | "downloading" | "paused" | "completed" | "failed";

export interface DownloadRecord {
  lectureId: string;
  title: string;
  scholarName: string | null;
  artworkUrl: string | null;
  durationSecs: number | null;
  localPath: string | null;
  fileSizeBytes: number;
  status: DownloadStatus;
  downloadedAt: string | null;
  resumeData: string | null;
  sourceUrl: string;
}

export interface DownloadableLecture {
  id: string;
  title: string;
  scholarName: string | null;
  artworkUrl: string | null;
  durationSecs: number | null;
  allowDownload: boolean;
}
