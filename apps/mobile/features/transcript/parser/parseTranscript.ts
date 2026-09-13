import type {
  TranscriptResult,
  TranscriptLine,
} from "../types/transcript.types";

// Matches "[MM:SS]" or "[HH:MM:SS]" at the start of a line.
const TIMESTAMP_LINE_RE = /^\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]\s*(.*)$/;

export function parseTranscript(
  raw: string | null | undefined,
): TranscriptResult | null {
  if (!raw || !raw.trim()) return null;

  const rawLines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const parsed: TranscriptLine[] = [];

  for (const line of rawLines) {
    const match = TIMESTAMP_LINE_RE.exec(line);
    if (!match) continue;
    const [, h, m, s, text] = match;
    const seconds =
      s !== undefined
        ? parseInt(h!, 10) * 3600 + parseInt(m!, 10) * 60 + parseInt(s!, 10)
        : parseInt(h!, 10) * 60 + parseInt(m!, 10);
    parsed.push({ timestampSeconds: seconds, text: text?.trim() });
  }

  // Only trust this as "timestamped" if most lines actually matched —
  // a stray "[10:32]" inside plain prose shouldn't misclassify everything.
  if (parsed.length > 0 && parsed.length >= rawLines.length * 0.6) {
    return { kind: "timestamped", lines: parsed };
  }
  return { kind: "plain", text: raw };
}
