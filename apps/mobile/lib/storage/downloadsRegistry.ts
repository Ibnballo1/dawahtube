import { createMMKV } from "react-native-mmkv";
import type { DownloadRecord } from "@/features/downloads/types/download.types";

export const downloadsStorage = createMMKV({ id: "dawahtube-downloads" });
const REGISTRY_KEY = "registry";

export function loadRegistry(): Record<string, DownloadRecord> {
  const raw = downloadsStorage.getString(REGISTRY_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, DownloadRecord>;
  } catch {
    return {};
  }
}

export function saveRegistry(registry: Record<string, DownloadRecord>) {
  downloadsStorage.set(REGISTRY_KEY, JSON.stringify(registry));
}
