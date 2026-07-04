// src/shared/lib/format.ts
// Pure formatting utilities — no side effects, fully testable.

// ─────────────────────────────────────────────────────────────────────────────
// DATE FORMATTING
// ─────────────────────────────────────────────────────────────────────────────

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const monthYearFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
});

export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  return dateFormatter.format(new Date(date));
}

export function formatDateShort(date: Date | string | null): string {
  if (!date) return "";
  return shortDateFormatter.format(new Date(date));
}

export function formatMonthYear(date: Date | string | null): string {
  if (!date) return "";
  return monthYearFormatter.format(new Date(date));
}

export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const secs = Math.floor(diff / 1000);
  const mins = Math.floor(secs / 60);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  const wks = Math.floor(days / 7);
  const mos = Math.floor(days / 30);
  const yrs = Math.floor(days / 365);

  if (secs < 60) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  if (wks < 5) return `${wks}w ago`;
  if (mos < 12) return `${mos} month${mos > 1 ? "s" : ""} ago`;
  return `${yrs} year${yrs > 1 ? "s" : ""} ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DURATION FORMATTING
// Converts seconds to human-readable time
// ─────────────────────────────────────────────────────────────────────────────

export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatDurationLong(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  if (h > 0 && m > 0) return `${h} hr ${m} min`;
  if (h > 0) return `${h} hr`;
  if (m > 0) return `${m} min`;
  return `${seconds} sec`;
}

// ─────────────────────────────────────────────────────────────────────────────
// NUMBER FORMATTING
// ─────────────────────────────────────────────────────────────────────────────

export function formatCount(n: number | string): string {
  const num = typeof n === "string" ? parseInt(n, 10) : n;
  if (isNaN(num)) return "0";

  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

export function formatPageCount(pages: number | null): string {
  if (!pages) return "";
  return `${pages} page${pages === 1 ? "" : "s"}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// READING TIME
// ─────────────────────────────────────────────────────────────────────────────

export function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRUNCATION
// ─────────────────────────────────────────────────────────────────────────────

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1).trimEnd() + "…";
}

export function truncateWords(str: string, maxWords: number): string {
  const words = str.trim().split(/\s+/);
  if (words.length <= maxWords) return str;
  return words.slice(0, maxWords).join(" ") + "…";
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE SIZE
// ─────────────────────────────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHOLAR NAME
// ─────────────────────────────────────────────────────────────────────────────

export function formatScholarName(
  honorifics: string | null,
  name: string,
): string {
  if (!honorifics) return name;
  return `${honorifics} ${name}`;
}
