export interface TranscriptLine {
  timestampSeconds: number;
  text: string | undefined;
}

export type TranscriptResult =
  | { kind: "timestamped"; lines: TranscriptLine[] }
  | { kind: "plain"; text: string };
