"use client";
// src/features/contact/components/ContactForm.tsx

import { useState, useTransition } from "react";
import { sendContactEmail } from "../actions/contact.action";

const inputCls = [
  "w-full rounded-lg px-3 py-2.5 text-sm",
  "border border-border-emphasis bg-surface-card text-ink-primary",
  "placeholder:text-ink-muted",
  "focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/15",
  "transition-colors",
].join(" ");

const SUBJECTS = [
  "General enquiry",
  "Suggest a scholar",
  "Report an issue",
  "Content request",
  "Technical support",
  "Partnership",
  "Other",
];

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await sendContactEmail({
        name: form.get("name") as string,
        email: form.get("email") as string,
        subject: form.get("subject") as string,
        message: form.get("message") as string,
      });

      if (result.ok) {
        setStatus("success");
        setMessage(
          "Your message has been sent. We will get back to you soon, in sha Allah.",
        );
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus("error");
        setMessage(result.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="size-14 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <p className="font-display font-semibold text-lg text-ink-primary">
            Message sent!
          </p>
          <p className="text-ink-muted text-sm mt-1">{message}</p>
        </div>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-sm text-primary-700 hover:text-primary-800 font-medium transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {status === "error" && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="name"
            className="text-xs font-medium text-ink-secondary"
          >
            Your name{" "}
            <span aria-hidden="true" className="text-red-500">
              *
            </span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g. Abdullahi Musa"
            className={inputCls}
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-xs font-medium text-ink-secondary"
          >
            Email address{" "}
            <span aria-hidden="true" className="text-red-500">
              *
            </span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className={inputCls}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="subject"
          className="text-xs font-medium text-ink-secondary"
        >
          Subject{" "}
          <span aria-hidden="true" className="text-red-500">
            *
          </span>
        </label>
        <select
          id="subject"
          name="subject"
          required
          className={inputCls}
          disabled={isPending}
        >
          <option value="">— Select a subject —</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="message"
          className="text-xs font-medium text-ink-secondary"
        >
          Message{" "}
          <span aria-hidden="true" className="text-red-500">
            *
          </span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Write your message here…"
          className={inputCls}
          disabled={isPending}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 rounded-xl bg-primary-700 text-white font-semibold text-sm hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending ? (
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
            Sending…
          </>
        ) : (
          "Send message"
        )}
      </button>

      <p className="text-xs text-ink-muted text-center">
        We typically respond within 2–3 business days, in sha Allah.
      </p>
    </form>
  );
}
