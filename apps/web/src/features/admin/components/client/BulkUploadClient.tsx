"use client";
// src/app/(admin)/admin/bulk-upload/page.tsx
//
// Bulk lecture upload flow:
//   1. Admin drops up to 30 MP3/audio files
//   2. All files upload to R2 in parallel — progress per file
//   3. A table appears with one editable row per file
//   4. Admin sets scholar + category once at the top (applied to all)
//   5. Individual titles are pre-filled from filenames (editable)
//   6. Click "Create X lectures" — all created as drafts in one go

import { useState, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@shared/lib/utils";
import { formatDurationLong, formatFileSize } from "@shared/lib/format";
import { requestUploadUrl } from "@features/admin/actions/upload.actions";
import { confirmUpload } from "@core/storage/confirm-upload";
import { createLecture } from "@features/admin/actions/content.actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadedFile {
  localId: string;
  filename: string;
  sizeBytes: number;
  durationSecs: number | null;
  assetId: string | null;
  status: "uploading" | "done" | "error";
  progress: number;
  error?: string;
  // Editable metadata
  title: string;
  scholarId: string;
  categoryId: string;
  language: string;
}

interface BulkUploadPageProps {
  scholars: Array<{ id: string; name: string; honorifics: string | null }>;
  categories: Array<{ id: string; name: string }>;
}

const inputCls = [
  "w-full rounded-lg px-3 py-2 text-sm",
  "border border-border-emphasis bg-surface-card text-ink-primary",
  "placeholder:text-ink-muted",
  "focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/15",
  "transition-colors",
].join(" ");

export default function BulkUploadPage({
  scholars,
  categories,
}: BulkUploadPageProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [globalScholar, setGlobalScholar] = useState("");
  const [globalCategory, setGlobalCategory] = useState("");
  const [globalLanguage, setGlobalLanguage] = useState("en");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(0);
  const [errors, setErrors] = useState(0);

  // ── Upload a single file ────────────────────────────────────────────────────

  const uploadFile = useCallback(async (file: File, localId: string) => {
    // Update progress helper
    const update = (patch: Partial<UploadedFile>) =>
      setFiles((prev) =>
        prev.map((f) => (f.localId === localId ? { ...f, ...patch } : f)),
      );

    try {
      // 1. Get presigned URL
      const urlResult = await requestUploadUrl({
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        uploadType: "audio",
      });

      if (!urlResult.ok) {
        update({ status: "error", error: urlResult.error });
        return;
      }

      // 2. Upload to R2 with progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            update({ progress: Math.round((e.loaded / e.total) * 100) });
          }
        };
        xhr.onload = () =>
          xhr.status < 300
            ? resolve()
            : reject(new Error(`R2 error ${xhr.status}`));
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.open("PUT", urlResult.uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      // 3. Detect audio duration
      let durationSecs: number | null = null;
      try {
        durationSecs = await new Promise((res, rej) => {
          const url = URL.createObjectURL(file);
          const audio = new Audio();
          audio.onloadedmetadata = () => {
            URL.revokeObjectURL(url);
            res(Math.round(audio.duration));
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            rej();
          };
          audio.src = url;
        });
      } catch {
        /* duration optional */
      }

      // 4. Confirm upload → create media_assets row
      const confirmResult = await confirmUpload({
        key: urlResult.key,
        bucket: urlResult.bucket as "media" | "uploads" | "books",
        mimeType: file.type,
        sizeBytes: file.size,
        filename: file.name,
        durationSecs: durationSecs ?? undefined,
      });

      if (!confirmResult.ok) {
        update({ status: "error", error: confirmResult.error });
        return;
      }

      update({
        status: "done",
        progress: 100,
        assetId: confirmResult.assetId,
        durationSecs,
      });
    } catch (err) {
      update({
        status: "error",
        error: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }, []);

  // ── Handle dropped / selected files ─────────────────────────────────────────

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const audioFiles = Array.from(fileList).filter(
        (f) =>
          f.type.startsWith("audio/") ||
          f.name.endsWith(".mp3") ||
          f.name.endsWith(".m4a"),
      );

      if (audioFiles.length === 0) return;

      const newEntries: UploadedFile[] = audioFiles.map((file) => {
        const localId = `local_${Math.random().toString(36).slice(2)}`;
        const title = file.name
          .replace(/\.[^.]+$/, "") // remove extension
          .replace(/[-_]+/g, " ") // dashes/underscores → spaces
          .replace(/\b\w/g, (c) => c.toUpperCase()); // title case

        return {
          localId,
          filename: file.name,
          sizeBytes: file.size,
          durationSecs: null,
          assetId: null,
          status: "uploading",
          progress: 0,
          title,
          scholarId: globalScholar,
          categoryId: globalCategory,
          language: globalLanguage,
        };
      });

      setFiles((prev) => [...prev, ...newEntries]);

      // Start uploading all in parallel
      audioFiles.forEach((file, i) => {
        uploadFile(file, newEntries[i]!.localId);
      });
    },
    [globalScholar, globalCategory, globalLanguage, uploadFile],
  );

  // ── Apply global settings to all rows ───────────────────────────────────────

  function applyGlobal(
    field: "scholarId" | "categoryId" | "language",
    value: string,
  ) {
    setFiles((prev) => prev.map((f) => ({ ...f, [field]: value })));
  }

  // ── Create all lectures ──────────────────────────────────────────────────────

  async function handleCreateAll() {
    const ready = files.filter(
      (f) => f.status === "done" && f.assetId && f.title.trim(),
    );
    if (ready.length === 0) return;

    setCreating(true);
    let ok = 0,
      fail = 0;

    for (const file of ready) {
      const result = await createLecture({
        title: file.title.trim(),
        scholarId: file.scholarId,
        categoryId: file.categoryId || undefined,
        defaultLanguage: file.language || "en",
        audioAssetId: file.assetId!,
        durationSecs: file.durationSecs ?? undefined,
        tagIds: [],
        status: "draft",
        allowDownload: true,
      });

      if (result.ok) ok++;
      else fail++;
    }

    setCreated(ok);
    setErrors(fail);
    setCreating(false);

    if (ok > 0) {
      setTimeout(() => router.push("/admin/lectures"), 1500);
    }
  }

  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const doneCount = files.filter((f) => f.status === "done").length;
  const readyToCreate = files.filter(
    (f) => f.status === "done" && f.assetId && f.title.trim(),
  ).length;
  const allDone = files.length > 0 && uploadingCount === 0;

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-primary">
          Bulk Upload
        </h1>
        <p className="text-ink-muted text-sm mt-1">
          Upload up to 30 audio files at once. Set titles and metadata, then
          create all as drafts.
        </p>
      </div>

      {/* Success state */}
      {created > 0 && (
        <div className="rounded-2xl bg-green-50 border border-green-200 px-6 py-4 flex items-center gap-3">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p className="text-sm text-green-800 font-medium">
            {created} lecture{created !== 1 ? "s" : ""} created as drafts.
            {errors > 0 && ` ${errors} failed.`} Redirecting to lectures…
          </p>
        </div>
      )}

      {/* Drop zone */}
      {files.length < 30 && !created && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-colors",
            dragging
              ? "border-primary-500 bg-primary-50"
              : "border-border-emphasis hover:border-primary-400 hover:bg-surface-subtle",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="audio/*,.mp3,.m4a"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="sr-only"
          />
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
          <div className="text-center">
            <p className="font-medium text-ink-secondary">
              Drop audio files here, or{" "}
              <span className="text-primary-700">click to browse</span>
            </p>
            <p className="text-sm text-ink-muted mt-1">
              MP3, M4A, WAV · Up to 30 files · Max 500 MB each
            </p>
          </div>
        </div>
      )}

      {/* Global settings — shown once files are added */}
      {files.length > 0 && !created && (
        <>
          <div className="bg-surface-card border border-border-default rounded-2xl p-5">
            <p className="text-sm font-semibold text-ink-primary mb-4">
              Apply to all rows
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-secondary">
                  Scholar
                </label>
                <select
                  value={globalScholar}
                  onChange={(e) => {
                    setGlobalScholar(e.target.value);
                    applyGlobal("scholarId", e.target.value);
                  }}
                  className={inputCls}
                >
                  <option value="">— No scholar —</option>
                  {scholars.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.honorifics ? `${s.honorifics} ${s.name}` : s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-secondary">
                  Category
                </label>
                <select
                  value={globalCategory}
                  onChange={(e) => {
                    setGlobalCategory(e.target.value);
                    applyGlobal("categoryId", e.target.value);
                  }}
                  className={inputCls}
                >
                  <option value="">— No category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-secondary">
                  Language
                </label>
                <select
                  value={globalLanguage}
                  onChange={(e) => {
                    setGlobalLanguage(e.target.value);
                    applyGlobal("language", e.target.value);
                  }}
                  className={inputCls}
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                  <option value="ha">Hausa</option>
                  <option value="yo">Yoruba</option>
                </select>
              </div>
            </div>
          </div>

          {/* Per-file table */}
          <div className="bg-surface-card border border-border-default rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface-subtle">
              <p className="text-sm font-semibold text-ink-primary">
                {files.length} file{files.length !== 1 ? "s" : ""}
                {uploadingCount > 0 && (
                  <span className="text-primary-700 ml-2">
                    · {uploadingCount} uploading…
                  </span>
                )}
                {allDone && doneCount > 0 && (
                  <span className="text-green-600 ml-2">
                    · {doneCount} ready
                  </span>
                )}
              </p>
              {allDone && readyToCreate > 0 && (
                <button
                  type="button"
                  onClick={handleCreateAll}
                  disabled={creating}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-40"
                >
                  {creating && (
                    <svg
                      className="animate-spin"
                      width="14"
                      height="14"
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
                  )}
                  Create {readyToCreate} lecture{readyToCreate !== 1 ? "s" : ""}{" "}
                  as drafts
                </button>
              )}
            </div>

            <div className="divide-y divide-border-subtle">
              {files.map((file) => (
                <div
                  key={file.localId}
                  className="flex items-start gap-4 px-5 py-4"
                >
                  {/* Status indicator */}
                  <div className="shrink-0 mt-1">
                    {file.status === "uploading" ? (
                      <div className="size-8 rounded-full border-2 border-primary-200 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-700 tabular-nums">
                          {file.progress}%
                        </span>
                      </div>
                    ) : file.status === "done" ? (
                      <div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#16a34a"
                          strokeWidth="2.5"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    ) : (
                      <div className="size-8 rounded-full bg-red-100 flex items-center justify-center">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#dc2626"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* File info + editable title */}
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-ink-muted">
                      <span className="truncate max-w-[200px]">
                        {file.filename}
                      </span>
                      <span>·</span>
                      <span>{formatFileSize(file.sizeBytes)}</span>
                      {file.durationSecs && (
                        <>
                          <span>·</span>
                          <span>{formatDurationLong(file.durationSecs)}</span>
                        </>
                      )}
                    </div>

                    {file.status === "uploading" && (
                      <div className="h-1.5 bg-border-default rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-700 rounded-full transition-all duration-150"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}

                    {file.status === "done" && (
                      <input
                        type="text"
                        value={file.title}
                        onChange={(e) =>
                          setFiles((prev) =>
                            prev.map((f) =>
                              f.localId === file.localId
                                ? { ...f, title: e.target.value }
                                : f,
                            ),
                          )
                        }
                        placeholder="Enter lecture title…"
                        className="w-full rounded-lg px-3 py-1.5 text-sm border border-border-emphasis bg-surface-card text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/15 transition-colors"
                      />
                    )}

                    {file.status === "error" && (
                      <p className="text-xs text-red-600">{file.error}</p>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() =>
                      setFiles((prev) =>
                        prev.filter((f) => f.localId !== file.localId),
                      )
                    }
                    className="shrink-0 size-7 rounded-md text-ink-muted hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors mt-0.5"
                    aria-label={`Remove ${file.filename}`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
