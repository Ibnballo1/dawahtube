// src/app/(main)/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Da'wahTube is a platform dedicated to authentic Islamic knowledge upon the Qur'an and Sunnah from trusted Nigerian scholars.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface-base">
      {/* Hero */}
      <div className="bg-primary-950 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <p
            className="font-arabic text-[30vw] leading-none text-white/[0.03]"
            dir="rtl"
            lang="ar"
          >
            بِسْمِ
          </p>
        </div>
        <div
          aria-hidden="true"
          className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-700 to-transparent"
        />
        <div className="container-site relative z-10 py-20 max-w-3xl">
          <span className="label-overline text-accent-500">
            About Da&apos;wahTube
          </span>
          <h1 className="font-display font-bold text-4xl text-white mt-4 leading-tight">
            Authentic Islamic Knowledge
            <br />
            for the Nigerian Muslim
          </h1>
          <p className="text-white/60 text-lg mt-6 leading-relaxed max-w-2xl">
            A platform dedicated to preserving and sharing the lectures,
            articles, and books of trusted Nigerian scholars upon the
            Qur&apos;an and Sunnah according to the understanding of the
            Salaf-us-Saalih.
          </p>
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-700 to-transparent"
        />
      </div>

      <div className="container-site py-16 max-w-3xl">
        {/* Mission */}
        <section className="mb-14">
          <h2 className="font-display font-bold text-2xl text-ink-primary mb-5">
            Our Mission
          </h2>
          <div className="prose-islamic space-y-4">
            <p>
              Da&apos;wahTube was founded with a simple purpose — to make
              authentic Islamic knowledge accessible to every Nigerian Muslim,
              wherever they are. We believe that the spread of sound knowledge
              upon the Qur&apos;an and Sunnah is among the most important acts
              of worship in our time.
            </p>
            <p>
              We partner with trusted Nigerian scholars who teach upon the
              methodology of the Salaf-us-Saalih — the pious predecessors — to
              bring you lectures, articles, and books that are grounded in
              authentic Islamic scholarship.
            </p>
            <p>
              All content on Da&apos;wahTube is free to access. We believe that
              knowledge should never be behind a paywall.
            </p>
          </div>
        </section>

        {/* What we offer */}
        <section className="mb-14">
          <h2 className="font-display font-bold text-2xl text-ink-primary mb-6">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: "🎧",
                title: "Lectures",
                desc: "Audio lectures from trusted Nigerian scholars on Aqeedah, Fiqh, Tafseer, and more.",
              },
              {
                icon: "📄",
                title: "Articles",
                desc: "Written articles and essays on Islamic topics, accessible in any format.",
              },
              {
                icon: "📚",
                title: "Library",
                desc: "Islamic books available to read and download for free.",
              },
              {
                icon: "🔔",
                title: "Reminders",
                desc: "Daily reminders from the Qur'an and Sunnah to benefit the heart.",
              },
            ].map((item) => (
              <div key={item.title} className="card p-5 flex flex-col gap-2">
                <span className="text-2xl" role="img" aria-hidden="true">
                  {item.icon}
                </span>
                <h3 className="font-display font-semibold text-base text-ink-primary">
                  {item.title}
                </h3>
                <p className="text-sm text-ink-tertiary leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mb-14">
          <h2 className="font-display font-bold text-2xl text-ink-primary mb-5">
            Our Principles
          </h2>
          <div className="space-y-4">
            {[
              {
                title: "Authenticity",
                body: "We only publish content from scholars who teach upon authentic Islamic sources — the Qur'an, the Sunnah, and the understanding of the Salaf.",
              },
              {
                title: "Accessibility",
                body: "All content is free. We will never charge for access to Islamic knowledge.",
              },
              {
                title: "Trustworthiness",
                body: "Every scholar on our platform is verified and known for their sound knowledge and good character.",
              },
              {
                title: "Transparency",
                body: "We are clear about who we are, what we publish, and why.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div
                  className="w-1.5 rounded-full bg-primary-700 shrink-0 my-1"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-semibold text-ink-primary mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-ink-tertiary leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary-50 border border-primary-200 rounded-2xl p-8 text-center">
          <h2 className="font-display font-bold text-xl text-primary-900 mb-3">
            Have a question or suggestion?
          </h2>
          <p className="text-ink-tertiary text-sm mb-6">
            We&apos;d love to hear from you — whether you&apos;re a scholar,
            student, or visitor.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-700 text-white font-semibold text-sm hover:bg-primary-800 transition-colors"
          >
            Contact us
          </Link>
        </section>
      </div>
    </div>
  );
}
