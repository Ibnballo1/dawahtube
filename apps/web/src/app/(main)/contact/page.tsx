// src/app/(main)/contact/page.tsx
import type { Metadata } from "next";
import { ContactForm } from "@/features/contact/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Da'wahTube team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface-base">
      <div className="bg-surface-subtle border-b border-border-default">
        <div className="container-site py-10 max-w-2xl">
          <span className="label-overline">Get in touch</span>
          <h1 className="font-display font-bold text-3xl text-ink-primary mt-3">
            Contact Us
          </h1>
          <p className="text-ink-muted mt-3 leading-relaxed">
            Whether you have a question, want to suggest a scholar, report an
            issue, or simply say salaam — we&apos;d love to hear from you.
          </p>
        </div>
      </div>

      <div className="container-site py-12 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          {[
            { icon: "📧", title: "Email", body: "info@dawahtube.com" },
            { icon: "📱", title: "WhatsApp", body: "Message us on WhatsApp" },
            { icon: "🕐", title: "Response", body: "Within 2–3 business days" },
          ].map((item) => (
            <div key={item.title} className="flex flex-col gap-1 text-center">
              <span className="text-2xl" role="img" aria-hidden="true">
                {item.icon}
              </span>
              <span className="font-semibold text-sm text-ink-primary">
                {item.title}
              </span>
              <span className="text-xs text-ink-muted">{item.body}</span>
            </div>
          ))}
        </div>

        <div className="card p-6 sm:p-8">
          <h2 className="font-display font-semibold text-xl text-ink-primary mb-6">
            Send us a message
          </h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
