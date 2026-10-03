// src/app/(main)/newsletter/page.tsx
import type { Metadata } from "next";
// import { NewsletterForm } from "@shared/components/layout/NewsletterForm";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Subscribe to Da'wahTube and get notified of new lectures, articles and books.",
};

export default function NewsletterPage() {
  return (
    <div className="min-h-screen bg-surface-base">
      <div className="bg-primary-950 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-700 to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <p
            className="font-arabic text-[30vw] leading-none text-white/[0.025]"
            dir="rtl"
            lang="ar"
          >
            بريد
          </p>
        </div>
        <div className="container-site relative z-10 py-20 max-w-xl mx-auto text-center">
          <span className="label-overline text-accent-500">Stay Connected</span>
          <h1 className="font-display font-bold text-4xl text-white mt-4 leading-tight">
            Get Notified of
            <br />
            New Lectures
          </h1>
          <p className="text-white/60 text-base mt-5 leading-relaxed">
            New lectures and articles from trusted scholars, delivered to your
            inbox. No spam — unsubscribe anytime.
          </p>
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-700 to-transparent"
        />
      </div>

      <div className="container-site py-16 max-w-xl mx-auto">
        {/* Newsletter form card */}
        <div className="card p-8">
          {/* Reuse the same NewsletterForm from the footer but styled for light bg */}
          <NewsletterPageForm />
        </div>

        {/* What you get */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: "🎧",
              title: "New lectures",
              body: "Notified when a new lecture is published from any scholar.",
            },
            {
              icon: "📄",
              title: "New articles",
              body: "Articles and essays added to the platform.",
            },
            {
              icon: "📚",
              title: "New books",
              body: "Books added to the library for reading and download.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="card p-4 flex flex-col gap-1.5 items-center text-center"
            >
              <span className="text-2xl" role="img" aria-hidden="true">
                {item.icon}
              </span>
              <span className="font-semibold text-sm text-ink-primary">
                {item.title}
              </span>
              <span className="text-xs text-ink-muted leading-relaxed">
                {item.body}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-ink-muted mt-8">
          We respect your privacy. Read our{" "}
          <a href="/privacy" className="text-primary-700 hover:underline">
            Privacy Policy
          </a>
          . You can unsubscribe at any time from any email we send.
        </p>
      </div>
    </div>
  );
}

// Light-background version of the newsletter form
function NewsletterPageForm() {
  // We use the same API endpoint but with a light-mode styled form
  // This is a server component wrapper — the actual form is client-side
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center mb-2">
        <h2 className="font-display font-bold text-xl text-ink-primary">
          Subscribe to our newsletter
        </h2>
        <p className="text-ink-muted text-sm mt-1">
          Join thousands of Muslims receiving authentic knowledge.
        </p>
      </div>
      {/* Inline the form here — same component used in footer */}
      <NewsletterFormLight />
    </div>
  );
}

// Client component — light mode version
// src/features/newsletter/NewsletterFormLight.tsx
// We define it here inline for simplicity
import { NewsletterFormLight } from "@/features/newsletter/NewsletterFormLight";
