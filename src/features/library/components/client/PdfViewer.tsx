"use client";
// src/features/library/components/client/PdfViewer.tsx
//
// Two actions: "Read now" (opens an inline iframe viewer with a freshly
// presigned URL) and "Download" (same presigned URL, but with download
// intent recorded and the browser's native download flow triggered).
//
// The presigned URL is NEVER present in the initial page HTML — it's
// requested via Server Action only when the reader actually clicks.
// This keeps the R2 object key and any URL fully out of page source,
// search engine caches, and shared/copied links.

import { useState, useCallback } from "react";
import { Button } from "@shared/components/ui/button";
import { requestBookAccess } from "../../actions/library.actions";

interface PdfViewerProps {
  bookId: string;
  bookTitle: string;
  allowFreeDownload: boolean;
}

type ViewerState =
  | { status: "idle" }
  | { status: "loading"; intent: "read" | "download" }
  | { status: "viewing"; url: string; expiresAt: string }
  | { status: "error"; message: string };

export function PdfViewer({
  bookId,
  bookTitle,
  allowFreeDownload,
}: PdfViewerProps) {
  const [state, setState] = useState<ViewerState>({ status: "idle" });

  const requestAccess = useCallback(
    async (intent: "read" | "download") => {
      setState({ status: "loading", intent });

      const result = await requestBookAccess({ bookId, intent });

      if (!result.ok) {
        setState({ status: "error", message: result.error });
        return;
      }

      if (intent === "download") {
        // Trigger browser download directly, no inline viewer needed
        const link = document.createElement("a");
        link.href = result.url;
        link.download = `${bookTitle}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setState({ status: "idle" });
        return;
      }

      setState({
        status: "viewing",
        url: result.url,
        expiresAt: result.expiresAt,
      });
    },
    [bookId, bookTitle],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* ── Action buttons ───────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <Button
          size="lg"
          onClick={() => requestAccess("read")}
          disabled={state.status === "loading"}
        >
          <BookOpenIcon />
          Read now
        </Button>

        <Button
          size="lg"
          variant="secondary"
          onClick={() => requestAccess("download")}
          disabled={state.status === "loading"}
        >
          <DownloadIcon />
          Download PDF
        </Button>

        {!allowFreeDownload && (
          <span className="inline-flex items-center text-xs text-ink-muted self-center">
            <LockIcon />
            Sign-in required
          </span>
        )}
      </div>

      {/* ── Error state ──────────────────────────────────────────────── */}
      {state.status === "error" && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 flex items-center justify-between gap-3"
        >
          <span>{state.message}</span>
          <button
            type="button"
            onClick={() => setState({ status: "idle" })}
            className="text-red-600 hover:text-red-800 font-medium shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Inline viewer ────────────────────────────────────────────── */}
      {state.status === "viewing" && (
        <div
          className="rounded-2xl border border-border-default overflow-hidden bg-surface-subtle"
          role="region"
          aria-label={`PDF viewer: ${bookTitle}`}
        >
          {/* Viewer toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-surface-card border-b border-border-default">
            <span className="text-sm font-medium text-ink-secondary truncate">
              {bookTitle}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={state.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-700 hover:text-primary-800 font-medium px-2 py-1"
              >
                Open in new tab
              </a>
              <button
                type="button"
                onClick={() => setState({ status: "idle" })}
                aria-label="Close viewer"
                className="text-ink-muted hover:text-ink-primary p-1"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* PDF iframe — browser's native PDF renderer handles display */}
          <iframe
            src={`${state.url}#view=FitH`}
            title={`${bookTitle} — PDF viewer`}
            className="w-full bg-white"
            style={{ height: "70vh", minHeight: 480, border: "none" }}
            loading="lazy"
          />

          <p className="px-4 py-2 text-xs text-ink-muted bg-surface-card border-t border-border-default">
            This link expires after one hour for security. Re-open this page to
            generate a new link.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function BookOpenIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="mr-1"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
