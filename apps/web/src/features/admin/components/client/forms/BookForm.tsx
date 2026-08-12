"use client";
// src/features/admin/components/client/forms/BookForm.tsx

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
  createBook,
  updateBook,
  publishBook,
  deleteBook,
} from "@features/admin/actions/content.actions";
import { FileUpload } from "./FileUpload";

interface BookFormProps {
  book?: {
    id: string;
    title: string;
    description: string | null;
    authorName: string | null;
    translator: string | null;
    publishYear: number | null;
    pageCount: number | null;
    language: string;
    allowFreeDownload: boolean;
    status: string;
    defaultLanguage: string;
    metaTitle: string | null;
    metaDescription: string | null;
    categoryId: string | null;
    pdfAssetId: string | null;
    coverAssetId: string | null;
    coverUrl?: string | null;
  };
  categories: Array<{ id: string; name: string }>;
}

export function BookForm({ book, categories }: BookFormProps) {
  const router = useRouter();
  const isEdit = !!book;
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Track uploaded asset IDs independently
  const [pdfAssetId, setPdfAssetId] = useState<string | null>(
    book?.pdfAssetId ?? null,
  );
  const [coverAssetId, setCoverAssetId] = useState<string | null>(
    book?.coverAssetId ?? null,
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const form = new FormData(e.currentTarget);

    const payload = {
      ...(isEdit && { id: book.id }),
      title: form.get("title") as string,
      description: (form.get("description") as string) || undefined,
      authorName: (form.get("authorName") as string) || undefined,
      translator: (form.get("translator") as string) || undefined,
      publishYear: form.get("publishYear")
        ? parseInt(form.get("publishYear") as string, 10)
        : undefined,
      pageCount: form.get("pageCount")
        ? parseInt(form.get("pageCount") as string, 10)
        : undefined,
      language: (form.get("language") as string) || "en",
      allowFreeDownload: form.get("allowFreeDownload") === "true",
      status: (form.get("status") as string) || "draft",
      defaultLanguage: (form.get("defaultLanguage") as string) || "en",
      categoryId: (form.get("categoryId") as string) || undefined,
      metaTitle: (form.get("metaTitle") as string) || undefined,
      metaDescription: (form.get("metaDescription") as string) || undefined,
      pdfAssetId: pdfAssetId ?? undefined,
      coverAssetId: coverAssetId ?? undefined,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateBook(payload)
        : await createBook(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      isEdit
        ? setSuccess("Book saved successfully.")
        : router.push("/admin/library");
    });
  }

  function handleDelete() {
    if (!book || !confirm(`Delete "${book.title}"?`)) return;
    startDeleteTransition(async () => {
      await deleteBook(book.id);
      router.push("/admin/library");
    });
  }

  return (
    <AdminFormLayout
      title={isEdit ? `Edit: ${book.title}` : "New book"}
      backHref="/admin/library"
      backLabel="Back to library"
      isEdit={isEdit}
    >
      <form
        id="book-form"
        onSubmit={handleSubmit}
        noValidate
        className="contents"
      >
        {error && <ServerErrorBanner message={error} />}
        {success && <SuccessBanner message={success} />}

        <FormCard title="Book details">
          <FormField label="Title" htmlFor="title" required>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={book?.title ?? ""}
              placeholder="e.g. Kitaab ut-Tawheed"
              className={inputCls}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Author name" htmlFor="authorName">
              <input
                id="authorName"
                name="authorName"
                type="text"
                defaultValue={book?.authorName ?? ""}
                placeholder="e.g. Muhammad ibn Abdul-Wahhab"
                className={inputCls}
              />
            </FormField>

            <FormField
              label="Translator"
              htmlFor="translator"
              hint="If translated from Arabic."
            >
              <input
                id="translator"
                name="translator"
                type="text"
                defaultValue={book?.translator ?? ""}
                placeholder="Translator's name"
                className={inputCls}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Publish year" htmlFor="publishYear">
              <input
                id="publishYear"
                name="publishYear"
                type="number"
                min={600}
                max={new Date().getFullYear()}
                defaultValue={book?.publishYear ?? ""}
                placeholder="e.g. 1736"
                className={inputCls}
              />
            </FormField>

            <FormField label="Page count" htmlFor="pageCount">
              <input
                id="pageCount"
                name="pageCount"
                type="number"
                min={1}
                defaultValue={book?.pageCount ?? ""}
                placeholder="e.g. 240"
                className={inputCls}
              />
            </FormField>
          </div>

          <FormField label="Description" htmlFor="description">
            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={book?.description ?? ""}
              placeholder="A brief description of this book…"
              className={textareaCls}
            />
          </FormField>
        </FormCard>

        {/* ── PDF upload ─────────────────────────────────────────────── */}
        <FormCard title="PDF file">
          <FileUpload
            uploadType="pdf"
            accept=".pdf,application/pdf"
            label="Book PDF"
            hint="PDF only · Max 500 MB · Stored in private R2 bucket"
            currentName={pdfAssetId ? "Current PDF file" : null}
            onComplete={(assetId) => setPdfAssetId(assetId)}
            onClear={() => setPdfAssetId(null)}
          />
          {pdfAssetId && (
            <p className="text-xs text-ink-muted font-mono">
              Asset: {pdfAssetId}
            </p>
          )}
          {!pdfAssetId && isEdit && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              No PDF attached yet. Upload one above to enable reading and
              downloading.
            </p>
          )}
        </FormCard>

        {/* ── Cover image upload ─────────────────────────────────────── */}
        <FormCard title="Cover image">
          <FileUpload
            uploadType="cover"
            accept="image/jpeg,image/png,image/webp"
            label="Cover image"
            hint="JPEG, PNG or WebP · Recommended 400×600 px · Max 10 MB"
            maxMB={10}
            currentUrl={book?.coverUrl ?? null}
            onComplete={(assetId) => setCoverAssetId(assetId)}
            onClear={() => setCoverAssetId(null)}
          />
          {coverAssetId && (
            <p className="text-xs text-ink-muted font-mono">
              Asset: {coverAssetId}
            </p>
          )}
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
              defaultValue={book?.metaTitle ?? ""}
              placeholder="Leave blank to use book title"
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
              defaultValue={book?.metaDescription ?? ""}
              className={textareaCls}
            />
          </FormField>
        </FormCard>

        <SubmitRow
          isSubmitting={isPending}
          submitLabel={isEdit ? "Save changes" : "Create book"}
          cancelHref="/admin/library"
          {...(isEdit ? { onDelete: handleDelete } : {})}
          isDeleting={isDeleting}
        />
      </form>

      {/* Sidebar */}
      <>
        <FormCard title="Category & language">
          <FormField label="Category" htmlFor="categoryId">
            <select
              id="categoryId"
              name="categoryId"
              form="book-form"
              defaultValue={book?.categoryId ?? ""}
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

          <FormField label="Book language" htmlFor="language">
            <select
              id="language"
              name="language"
              form="book-form"
              defaultValue={book?.language ?? "en"}
              className={inputCls}
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="ha">Hausa</option>
              <option value="yo">Yoruba</option>
              <option value="fr">French</option>
            </select>
          </FormField>

          <FormField label="Allow free download?" htmlFor="allowFreeDownload">
            <select
              id="allowFreeDownload"
              name="allowFreeDownload"
              form="book-form"
              defaultValue={
                book?.allowFreeDownload !== false ? "true" : "false"
              }
              className={inputCls}
            >
              <option value="true">Yes — free for all readers</option>
              <option value="false">No — sign-in required</option>
            </select>
          </FormField>
        </FormCard>

        <FormCard title="Status">
          <FormField label="Publication status" htmlFor="status">
            <select
              id="status"
              name="status"
              form="book-form"
              defaultValue={book?.status ?? "draft"}
              className={inputCls}
            >
              <option value="draft">Draft</option>
              <option value="review">In review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>

          {isEdit && book.status !== "published" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const r = await publishBook(book.id);
                  if (r.ok) setSuccess("Book published successfully.");
                  else setError(r.error);
                });
              }}
              className="w-full py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-40"
            >
              Publish now
            </button>
          )}
        </FormCard>
      </>
    </AdminFormLayout>
  );
}
