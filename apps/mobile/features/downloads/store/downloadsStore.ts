import { create } from "zustand";
import { loadRegistry, saveRegistry } from "@/lib/storage/downloadsRegistry";
import type { DownloadRecord } from "../types/download.types";

interface DownloadsState {
  records: Record<string, DownloadRecord>;
  progress: Record<string, number>;
  hydrate: () => void;
  upsert: (record: DownloadRecord) => void;
  remove: (lectureId: string) => void;
  setProgress: (lectureId: string, value: number) => void;
}

export const useDownloadsStore = create<DownloadsState>((set, get) => ({
  records: {},
  progress: {},
  hydrate: () => set({ records: loadRegistry() }),
  upsert: (record) => {
    const records = { ...get().records, [record.lectureId]: record };
    saveRegistry(records);
    set({ records });
  },
  remove: (lectureId) => {
    const records = { ...get().records };
    delete records[lectureId];
    saveRegistry(records);
    const progress = { ...get().progress };
    delete progress[lectureId];
    set({ records, progress });
  },
  setProgress: (lectureId, value) =>
    set((state) => ({ progress: { ...state.progress, [lectureId]: value } })),
}));

export function getDownloadRecord(
  lectureId: string,
): DownloadRecord | undefined {
  return useDownloadsStore.getState().records[lectureId];
}

export function totalStorageUsage(): number {
  return Object.values(useDownloadsStore.getState().records)
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.fileSizeBytes, 0);
}
