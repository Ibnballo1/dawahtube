"use client";
// src/features/admin/components/client/forms/ReminderForm.tsx

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
  createReminder,
  updateReminder,
  publishReminder,
  deleteReminder,
} from "@features/admin/actions/content.actions";

interface ReminderFormProps {
  reminder?: {
    id: string;
    title: string;
    content: string | null;
    source: string | null;
    scholarId: string | null;
    status: string;
  };
  scholars: Array<{ id: string; name: string; honorifics: string | null }>;
}

export function ReminderForm({ reminder, scholars }: ReminderFormProps) {
  const router = useRouter();
  const isEdit = !!reminder;
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const form = new FormData(e.currentTarget);

    const payload = {
      ...(isEdit && { id: reminder.id }),
      title: form.get("title") as string,
      content: (form.get("content") as string) || undefined,
      source: (form.get("source") as string) || undefined,
      scholarId: (form.get("scholarId") as string) || undefined,
      status: (form.get("status") as string) || "draft",
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateReminder(payload)
        : await createReminder(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      isEdit
        ? setSuccess("Reminder saved successfully.")
        : router.push("/admin/reminders");
    });
  }

  function handleDelete() {
    if (!reminder || !confirm(`Delete "${reminder.title}"?`)) return;
    startDeleteTransition(async () => {
      await deleteReminder(reminder.id);
      router.push("/admin/reminders");
    });
  }

  return (
    <AdminFormLayout
      title={isEdit ? `Edit: ${reminder.title}` : "New reminder"}
      backHref="/admin/reminders"
      backLabel="Back to reminders"
      isEdit={isEdit}
    >
      <form
        id="reminder-form"
        onSubmit={handleSubmit}
        noValidate
        className="contents"
      >
        {error && <ServerErrorBanner message={error} />}
        {success && <SuccessBanner message={success} />}

        <FormCard title="Reminder">
          <FormField label="Title" htmlFor="title" required>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={reminder?.title ?? ""}
              placeholder="e.g. The Virtue of Remembering Allah"
              className={inputCls}
            />
          </FormField>

          <FormField
            label="Content (MDX)"
            htmlFor="content"
            hint="Supports MDX. Use <ArabicVerse />, <Hadith />, and <Benefit /> components. Displayed on a dark emerald background on the homepage."
          >
            <textarea
              id="content"
              name="content"
              rows={14}
              defaultValue={reminder?.content ?? ""}
              placeholder={`<ArabicVerse reference="Surah Al-Baqarah 2:152" text="فَاذْكُرُونِي أَذْكُرْكُمْ" translation="So remember Me; I will remember you." />\n\nThe Messenger of Allah ﷺ said...`}
              className={textareaCls}
              style={{ fontFamily: "monospace", fontSize: "13px" }}
            />
          </FormField>

          <FormField
            label="Source"
            htmlFor="source"
            hint="e.g. Sahih al-Bukhari 6407 or Surah Al-Ahzab 33:41"
          >
            <input
              id="source"
              name="source"
              type="text"
              defaultValue={reminder?.source ?? ""}
              placeholder="Qur'an or Hadith reference"
              className={inputCls}
            />
          </FormField>
        </FormCard>

        <SubmitRow
          isSubmitting={isPending}
          submitLabel={isEdit ? "Save changes" : "Create reminder"}
          cancelHref="/admin/reminders"
          isDeleting={isDeleting}
          {...(isEdit ? { onDelete: handleDelete } : {})}
        />
      </form>

      {/* Sidebar */}
      <>
        <FormCard title="Scholar">
          <FormField
            label="Scholar"
            htmlFor="scholarId"
            hint="Optional — the scholar who shared this reminder."
          >
            <select
              id="scholarId"
              name="scholarId"
              form="reminder-form"
              defaultValue={reminder?.scholarId ?? ""}
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
        </FormCard>

        <FormCard title="Status">
          <FormField label="Publication status" htmlFor="status">
            <select
              id="status"
              name="status"
              form="reminder-form"
              defaultValue={reminder?.status ?? "draft"}
              className={inputCls}
            >
              <option value="draft">Draft</option>
              <option value="review">In review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>

          {isEdit && reminder.status !== "published" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const r = await publishReminder(reminder.id);
                  if (r.ok)
                    setSuccess("Reminder published and set as daily reminder.");
                  else setError(r.error);
                });
              }}
              className="w-full py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-40"
            >
              Publish now
            </button>
          )}
        </FormCard>

        <FormCard>
          <p className="text-xs text-ink-muted leading-relaxed">
            <strong className="text-ink-secondary">Tip:</strong> After
            publishing, go to{" "}
            <a
              href="/admin/featured"
              className="text-primary-700 hover:underline"
            >
              Featured slots
            </a>{" "}
            to set this reminder as the active daily reminder on the homepage.
          </p>
        </FormCard>
      </>
    </AdminFormLayout>
  );
}
