import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";
import type { HistoryEntry } from "../types/history.types";

const storage = createMMKV({ id: "dawahtube-history" });
const KEY = "entries";

function load(): Record<string, HistoryEntry> {
  const raw = storage.getString(KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, HistoryEntry>;
  } catch {
    return {};
  }
}
function save(value: Record<string, HistoryEntry>) {
  storage.set(KEY, JSON.stringify(value));
}

interface HistoryState {
  entries: Record<string, HistoryEntry>;
  hydrate: () => void;
  upsert: (entry: HistoryEntry) => void;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  entries: {},
  hydrate: () => set({ entries: load() }),
  upsert: (entry) => {
    const entries = { ...get().entries, [entry.lectureId]: entry };
    save(entries);
    set({ entries });
  },
  clear: () => {
    save({});
    set({ entries: {} });
  },
}));

export function getHistoryEntry(lectureId: string): HistoryEntry | undefined {
  return useHistoryStore.getState().entries[lectureId];
}
