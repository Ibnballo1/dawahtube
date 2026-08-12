"use client";
// src/features/admin/components/client/forms/FileUpload.tsx
//
// Upload flow:
//   1. User selects / drops a file
//   2. Component calls requestUploadUrl() Server Action → gets presigned PUT URL
//   3. Component PUTs file directly to R2 (XHR for progress tracking)
//   4. Component calls confirmUpload() Server Action → creates media_assets row
//   5. onComplete(assetId) fires → parent form stores the asset ID
//
// No file ever passes through the Next.js server — only presigned URLs do.

import { useState, useRef, useCallback } from "react";
import { requestUploadUrl } from "@features/admin/actions/upload.actions";
import { confirmUpload } from "@core/storage/confirm-upload";
import { cn } from "@shared/lib/utils";
import type { RequestUploadInput } from "@features/admin/actions/upload.actions";

type UploadType = RequestUploadInput["uploadType"];

interface FileUploadProps {
  uploadType: UploadType;
  accept: string; // e.g. "audio/*" or ".pdf" or "image/*"
  label: string; // e.g. "Lecture audio" or "Book PDF"
  hint?: string; // e.g. "MP3 or M4A, max 500 MB"
  maxMB?: number; // default 500
  currentUrl?: string | null; // existing asset public URL (edit mode)
  currentName?: string | null; // existing asset filename (edit mode)
  onComplete: (assetId: string, publicUrl: string | null) => void;
  onClear?: () => void; // called when user removes the current file
}

type UploadState =
  | { status: "idle" }
  | { status: "validating" }
  | { status: "uploading"; progress: number }
  | { status: "confirming" }
  | { status: "done"; filename: string; publicUrl: string | null }
  | { status: "error"; message: string };

const MIME_MAP: Record<UploadType, string[]> = {
  audio: [
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
  ],
  pdf: ["application/pdf"],
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  thumbnail: ["image/jpeg", "image/png", "image/webp"],
  avatar: ["image/jpeg", "image/png", "image/webp"],
  banner: ["image/jpeg", "image/png", "image/webp"],
  cover: ["image/jpeg", "image/png", "image/webp"],
};

export function FileUpload({
  uploadType,
  accept,
  label,
  hint,
  maxMB = 500,
  currentUrl,
  currentName,
  onComplete,
  onClear,
}: FileUploadProps) {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // ── Client-side validation ─────────────────────────────────────────────
      setState({ status: "validating" });

      const maxBytes = maxMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setState({
          status: "error",
          message: `File is too large. Maximum size is ${maxMB} MB.`,
        });
        return;
      }

      const allowed = MIME_MAP[uploadType] ?? [];
      if (!allowed.includes(file.type)) {
        setState({
          status: "error",
          message: `File type "${file.type}" is not supported. Please upload: ${accept}`,
        });
        return;
      }

      // ── Step 1: Get presigned PUT URL ──────────────────────────────────────
      const urlResult = await requestUploadUrl({
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        uploadType,
      });

      if (!urlResult.ok) {
        setState({ status: "error", message: urlResult.error });
        return;
      }

      // ── Step 2: Upload directly to R2 via XHR (for progress tracking) ─────
      setState({ status: "uploading", progress: 0 });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setState({
              status: "uploading",
              progress: Math.round((e.loaded / e.total) * 100),
            });
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`R2 upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));

        xhr.open("PUT", urlResult.uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      }).catch((err: Error) => {
        setState({ status: "error", message: err.message });
        throw err;
      });

      // ── Step 3: Confirm upload → create media_assets row ──────────────────
      setState({ status: "confirming" });

      // Estimate duration for audio files via the Web Audio API
      let durationSecs: number | undefined;
      if (uploadType === "audio") {
        durationSecs = await getAudioDuration(file).catch(() => undefined);
      }

      const confirmResult = await confirmUpload({
        key: urlResult.key,
        bucket: urlResult.bucket as "media" | "uploads" | "books",
        mimeType: file.type,
        sizeBytes: file.size,
        filename: file.name,
        durationSecs,
      });

      if (!confirmResult.ok) {
        setState({ status: "error", message: confirmResult.error });
        return;
      }

      // ── Done ──────────────────────────────────────────────────────────────
      setState({
        status: "done",
        filename: file.name,
        publicUrl: confirmResult.publicUrl,
      });
      onComplete(confirmResult.assetId, confirmResult.publicUrl);
    },
    [uploadType, maxMB, accept, onComplete],
  );

  // ── Drag-and-drop handlers ────────────────────────────────────────────────
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  // Show existing file in edit mode
  const hasExisting = (currentUrl || currentName) && state.status === "idle";

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink-secondary">{label}</span>

      {/* Existing file indicator */}
      {hasExisting && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-subtle border border-border-default text-sm">
          <FileIcon type={uploadType} />
          <span className="flex-1 text-ink-secondary truncate">
            {currentName ?? "Current file"}
          </span>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-ink-muted hover:text-red-600 transition-colors shrink-0"
            >
              Remove
            </button>
          )}
        </div>
      )}

      {/* Drop zone — shown when idle or after error */}
      {(state.status === "idle" ||
        state.status === "validating" ||
        state.status === "error") && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3",
            "border-2 border-dashed rounded-xl p-8 cursor-pointer",
            "transition-colors duration-fast",
            dragging
              ? "border-primary-500 bg-primary-50"
              : "border-border-emphasis hover:border-primary-400 hover:bg-surface-subtle",
            state.status === "validating" && "pointer-events-none opacity-60",
          )}
          role="button"
          aria-label={`Upload ${label}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="sr-only"
            aria-hidden="true"
          />

          <UploadIcon />

          <div className="text-center">
            <p className="text-sm font-medium text-ink-secondary">
              Drop {label.toLowerCase()} here, or{" "}
              <span className="text-primary-700">click to browse</span>
            </p>
            {hint && <p className="text-xs text-ink-muted mt-1">{hint}</p>}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {state.status === "uploading" && (
        <div className="flex flex-col gap-2 px-4 py-4 rounded-xl bg-primary-50 border border-primary-200">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-primary-800">Uploading…</span>
            <span className="text-primary-600 font-mono">
              {state.progress}%
            </span>
          </div>
          <div className="h-2 bg-primary-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-700 rounded-full transition-all duration-150"
              style={{ width: `${state.progress}%` }}
              role="progressbar"
              aria-valuenow={state.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {/* Confirming */}
      {state.status === "confirming" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-subtle border border-border-default text-sm text-ink-secondary">
          <svg
            className="animate-spin shrink-0"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeOpacity="0.25"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          Registering upload…
        </div>
      )}

      {/* Success */}
      {state.status === "done" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            className="shrink-0"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="flex-1 text-green-800 truncate">
            {state.filename} uploaded
          </span>
          <button
            type="button"
            onClick={() => setState({ status: "idle" })}
            className="text-xs text-green-700 hover:text-green-900 font-medium shrink-0"
          >
            Replace
          </button>
        </div>
      )}

      {/* Error */}
      {state.status === "error" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#dc2626"
            strokeWidth="2"
            className="shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="flex-1 text-red-800">{state.message}</span>
          <button
            type="button"
            onClick={() => setState({ status: "idle" })}
            className="text-xs text-red-700 hover:text-red-900 font-medium shrink-0"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(audio.duration));
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read audio duration"));
    };
    audio.src = url;
  });
}

function FileIcon({ type }: { type: UploadType }) {
  if (type === "audio") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-ink-muted"
        aria-hidden="true"
      >
        <path d="M9 18V5l12-2v13M9 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-2c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" />
      </svg>
    );
  }
  if (type === "pdf") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-ink-muted"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="11" y2="17" />
      </svg>
    );
  }
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-ink-muted"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-ink-muted"
      aria-hidden="true"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}
