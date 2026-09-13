export interface HistoryEntry {
  lectureId: string;
  title: string;
  scholarName: string | null;
  artworkUrl: string | null;
  durationSecs: number | null;
  positionSecs: number;
  completed: boolean;
  lastPlayedAt: string;
}
