"use client";
// src/features/admin/components/client/forms/ScholarForm.tsx

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
  createScholar,
  updateScholar,
  deleteScholar,
} from "@features/admin/actions/content.actions";

interface ScholarFormProps {
  scholar?: {
    id: string;
    name: string;
    arabicName: string | null;
    honorifics: string | null;
    nationality: string | null;
    location: string | null;
    biography: string | null;
    websiteUrl: string | null;
    twitterHandle: string | null;
    isActive: boolean;
    defaultLanguage: string;
    metaTitle: string | null;
    metaDescription: string | null;
  };
}

export function ScholarForm({ scholar }: ScholarFormProps) {
  const router = useRouter();
  const isEdit = !!scholar;
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
      ...(isEdit && { id: scholar.id }),
      name: form.get("name") as string,
      arabicName: (form.get("arabicName") as string) || undefined,
      honorifics: (form.get("honorifics") as string) || undefined,
      nationality: (form.get("nationality") as string) || undefined,
      location: (form.get("location") as string) || undefined,
      biography: (form.get("biography") as string) || undefined,
      websiteUrl: (form.get("websiteUrl") as string) || undefined,
      twitterHandle:
        (form.get("twitterHandle") as string)?.replace("@", "") || undefined,
      isActive: form.get("isActive") === "true",
      defaultLanguage: (form.get("defaultLanguage") as string) || "en",
      metaTitle: (form.get("metaTitle") as string) || undefined,
      metaDescription: (form.get("metaDescription") as string) || undefined,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateScholar(payload)
        : await createScholar(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (isEdit) {
        setSuccess("Scholar saved successfully.");
      } else {
        router.push("/admin/scholars");
      }
    });
  }

  function handleDelete() {
    if (!scholar || !confirm(`Delete "${scholar.name}"?`)) return;
    startDeleteTransition(async () => {
      await deleteScholar(scholar.id);
      router.push("/admin/scholars");
    });
  }

  return (
    <AdminFormLayout
      title={isEdit ? `Edit: ${scholar.name}` : "New scholar"}
      backHref="/admin/scholars"
      backLabel="Back to scholars"
      isEdit={isEdit}
    >
      <form
        id="scholar-form"
        onSubmit={handleSubmit}
        noValidate
        className="contents"
      >
        {error && <ServerErrorBanner message={error} />}
        {success && <SuccessBanner message={success} />}

        <FormCard title="Identity">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full name" htmlFor="name" required>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={scholar?.name ?? ""}
                placeholder="e.g. Ibn Uthaymin"
                className={inputCls}
              />
            </FormField>

            <FormField
              label="Honorifics"
              htmlFor="honorifics"
              hint="e.g. Shaykh, Dr."
            >
              <input
                id="honorifics"
                name="honorifics"
                type="text"
                defaultValue={scholar?.honorifics ?? ""}
                placeholder="Shaykh"
                className={inputCls}
              />
            </FormField>
          </div>

          <FormField label="Arabic name" htmlFor="arabicName">
            <input
              id="arabicName"
              name="arabicName"
              type="text"
              dir="rtl"
              lang="ar"
              defaultValue={scholar?.arabicName ?? ""}
              placeholder="الاسم بالعربية"
              className={inputCls}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nationality" htmlFor="nationality">
              <input
                id="nationality"
                name="nationality"
                type="text"
                defaultValue={scholar?.nationality ?? ""}
                placeholder="e.g. Nigerian"
                className={inputCls}
              />
            </FormField>

            <FormField label="Location" htmlFor="location">
              <input
                id="location"
                name="location"
                type="text"
                defaultValue={scholar?.location ?? ""}
                placeholder="e.g. Kano, Nigeria"
                className={inputCls}
              />
            </FormField>
          </div>
        </FormCard>

        <FormCard title="Biography">
          <FormField
            label="Biography (MDX supported)"
            htmlFor="biography"
            hint="Supports basic MDX formatting. Rendered as HTML on the scholar's profile page."
          >
            <textarea
              id="biography"
              name="biography"
              rows={12}
              defaultValue={scholar?.biography ?? ""}
              placeholder="Write the scholar's biography here…"
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
              defaultValue={scholar?.metaTitle ?? ""}
              placeholder="Leave blank to use scholar name"
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
              defaultValue={scholar?.metaDescription ?? ""}
              className={textareaCls}
            />
          </FormField>
        </FormCard>

        <SubmitRow
          isSubmitting={isPending}
          submitLabel={isEdit ? "Save changes" : "Create scholar"}
          cancelHref="/admin/scholars"
          isDeleting={isDeleting}
          {...(isEdit ? { onDelete: handleDelete } : {})}
        />
      </form>

      {/* Sidebar */}
      <>
        <FormCard title="Links">
          <FormField label="Website URL" htmlFor="websiteUrl">
            <input
              id="websiteUrl"
              name="websiteUrl"
              type="url"
              form="scholar-form"
              defaultValue={scholar?.websiteUrl ?? ""}
              placeholder="https://…"
              className={inputCls}
            />
          </FormField>

          <FormField
            label="Twitter / X handle"
            htmlFor="twitterHandle"
            hint="Without the @ symbol."
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted text-sm">
                @
              </span>
              <input
                id="twitterHandle"
                name="twitterHandle"
                type="text"
                form="scholar-form"
                defaultValue={scholar?.twitterHandle ?? ""}
                placeholder="handle"
                className={`${inputCls} pl-7`}
              />
            </div>
          </FormField>
        </FormCard>

        <FormCard title="Settings">
          <FormField label="Status" htmlFor="isActive">
            <select
              id="isActive"
              name="isActive"
              form="scholar-form"
              defaultValue={scholar?.isActive !== false ? "true" : "false"}
              className={inputCls}
            >
              <option value="true">Active — visible on site</option>
              <option value="false">Inactive — hidden from site</option>
            </select>
          </FormField>

          <FormField label="Primary language" htmlFor="defaultLanguage">
            <select
              id="defaultLanguage"
              name="defaultLanguage"
              form="scholar-form"
              defaultValue={scholar?.defaultLanguage ?? "en"}
              className={inputCls}
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="ha">Hausa</option>
              <option value="yo">Yoruba</option>
            </select>
          </FormField>
        </FormCard>
      </>
    </AdminFormLayout>
  );
}
