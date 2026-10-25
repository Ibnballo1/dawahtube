import { apiFetch } from "@/lib/api/client";
import type {
  ServerBookmark,
  ServerHistoryEntry,
  ServerTimestampBookmark,
  SyncResponse,
} from "../types/sync.types";

const enc = encodeURIComponent;

export const syncApi = {
  bookmarks: () => apiFetch<ServerBookmark[]>("/me/bookmarks"),
  history: () => apiFetch<ServerHistoryEntry[]>("/me/history"),
  timestampBookmarks: () =>
    apiFetch<ServerTimestampBookmark[]>("/me/timestamp-bookmarks"),

  // All of these are idempotent server-side, so retrying them is always safe.
  putBookmark: (lectureId: string, createdAt: string) =>
    apiFetch(`/me/bookmarks/${enc(lectureId)}`, {
      method: "PUT",
      body: { createdAt },
      retry: true,
    }),
  deleteBookmark: (lectureId: string) =>
    apiFetch(`/me/bookmarks/${enc(lectureId)}`, {
      method: "DELETE",
      retry: true,
    }),
  putHistory: (
    lectureId: string,
    body: { progressSecs: number; completed: boolean; playedAt: string },
  ) =>
    apiFetch(`/me/history/${enc(lectureId)}`, {
      method: "PUT",
      body,
      retry: true,
    }),
  clearHistory: () =>
    apiFetch("/me/history", { method: "DELETE", retry: true }),
  putTimestampBookmark: (
    id: string,
    body: {
      lectureId: string;
      timestampSecs: number;
      note: string | null;
      createdAt: string;
    },
  ) =>
    apiFetch(`/me/timestamp-bookmarks/${enc(id)}`, {
      method: "PUT",
      body,
      retry: true,
    }),
  deleteTimestampBookmark: (id: string) =>
    apiFetch(`/me/timestamp-bookmarks/${enc(id)}`, {
      method: "DELETE",
      retry: true,
    }),

  merge: (payload: {
    bookmarks: { lectureId: string; createdAt: string }[];
    history: {
      lectureId: string;
      progressSecs: number;
      completed: boolean;
      playedAt: string;
    }[];
    timestampBookmarks: {
      id: string;
      lectureId: string;
      timestampSecs: number;
      note: string | null;
      createdAt: string;
    }[];
  }) =>
    apiFetch<SyncResponse>("/me/sync", {
      method: "POST",
      body: payload,
      retry: true,
      timeoutMs: 30_000,
    }),
};
