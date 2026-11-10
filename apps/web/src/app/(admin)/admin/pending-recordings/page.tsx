// src/app/(admin)/admin/pending-recordings/page.tsx
import type { Metadata } from "next";
import { getPendingRecordings } from "@features/admin/actions/recording.actions";
import {
  formatDurationLong,
  formatRelativeDate,
  formatFileSize,
} from "@shared/lib/format";
import { Badge } from "@shared/components/ui/badge";
import {
  ApproveRecordingButton,
  RejectRecordingButton,
} from "@features/admin/components/client/ApproveRecordingButton";

export const metadata: Metadata = { title: "Pending Recordings" };
export const dynamic = "force-dynamic";

export default async function PendingRecordingsPage() {
  const recordings = await getPendingRecordings();

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary">
            Pending Recordings
          </h1>
          <p className="text-ink-muted text-sm mt-1">
            {recordings.length === 0
              ? "No pending recordings"
              : `${recordings.length} recording${recordings.length !== 1 ? "s" : ""} awaiting review`}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {recordings.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4 text-center bg-surface-card border border-border-default rounded-2xl">
          <div className="size-14 rounded-2xl bg-surface-subtle flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
            </svg>
          </div>
          <div>
            <p className="font-display font-semibold text-lg text-ink-primary">
              All clear
            </p>
            <p className="text-ink-muted text-sm mt-1">
              No recordings waiting for review. New submissions will appear
              here.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {recordings.map(
            (
              recording: Awaited<
                ReturnType<typeof getPendingRecordings>
              >[number],
            ) => {
              const scholarName = recording.scholar
                ? [recording.scholar.honorifics, recording.scholar.name]
                    .filter(Boolean)
                    .join(" ")
                : null;
              const duration =
                recording.durationSecs ??
                recording.audioAsset?.durationSecs ??
                null;
              const fileSize = recording.audioAsset?.sizeBytes ?? null;

              return (
                <div
                  key={recording.id}
                  className="bg-surface-card border border-border-default rounded-2xl overflow-hidden"
                >
                  {/* Top bar */}
                  <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border-subtle bg-surface-subtle">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#065f46"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-display font-semibold text-sm text-ink-primary">
                          {recording.title ?? "Untitled recording"}
                        </p>
                        <p className="text-xs text-ink-muted">
                          Submitted {formatRelativeDate(recording.createdAt)}
                          {recording.recordedBy && (
                            <>
                              {" "}
                              by{" "}
                              <span className="text-ink-secondary">
                                {recording.recordedBy.name}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge variant="warning" size="sm">
                      Pending review
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-ink-muted uppercase tracking-wide">
                        Scholar
                      </span>
                      <span className="text-sm text-ink-primary font-medium">
                        {scholarName ?? (
                          <span className="text-ink-muted">Not specified</span>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-ink-muted uppercase tracking-wide">
                        Duration
                      </span>
                      <span className="text-sm text-ink-primary">
                        {duration ? formatDurationLong(duration) : "—"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-ink-muted uppercase tracking-wide">
                        File size
                      </span>
                      <span className="text-sm text-ink-primary">
                        {fileSize ? formatFileSize(fileSize) : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Recorder notes */}
                  {recording.notes && (
                    <div className="px-6 pb-4">
                      <div className="bg-surface-subtle rounded-xl px-4 py-3">
                        <p className="text-xs font-medium text-ink-muted mb-1">
                          Note from recorder
                        </p>
                        <p className="text-sm text-ink-secondary leading-relaxed">
                          {recording.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="px-6 py-4 border-t border-border-subtle flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-xs text-ink-muted">
                      Approving will create a draft lecture you can edit before
                      publishing.
                    </p>
                    <div className="flex items-center gap-3">
                      <RejectRecordingButton recordingId={recording.id} />
                      <ApproveRecordingButton
                        recordingId={recording.id}
                        defaultTitle={recording.title ?? ""}
                        scholarName={scholarName}
                      />
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}
