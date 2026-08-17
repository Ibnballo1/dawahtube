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
import { FileUpload } from "./FileUpload";
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
    // Existing asset IDs and URLs for edit mode
    avatarAssetId: string | null;
    avatarUrl: string | null;
    bannerAssetId: string | null;
    bannerUrl: string | null;
  };
}

export function ScholarForm({ scholar }: ScholarFormProps) {
  const router = useRouter();
  const isEdit = !!scholar;
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Track uploaded asset IDs — populated when FileUpload completes
  const [avatarAssetId, setAvatarAssetId] = useState<string | null>(
    scholar?.avatarAssetId ?? null,
  );
  const [bannerAssetId, setBannerAssetId] = useState<string | null>(
    scholar?.bannerAssetId ?? null,
  );

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
      // Asset IDs from uploads
      avatarAssetId: avatarAssetId ?? undefined,
      bannerAssetId: bannerAssetId ?? undefined,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateScholar(payload)
        : await createScholar(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      isEdit
        ? setSuccess("Scholar saved successfully.")
        : router.push("/admin/scholars");
    });
  }

  function handleDelete() {
    if (
      !scholar ||
      !confirm(`Delete "${scholar.name}"? This cannot be undone.`)
    )
      return;
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
      {/* ── Main column ────────────────────────────────────────────── */}
      <form
        id="scholar-form"
        onSubmit={handleSubmit}
        noValidate
        className="contents"
      >
        {error && <ServerErrorBanner message={error} />}
        {success && <SuccessBanner message={success} />}

        {/* Identity */}
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

        {/* Avatar upload */}
        <FormCard title="Profile photo (avatar)">
          <FileUpload
            uploadType="avatar"
            accept="image/jpeg,image/png,image/webp"
            label="Avatar image"
            hint="JPEG, PNG or WebP · Square recommended · Min 200×200 px · Max 5 MB"
            maxMB={5}
            currentUrl={scholar?.avatarUrl ?? null}
            currentName={avatarAssetId ? "Current avatar" : null}
            onComplete={(assetId) => setAvatarAssetId(assetId)}
            onClear={() => setAvatarAssetId(null)}
          />
          {avatarAssetId && (
            <p className="text-xs text-ink-muted font-mono">
              Asset: {avatarAssetId}
            </p>
          )}

          {/* Live preview */}
          {(scholar?.avatarUrl || avatarAssetId) && (
            <div className="flex items-center gap-3 mt-2">
              <div className="size-12 rounded-full overflow-hidden bg-primary-100 shrink-0">
                {scholar?.avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={scholar.avatarUrl}
                    alt="Current avatar"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <p className="text-xs text-ink-muted">
                Current avatar — upload a new one above to replace it.
              </p>
            </div>
          )}
        </FormCard>

        {/* Banner upload */}
        <FormCard title="Profile banner">
          <FileUpload
            uploadType="banner"
            accept="image/jpeg,image/png,image/webp"
            label="Banner image"
            hint="JPEG, PNG or WebP · Recommended 1440×400 px · Max 10 MB"
            maxMB={10}
            currentUrl={scholar?.bannerUrl ?? null}
            currentName={bannerAssetId ? "Current banner" : null}
            onComplete={(assetId) => setBannerAssetId(assetId)}
            onClear={() => setBannerAssetId(null)}
          />
          {bannerAssetId && (
            <p className="text-xs text-ink-muted font-mono">
              Asset: {bannerAssetId}
            </p>
          )}

          {/* Live banner preview */}
          {scholar?.bannerUrl && (
            <div className="mt-2 rounded-lg overflow-hidden border border-border-default">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={scholar.bannerUrl}
                alt="Current banner"
                className="w-full h-20 object-cover"
              />
            </div>
          )}
        </FormCard>

        {/* Biography */}
        <FormCard title="Biography">
          <FormField
            label="Biography (MDX supported)"
            htmlFor="biography"
            hint="Supports basic MDX — **bold**, ## headings, > blockquotes. Rendered as HTML on the scholar's profile."
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

        {/* SEO */}
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

      {/* ── Sidebar ────────────────────────────────────────────────── */}
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

        {isEdit && (
          <FormCard title="Public profile">
            <a
              href={`/scholars/${scholar.id}`}
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
              View public profile
            </a>
          </FormCard>
        )}
      </>
    </AdminFormLayout>
  );
}
