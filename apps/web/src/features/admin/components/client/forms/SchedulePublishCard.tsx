"use client";
// src/features/admin/components/client/forms/SchedulePublishCard.tsx
//
// Reusable sidebar card used in LectureForm, ArticleForm, and BookForm.
// Handles three scenarios:
//   draft     → can publish now or schedule for later
//   scheduled → shows when it will publish, can reschedule or cancel
//   published → shows published date, can unpublish
//
// The component manages the status + scheduledAt pair together
// because they're tightly coupled — setting a date only makes sense
// when status is "scheduled".

import { useState } from "react";
import { cn } from "@shared/lib/utils";
import { formatDate } from "@shared/lib/format";
import { inputCls } from "./AdminFormLayout";

type ContentStatus =
  "draft" | "review" | "scheduled" | "published" | "archived";

interface SchedulePublishCardProps {
  // Current values
  status: ContentStatus;
  publishedAt: Date | null;
  scheduledAt: Date | null;

  // Called when user changes status or schedule
  onChange: (update: {
    status: ContentStatus;
    scheduledAt: string | null;
  }) => void;

  // Optional: "Publish now" button handler (calls the publishX action directly)
  onPublishNow?: () => void;
  isPublishing?: boolean;
}

export function SchedulePublishCard({
  status,
  publishedAt,
  scheduledAt,
  onChange,
  onPublishNow,
  isPublishing,
}: SchedulePublishCardProps) {
  const [localStatus, setLocalStatus] = useState<ContentStatus>(status);
  const [showScheduler, setShowScheduler] = useState(status === "scheduled");
  const [dateValue, setDateValue] = useState(
    scheduledAt ? toLocalDatetimeString(scheduledAt) : "",
  );

  function handleStatusChange(newStatus: ContentStatus) {
    setLocalStatus(newStatus);

    if (newStatus === "scheduled") {
      setShowScheduler(true);
      // Default to tomorrow at 09:00
      if (!dateValue) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        const defaultDate = toLocalDatetimeString(tomorrow);
        setDateValue(defaultDate);
        onChange({ status: "scheduled", scheduledAt: defaultDate });
      } else {
        onChange({ status: "scheduled", scheduledAt: dateValue });
      }
    } else {
      setShowScheduler(false);
      onChange({ status: newStatus, scheduledAt: null });
    }
  }

  function handleDateChange(value: string) {
    setDateValue(value);
    if (value) {
      onChange({ status: "scheduled", scheduledAt: value });
    }
  }

  function handleClearSchedule() {
    setLocalStatus("draft");
    setShowScheduler(false);
    setDateValue("");
    onChange({ status: "draft", scheduledAt: null });
  }

  const isScheduledFuture =
    localStatus === "scheduled" &&
    scheduledAt &&
    new Date(scheduledAt) > new Date();

  return (
    <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle bg-surface-subtle">
        <h2 className="font-display font-semibold text-sm text-ink-primary">
          Publication
        </h2>
      </div>
      <div className="p-5 flex flex-col gap-4">
        {/* Published state — show info, allow unpublish */}
        {localStatus === "published" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-sm font-medium text-green-700">
                Published
              </span>
            </div>
            {publishedAt && (
              <p className="text-xs text-ink-muted">
                Published on {formatDate(new Date(publishedAt))}
              </p>
            )}
            <button
              type="button"
              onClick={() => handleStatusChange("draft")}
              className="text-xs text-ink-muted hover:text-red-600 transition-colors text-left"
            >
              Unpublish → move to draft
            </button>
          </div>
        )}

        {/* Scheduled state — show countdown, allow reschedule */}
        {localStatus === "scheduled" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber-500 shrink-0" />
              <span className="text-sm font-medium text-amber-700">
                Scheduled
              </span>
            </div>
            {scheduledAt && (
              <p className="text-xs text-ink-muted">
                Will publish on {formatDate(new Date(scheduledAt))} at{" "}
                {new Date(scheduledAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        )}

        {/* Status selector — shown for non-published states */}
        {localStatus !== "published" && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="pub-status"
              className="text-xs font-medium text-ink-secondary"
            >
              Status
            </label>
            <select
              id="pub-status"
              name="status"
              value={localStatus}
              onChange={(e) =>
                handleStatusChange(e.target.value as ContentStatus)
              }
              className={inputCls}
            >
              <option value="draft">Draft</option>
              <option value="review">In review</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        )}

        {/* Hidden field so form submission picks up the status */}
        {localStatus === "published" && (
          <input type="hidden" name="status" value="published" />
        )}

        {/* Schedule date/time picker */}
        {showScheduler && (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="scheduled-at"
              className="text-xs font-medium text-ink-secondary"
            >
              Publish date & time
            </label>
            <input
              id="scheduled-at"
              name="scheduledAt"
              type="datetime-local"
              value={dateValue}
              onChange={(e) => handleDateChange(e.target.value)}
              min={toLocalDatetimeString(new Date())}
              className={cn(inputCls, "cursor-pointer")}
            />
            <p className="text-xs text-ink-muted">
              Times are in your local timezone. The cron job checks every 5
              minutes.
            </p>
            <button
              type="button"
              onClick={handleClearSchedule}
              className="text-xs text-ink-muted hover:text-ink-primary transition-colors text-left"
            >
              Cancel schedule → revert to draft
            </button>
          </div>
        )}

        {/* Hidden scheduledAt field when not scheduling */}
        {!showScheduler && <input type="hidden" name="scheduledAt" value="" />}

        {/* Publish now button */}
        {onPublishNow && localStatus !== "published" && (
          <>
            <hr className="border-border-subtle" />
            <button
              type="button"
              onClick={onPublishNow}
              disabled={isPublishing}
              className={cn(
                "w-full py-2 rounded-lg text-sm font-semibold transition-colors",
                "bg-green-600 text-white hover:bg-green-700",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2",
              )}
            >
              {isPublishing ? (
                <>
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
                  Publishing…
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Publish now
                </>
              )}
            </button>
            <p className="text-xs text-ink-muted text-center -mt-2">
              Bypasses schedule — publishes immediately
            </p>
          </>
        )}

        {/* Visibility hint */}
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-xs",
            localStatus === "published" && "bg-green-50 text-green-700",
            localStatus === "scheduled" && "bg-amber-50 text-amber-700",
            localStatus === "draft" && "bg-surface-subtle text-ink-muted",
            localStatus === "review" && "bg-blue-50 text-blue-700",
            localStatus === "archived" && "bg-surface-muted text-ink-muted",
          )}
        >
          {localStatus === "published" &&
            "✓ Visible to everyone on the public site"}
          {localStatus === "scheduled" &&
            `⏱ Will go live ${isScheduledFuture ? "automatically" : "soon"}`}
          {localStatus === "draft" && "✎ Only visible to admins and editors"}
          {localStatus === "review" && "⟳ Awaiting editorial review"}
          {localStatus === "archived" && "✕ Hidden from the public site"}
        </div>
      </div>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────
// Converts a Date to the format required by <input type="datetime-local">
// which is "YYYY-MM-DDTHH:mm" in local time (no timezone suffix).

function toLocalDatetimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}
