"use client";
// src/features/admin/components/client/forms/SeriesForm.tsx

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import {
  AdminFormLayout,
  FormCard,
  FormField,
  inputCls,
  textareaCls,
  SubmitRow,
  ServerErrorBanner,
  SuccessBanner,
} from "./AdminFormLayout";
import {
  createSeries,
  updateSeries,
  addLectureToSeries,
  removeLectureFromSeries,
  reorderSeriesLectures,
  type CreateSeriesInput,
  type UpdateSeriesInput,
} from "@features/admin/actions/series.actions";

interface SeriesLecture {
  id: string;
  title: string;
  seriesPosition: number | null;
  publishedAt: Date | null;
  status: string;
}

interface SeriesFormProps {
  series?: {
    id: string;
    title: string;
    description: string | null;
    scholarId: string | null;
    isActive: boolean;
    lectures: SeriesLecture[];
  };
  scholars: Array<{ id: string; name: string; honorifics: string | null }>;
  availableLectures: Array<{
    id: string;
    title: string;
    scholarId: string | null;
    status: string;
    publishedAt?: Date | null;
  }>;
}

export function SeriesForm({
  series,
  scholars,
  availableLectures,
}: SeriesFormProps) {
  const router = useRouter();
  const isEdit = !!series;

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Local state for lectures in this series (for optimistic UI)
  const [seriesLectures, setSeriesLectures] = useState<SeriesLecture[]>(
    (series?.lectures ?? []).sort(
      (a, b) => (a.seriesPosition ?? 0) - (b.seriesPosition ?? 0),
    ),
  );
  const [selectedLectureId, setSelectedLectureId] = useState("");

  // Lectures not yet in this series
  const assignableLectures = availableLectures.filter(
    (l) => !seriesLectures.some((sl) => sl.id === l.id),
  );

  // ── Submit form ─────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const description = (form.get("description") as string) || undefined;
    const scholarId = (form.get("scholarId") as string) || undefined;
    const isActive = form.get("isActive") === "true";

    startTransition(async () => {
      let result;

      if (isEdit && series) {
        const updatePayload: UpdateSeriesInput = {
          id: series.id,
          title,
          description,
          scholarId,
          isActive,
        };
        result = await updateSeries(updatePayload);
      } else {
        const createPayload: CreateSeriesInput = {
          title,
          description,
          scholarId,
          isActive,
        };
        result = await createSeries(createPayload);
      }

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (isEdit) {
        setSuccess("Series saved successfully.");
      } else {
        router.push("/admin/series");
      }
    });
  }

  // ── Add lecture to series ───────────────────────────────────────────────────
  async function handleAddLecture() {
    if (!selectedLectureId || !series) return;

    const position = seriesLectures.length + 1;
    const lecture = availableLectures.find((l) => l.id === selectedLectureId);
    if (!lecture) return;

    startTransition(async () => {
      const result = await addLectureToSeries(
        series.id,
        selectedLectureId,
        position,
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSeriesLectures((prev) => [
        ...prev,
        {
          id: selectedLectureId,
          title: lecture.title,
          seriesPosition: position,
          publishedAt: lecture.publishedAt ?? null, // Uses actual date if present
          status: lecture.status, // Uses actual status from availableLectures
        },
      ]);
      setSelectedLectureId("");
    });
  }

  // ── Remove lecture from series ──────────────────────────────────────────────
  async function handleRemoveLecture(lectureId: string) {
    if (!series) return;
    startTransition(async () => {
      const result = await removeLectureFromSeries(series.id, lectureId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSeriesLectures((prev) => prev.filter((l) => l.id !== lectureId));
    });
  }

  // ── Move lecture up/down ────────────────────────────────────────────────────
  async function handleMove(lectureId: string, direction: "up" | "down") {
    if (!series) return;

    const idx = seriesLectures.findIndex((l) => l.id === lectureId);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === seriesLectures.length - 1) return;

    const newList = [...seriesLectures];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newList[idx], newList[swapIdx]] = [newList[swapIdx]!, newList[idx]!];

    const reordered = newList.map((l, i) => ({ ...l, seriesPosition: i + 1 }));
    setSeriesLectures(reordered);

    startTransition(async () => {
      await reorderSeriesLectures(
        series.id,
        reordered.map((l) => ({
          lectureId: l.id,
          position: l.seriesPosition!,
        })),
      );
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminFormLayout
        title={isEdit ? `Edit: ${series.title}` : "New series"}
        backHref="/admin/series"
        backLabel="Back to series"
        isEdit={isEdit}
      >
        <form
          id="series-form"
          onSubmit={handleSubmit}
          noValidate
          className="contents"
        >
          {error && <ServerErrorBanner message={error} />}
          {success && <SuccessBanner message={success} />}

          <FormCard title="Series details">
            <FormField label="Title" htmlFor="title" required>
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={series?.title ?? ""}
                placeholder="e.g. Explanation of the Three Principles"
                className={inputCls}
              />
            </FormField>

            <FormField
              label="Description"
              htmlFor="description"
              hint="Briefly describe what this series covers."
            >
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={series?.description ?? ""}
                placeholder="A multi-part series covering…"
                className={textareaCls}
              />
            </FormField>
          </FormCard>

          <SubmitRow
            isSubmitting={isPending}
            submitLabel={isEdit ? "Save changes" : "Create series"}
            cancelHref="/admin/series"
          />
        </form>

        {/* Sidebar */}
        <>
          <FormCard title="Settings">
            <FormField label="Scholar" htmlFor="scholarId">
              <select
                id="scholarId"
                name="scholarId"
                form="series-form"
                defaultValue={series?.scholarId ?? ""}
                className={inputCls}
              >
                <option value="">— No scholar —</option>
                {scholars.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.honorifics ? `${s.honorifics} ${s.name}` : s.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Status" htmlFor="isActive">
              <select
                id="isActive"
                name="isActive"
                form="series-form"
                defaultValue={series?.isActive !== false ? "true" : "false"}
                className={inputCls}
              >
                <option value="true">Active — visible on site</option>
                <option value="false">Inactive — hidden from site</option>
              </select>
            </FormField>
          </FormCard>
        </>
      </AdminFormLayout>

      {/* ── Lecture management ─────────────────────────────────────────────
          Rendered OUTSIDE AdminFormLayout so it spans full width below
          the main form section in edit mode.
      ──────────────────────────────────────────────────────────────────── */}
      {isEdit && (
        <div className="flex flex-col gap-5 max-w-6xl">
          {/* Current lectures in series */}
          <FormCard
            title={`Lectures in this series (${seriesLectures.length})`}
          >
            {seriesLectures.length === 0 ? (
              <p className="text-sm text-ink-muted py-4 text-center">
                No lectures added yet. Use the form below to add lectures.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-border-subtle">
                {seriesLectures.map((lecture, idx) => (
                  <div
                    key={lecture.id}
                    className="flex items-center gap-3 py-3"
                  >
                    {/* Position badge */}
                    <span className="size-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    {/* Title */}
                    <span className="flex-1 text-sm text-ink-primary font-medium line-clamp-1">
                      {lecture.title}
                    </span>

                    {/* Status badge */}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        lecture.status === "published"
                          ? "bg-green-50 text-green-700"
                          : "bg-surface-muted text-ink-muted"
                      }`}
                    >
                      {lecture.status}
                    </span>

                    {/* Move up/down */}
                    <div className="flex gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMove(lecture.id, "up")}
                        disabled={idx === 0 || isPending}
                        className="p-1 rounded text-ink-muted hover:text-ink-primary disabled:opacity-30 transition-colors"
                        aria-label="Move up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(lecture.id, "down")}
                        disabled={
                          idx === seriesLectures.length - 1 || isPending
                        }
                        className="p-1 rounded text-ink-muted hover:text-ink-primary disabled:opacity-30 transition-colors"
                        aria-label="Move down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => handleRemoveLecture(lecture.id)}
                      disabled={isPending}
                      className="p-1 rounded text-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                      aria-label={`Remove ${lecture.title} from series`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FormCard>

          {/* Add lecture dropdown */}
          {assignableLectures.length > 0 ? (
            <FormCard title="Add lecture to series">
              <div className="flex gap-3">
                <select
                  value={selectedLectureId}
                  onChange={(e) => setSelectedLectureId(e.target.value)}
                  className={`${inputCls} flex-1`}
                  aria-label="Select lecture to add"
                >
                  <option value="">— Select a lecture to add —</option>
                  {assignableLectures.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddLecture}
                  disabled={!selectedLectureId || isPending}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-700 text-white hover:bg-primary-800 transition-colors disabled:opacity-40 shrink-0"
                >
                  Add to series
                </button>
              </div>
              <p className="text-xs text-ink-muted">
                Only lectures by the same scholar are shown. Lectures already in
                another series are excluded.
              </p>
            </FormCard>
          ) : (
            <div className="rounded-xl bg-surface-subtle border border-border-default px-5 py-4">
              <p className="text-sm text-ink-muted">
                No unassigned lectures available to add. Create new lectures or
                remove lectures from other series first.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
