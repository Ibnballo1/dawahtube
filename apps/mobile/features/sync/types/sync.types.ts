export type OutboxOp =
  | { kind: "bookmark.put"; lectureId: string; createdAt: string }
  | { kind: "bookmark.delete"; lectureId: string }
  | {
      kind: "history.put";
      lectureId: string;
      progressSecs: number;
      completed: boolean;
      playedAt: string;
    }
  | { kind: "history.clear" }
  | {
      kind: "tbookmark.put";
      id: string;
      lectureId: string;
      timestampSecs: number;
      note: string | null;
      createdAt: string;
    }
  | { kind: "tbookmark.delete"; id: string };

/** Ops with the same key supersede each other; only the latest needs sending. */
export function opKey(op: OutboxOp): string {
  switch (op.kind) {
    case "bookmark.put":
    case "bookmark.delete":
      return `bookmark:${op.lectureId}`;
    case "history.put":
      return `history:${op.lectureId}`;
    case "history.clear":
      return "history:*";
    case "tbookmark.put":
    case "tbookmark.delete":
      return `tbookmark:${op.id}`;
  }
}

export interface ServerLectureCard {
  id: string;
  slug: string;
  title: string;
  durationSecs: number | null;
  allowDownload: boolean;
  thumbnail: string | null;
  scholar: { id: string; slug: string; displayName: string } | null;
}
export interface ServerBookmark {
  lectureId: string;
  createdAt: string;
  lecture: ServerLectureCard;
}
export interface ServerHistoryEntry {
  lectureId: string;
  playedAt: string;
  progressSecs: number;
  completed: boolean;
  lecture: ServerLectureCard;
}
export interface ServerTimestampBookmark {
  id: string;
  lectureId: string;
  lectureTitle: string;
  timestampSecs: number;
  note: string | null;
  createdAt: string;
}
export interface SyncResponse {
  bookmarks: ServerBookmark[];
  history: ServerHistoryEntry[];
  timestampBookmarks: ServerTimestampBookmark[];
  skipped: { bookmarks: number; history: number; timestampBookmarks: number };
}
