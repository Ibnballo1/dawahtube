"use client";
// src/features/admin/components/client/forms/LectureForm.tsx

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  createLecture,
  updateLecture,
  publishLecture,
  deleteLecture,
} from "@features/admin/actions/content.actions";
import { FileUpload } from "./FileUpload";

interface LectureFormProps {
  lecture?: {
    id: string;
    title: string;
    description: string | null;
    transcript: string | null;
    scholarId: string | null;
    categoryId: string | null;
    durationSecs: number | null;
    allowDownload: boolean;
    status: string;
    defaultLanguage: string;
    metaTitle: string | null;
    metaDescription: string | null;
    audioAssetId: string | null;
    thumbnailAssetId: string | null;
    audioUrl?: string | null;
    thumbnailUrl?: string | null;
  };
  scholars: Array<{ id: string; name: string; honorifics: string | null }>;
  categories: Array<{ id: string; name: string }>;
}

export function LectureForm({
  lecture,
  scholars,
  categories,
}: LectureFormProps) {
  const router = useRouter();
  const isEdit = !!lecture;
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Track uploaded asset IDs independently from the form
  const [audioAssetId, setAudioAssetId] = useState<string | null>(
    lecture?.audioAssetId ?? null,
  );
  const [thumbnailAssetId, setThumbnailAssetId] = useState<string | null>(
    lecture?.thumbnailAssetId ?? null,
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const form = new FormData(e.currentTarget);

    const payload = {
      ...(isEdit && { id: lecture.id }),
      title: form.get("title") as string,
      description: (form.get("description") as string) || undefined,
      transcript: (form.get("transcript") as string) || undefined,
      scholarId: (form.get("scholarId") as string) || undefined,
      categoryId: (form.get("categoryId") as string) || undefined,
      durationSecs: form.get("durationSecs")
        ? parseInt(form.get("durationSecs") as string, 10)
        : undefined,
      allowDownload: form.get("allowDownload") === "true",
      status: (form.get("status") as string) || "draft",
      defaultLanguage: (form.get("defaultLanguage") as string) || "en",
      metaTitle: (form.get("metaTitle") as string) || undefined,
      metaDescription: (form.get("metaDescription") as string) || undefined,
      // Asset IDs from uploads
      audioAssetId: audioAssetId ?? undefined,
      thumbnailAssetId: thumbnailAssetId ?? undefined,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateLecture(payload as Parameters<typeof updateLecture>[0])
        : await createLecture(payload as Parameters<typeof createLecture>[0]);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      isEdit
        ? setSuccess("Lecture saved successfully.")
        : router.push("/admin/lectures");
    });
  }

  function handleDelete() {
    if (!lecture || !confirm(`Delete "${lecture.title}"?`)) return;
    startDeleteTransition(async () => {
      await deleteLecture(lecture.id);
      router.push("/admin/lectures");
    });
  }

  return (
    <AdminFormLayout
      title={isEdit ? `Edit: ${lecture.title}` : "New lecture"}
      backHref="/admin/lectures"
      backLabel="Back to lectures"
      isEdit={isEdit}
    >
      <form
        id="lecture-form"
        onSubmit={handleSubmit}
        noValidate
        className="contents"
      >
        {error && <ServerErrorBanner message={error} />}
        {success && <SuccessBanner message={success} />}

        <FormCard title="Basic information">
          <FormField label="Title" htmlFor="title" required>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={lecture?.title ?? ""}
              placeholder="e.g. The Foundations of Tawheed"
              className={inputCls}
            />
          </FormField>

          <FormField label="Description" htmlFor="description">
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={lecture?.description ?? ""}
              placeholder="A brief description of this lecture…"
              className={textareaCls}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Duration (seconds)"
              htmlFor="durationSecs"
              hint="Auto-filled on audio upload"
            >
              <input
                id="durationSecs"
                name="durationSecs"
                type="number"
                min={0}
                defaultValue={lecture?.durationSecs ?? ""}
                placeholder="3600"
                className={inputCls}
              />
            </FormField>

            <FormField label="Language" htmlFor="defaultLanguage">
              <select
                id="defaultLanguage"
                name="defaultLanguage"
                defaultValue={lecture?.defaultLanguage ?? "en"}
                className={inputCls}
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
                <option value="ha">Hausa</option>
                <option value="yo">Yoruba</option>
              </select>
            </FormField>
          </div>

          <FormField label="Allow download?" htmlFor="allowDownload">
            <select
              id="allowDownload"
              name="allowDownload"
              defaultValue={lecture?.allowDownload !== false ? "true" : "false"}
              className={inputCls}
            >
              <option value="true">Yes — listeners can download</option>
              <option value="false">No — streaming only</option>
            </select>
          </FormField>
        </FormCard>

        {/* ── File uploads ──────────────────────────────────────────── */}
        <FormCard title="Audio file">
          <FileUpload
            uploadType="audio"
            accept="audio/*"
            label="Lecture audio"
            hint="MP3, M4A or WAV · Max 500 MB · Duration is auto-detected"
            currentName={audioAssetId ? "Current audio file" : null}
            onComplete={(assetId) => setAudioAssetId(assetId)}
            onClear={() => setAudioAssetId(null)}
          />
          {audioAssetId && (
            <p className="text-xs text-ink-muted font-mono">
              Asset: {audioAssetId}
            </p>
          )}
        </FormCard>

        <FormCard title="Thumbnail image">
          <FileUpload
            uploadType="thumbnail"
            accept="image/jpeg,image/png,image/webp"
            label="Thumbnail"
            hint="JPEG, PNG or WebP · Recommended 1280×720 px · Max 10 MB"
            maxMB={10}
            currentUrl={lecture?.thumbnailUrl ?? null}
            onComplete={(assetId) => setThumbnailAssetId(assetId)}
            onClear={() => setThumbnailAssetId(null)}
          />
          {thumbnailAssetId && (
            <p className="text-xs text-ink-muted font-mono">
              Asset: {thumbnailAssetId}
            </p>
          )}
        </FormCard>

        <FormCard title="Transcript">
          <FormField
            label="Full transcript (optional)"
            htmlFor="transcript"
            hint="Plain text. Shown in a collapsible panel on the lecture page."
          >
            <textarea
              id="transcript"
              name="transcript"
              rows={10}
              defaultValue={lecture?.transcript ?? ""}
              placeholder="Type or paste the lecture transcript here…"
              className={textareaCls}
            />
          </FormField>
        </FormCard>

        <FormCard title="SEO (optional)">
          <FormField
            label="Meta title"
            htmlFor="metaTitle"
            hint="Max 60 characters."
          >
            <input
              id="metaTitle"
              name="metaTitle"
              type="text"
              maxLength={60}
              defaultValue={lecture?.metaTitle ?? ""}
              placeholder="Leave blank to use lecture title"
              className={inputCls}
            />
          </FormField>
          <FormField
            label="Meta description"
            htmlFor="metaDescription"
            hint="Max 160 characters."
          >
            <textarea
              id="metaDescription"
              name="metaDescription"
              rows={3}
              maxLength={160}
              defaultValue={lecture?.metaDescription ?? ""}
              placeholder="Leave blank to use description"
              className={textareaCls}
            />
          </FormField>
        </FormCard>

        <SubmitRow
          isSubmitting={isPending}
          submitLabel={isEdit ? "Save changes" : "Create lecture"}
          cancelHref="/admin/lectures"
          {...(isEdit ? { onDelete: handleDelete } : {})}
          isDeleting={isDeleting}
        />
      </form>

      {/* Sidebar */}
      <>
        <FormCard title="Scholar & category">
          <FormField label="Scholar" htmlFor="scholarId">
            <select
              id="scholarId"
              name="scholarId"
              form="lecture-form"
              defaultValue={lecture?.scholarId ?? ""}
              className={inputCls}
            >
              <option value="">— No scholar selected —</option>
              {scholars.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.honorifics ? `${s.honorifics} ${s.name}` : s.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Category" htmlFor="categoryId">
            <select
              id="categoryId"
              name="categoryId"
              form="lecture-form"
              defaultValue={lecture?.categoryId ?? ""}
              className={inputCls}
            >
              <option value="">— No category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>
        </FormCard>

        <FormCard title="Status">
          <FormField label="Publication status" htmlFor="status">
            <select
              id="status"
              name="status"
              form="lecture-form"
              defaultValue={lecture?.status ?? "draft"}
              className={inputCls}
            >
              <option value="draft">Draft</option>
              <option value="review">In review</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>

          {isEdit && lecture.status !== "published" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const r = await publishLecture(lecture.id);
                  if (r.ok) setSuccess("Lecture published.");
                  else setError(r.error);
                });
              }}
              className="w-full py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-40"
            >
              Publish now
            </button>
          )}
        </FormCard>

        {isEdit && (
          <FormCard title="Preview">
            <a
              href={`/lectures/${lecture.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-700 hover:text-primary-800 font-medium flex items-center gap-1.5 transition-colors"
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
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
              </svg>
              View on public site
            </a>
          </FormCard>
        )}
      </>
    </AdminFormLayout>
  );
}
