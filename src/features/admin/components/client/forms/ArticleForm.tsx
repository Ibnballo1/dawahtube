"use client";
// src/features/admin/components/client/forms/ArticleForm.tsx

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
  createArticle,
  updateArticle,
  publishArticle,
  deleteArticle,
} from "@features/admin/actions/content.actions";

interface ArticleFormProps {
  article?: {
    id: string;
    title: string;
    excerpt: string | null;
    content: string | null;
    scholarId: string | null;
    categoryId: string | null;
    status: string;
    defaultLanguage: string;
    metaTitle: string | null;
    metaDescription: string | null;
  };
  scholars: Array<{ id: string; name: string; honorifics: string | null }>;
  categories: Array<{ id: string; name: string }>;
}

export function ArticleForm({
  article,
  scholars,
  categories,
}: ArticleFormProps) {
  const router = useRouter();
  const isEdit = !!article;
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
      ...(isEdit && { id: article.id }),
      title: form.get("title") as string,
      excerpt: (form.get("excerpt") as string) || undefined,
      content: (form.get("content") as string) || undefined,
      scholarId: (form.get("scholarId") as string) || undefined,
      categoryId: (form.get("categoryId") as string) || undefined,
      status: (form.get("status") as string) || "draft",
      defaultLanguage: (form.get("defaultLanguage") as string) || "en",
      metaTitle: (form.get("metaTitle") as string) || undefined,
      metaDescription: (form.get("metaDescription") as string) || undefined,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateArticle(payload)
        : await createArticle(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      isEdit
        ? setSuccess("Article saved successfully.")
        : router.push("/admin/articles");
    });
  }

  function handleDelete() {
    if (!article || !confirm(`Delete "${article.title}"?`)) return;
    startDeleteTransition(async () => {
      await deleteArticle(article.id);
      router.push("/admin/articles");
    });
  }

  return (
    <AdminFormLayout
      title={isEdit ? `Edit: ${article.title}` : "New article"}
      backHref="/admin/articles"
      backLabel="Back to articles"
      isEdit={isEdit}
    >
      <form
        id="article-form"
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
              defaultValue={article?.title ?? ""}
              placeholder="e.g. The Importance of Learning Arabic"
              className={inputCls}
            />
          </FormField>

          <FormField
            label="Excerpt"
            htmlFor="excerpt"
            hint="A short summary shown on listing pages. Max 500 characters."
          >
            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              maxLength={500}
              defaultValue={article?.excerpt ?? ""}
              placeholder="A brief, engaging summary of the article…"
              className={textareaCls}
            />
          </FormField>
        </FormCard>

        <FormCard title="Content">
          <FormField
            label="Article content (MDX)"
            htmlFor="content"
            hint="Supports MDX: headings (##, ###), bold (**text**), blockquotes (>), and custom components like <ArabicVerse />, <Hadith />, <Benefit />."
          >
            <textarea
              id="content"
              name="content"
              rows={24}
              defaultValue={article?.content ?? ""}
              placeholder={`## Introduction\n\nWrite your article content here using MDX...\n\n<Hadith narrator="Abu Hurayrah" source="Bukhari" grade="Sahih">\nThe Messenger of Allah ﷺ said...\n</Hadith>`}
              className={textareaCls}
              style={{ fontFamily: "monospace", fontSize: "13px" }}
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
              defaultValue={article?.metaTitle ?? ""}
              placeholder="Leave blank to use article title"
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
              defaultValue={article?.metaDescription ?? ""}
              placeholder="Leave blank to use excerpt"
              className={textareaCls}
            />
          </FormField>
        </FormCard>

        <SubmitRow
          isSubmitting={isPending}
          submitLabel={isEdit ? "Save changes" : "Create article"}
          cancelHref="/admin/articles"
          isDeleting={isDeleting}
          {...(isEdit ? { onDelete: handleDelete } : {})}
        />
      </form>

      {/* Sidebar */}
      <>
        <FormCard title="Scholar & category">
          <FormField label="Scholar" htmlFor="scholarId">
            <select
              id="scholarId"
              name="scholarId"
              form="article-form"
              defaultValue={article?.scholarId ?? ""}
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
              form="article-form"
              defaultValue={article?.categoryId ?? ""}
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

          <FormField label="Language" htmlFor="defaultLanguage">
            <select
              id="defaultLanguage"
              name="defaultLanguage"
              form="article-form"
              defaultValue={article?.defaultLanguage ?? "en"}
              className={inputCls}
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="ha">Hausa</option>
              <option value="yo">Yoruba</option>
            </select>
          </FormField>
        </FormCard>

        <FormCard title="Status">
          <FormField label="Publication status" htmlFor="status">
            <select
              id="status"
              name="status"
              form="article-form"
              defaultValue={article?.status ?? "draft"}
              className={inputCls}
            >
              <option value="draft">Draft</option>
              <option value="review">In review</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>

          {isEdit && article.status !== "published" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const r = await publishArticle(article.id);
                  if (r.ok) setSuccess("Article published successfully.");
                  else setError(r.error);
                });
              }}
              className="w-full py-2 !bg-red-700 rounded-lg text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-40"
            >
              Publish now
            </button>
          )}
        </FormCard>

        {isEdit && (
          <FormCard title="Preview">
            <a
              href={`/articles/${article.id}`}
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
