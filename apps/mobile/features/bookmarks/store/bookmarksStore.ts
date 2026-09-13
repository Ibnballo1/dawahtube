import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";
import type {
  LectureBookmark,
  TimestampBookmark,
} from "../types/bookmark.types";

const storage = createMMKV({ id: "dawahtube-bookmarks" });
const LECTURE_KEY = "lectureBookmarks";
const TIMESTAMP_KEY = "timestampBookmarks";

function load<T>(key: string): Record<string, T> {
  const raw = storage.getString(key);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, T>;
  } catch {
    return {};
  }
}
function save<T>(key: string, value: Record<string, T>) {
  storage.set(key, JSON.stringify(value));
}

interface BookmarksState {
  lectureBookmarks: Record<string, LectureBookmark>;
  timestampBookmarks: Record<string, TimestampBookmark>;
  hydrate: () => void;
  toggleLectureBookmark: (bookmark: LectureBookmark) => void;
  addTimestampBookmark: (bookmark: TimestampBookmark) => void;
  removeTimestampBookmark: (id: string) => void;
}

export const useBookmarksStore = create<BookmarksState>((set, get) => ({
  lectureBookmarks: {},
  timestampBookmarks: {},
  hydrate: () =>
    set({
      lectureBookmarks: load(LECTURE_KEY),
      timestampBookmarks: load(TIMESTAMP_KEY),
    }),
  toggleLectureBookmark: (bookmark) => {
    const current = { ...get().lectureBookmarks };
    if (current[bookmark.lectureId]) {
      delete current[bookmark.lectureId];
    } else {
      current[bookmark.lectureId] = bookmark;
    }
    save(LECTURE_KEY, current);
    set({ lectureBookmarks: current });
  },
  addTimestampBookmark: (bookmark) => {
    const current = { ...get().timestampBookmarks, [bookmark.id]: bookmark };
    save(TIMESTAMP_KEY, current);
    set({ timestampBookmarks: current });
  },
  removeTimestampBookmark: (id) => {
    const current = { ...get().timestampBookmarks };
    delete current[id];
    save(TIMESTAMP_KEY, current);
    set({ timestampBookmarks: current });
  },
}));

export function isLectureBookmarked(lectureId: string): boolean {
  return Boolean(useBookmarksStore.getState().lectureBookmarks[lectureId]);
}

export function timestampBookmarksFor(lectureId: string): TimestampBookmark[] {
  return Object.values(useBookmarksStore.getState().timestampBookmarks)
    .filter((b) => b.lectureId === lectureId)
    .sort((a, b) => a.timestampSecs - b.timestampSecs);
}
