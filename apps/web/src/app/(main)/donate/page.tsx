// src/app/(main)/donate/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support Da'wahTube",
  description:
    "Support Da'wahTube and help us continue spreading authentic Islamic knowledge.",
};

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-surface-base">
      {/* Hero */}
      <div className="bg-primary-950 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-700 to-transparent"
        />
        <div className="container-site relative z-10 py-20 max-w-3xl text-center mx-auto">
          <span className="label-overline text-accent-500">
            Support the Da&apos;wah
          </span>
          <h1 className="font-display font-bold text-4xl text-white mt-4 leading-tight">
            Help Us Spread
            <br />
            Authentic Knowledge
          </h1>
          <p className="text-white/60 text-lg mt-6 leading-relaxed max-w-2xl mx-auto">
            Da&apos;wahTube is free for everyone. Your support helps us maintain
            the platform, cover hosting costs, and expand our content library.
          </p>
          <div className="mt-4">
            <p
              className="font-arabic text-xl text-accent-400"
              dir="rtl"
              lang="ar"
            >
              مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ
            </p>
            <p className="text-white/40 text-xs mt-2 italic">
              &ldquo;Whoever guides to good will have a reward similar to that
              of its doer.&rdquo; — Muslim
            </p>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-700 to-transparent"
        />
      </div>

      <div className="container-site py-16 max-w-3xl">
        {/* What your support does */}
        <section className="mb-14">
          <h2 className="font-display font-bold text-2xl text-ink-primary mb-6 text-center">
            What your support does
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: "🖥️",
                title: "Hosting & Storage",
                body: "Keeps the platform running and audio files available 24/7.",
              },
              {
                icon: "📱",
                title: "Mobile App",
                body: "Helps us build and maintain the Da'wahTube mobile app.",
              },
              {
                icon: "🎙️",
                title: "Content Production",
                body: "Supports recording, editing, and uploading new lectures.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="card p-5 text-center flex flex-col gap-2 items-center"
              >
                <span className="text-3xl" role="img" aria-hidden="true">
                  {item.icon}
                </span>
                <h3 className="font-display font-semibold text-sm text-ink-primary">
                  {item.title}
                </h3>
                <p className="text-xs text-ink-tertiary leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Donation options */}
        <section className="mb-14">
          <h2 className="font-display font-bold text-2xl text-ink-primary mb-6 text-center">
            How to donate
          </h2>
          <div className="flex flex-col gap-4">
            {/* Bank Transfer */}
            <div className="card p-6">
              <h3 className="font-display font-semibold text-base text-ink-primary mb-4 flex items-center gap-2">
                <span role="img" aria-hidden="true">
                  🏦
                </span>{" "}
                Bank Transfer (Nigeria)
              </h3>
              <div className="bg-surface-subtle rounded-xl p-4 space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Bank</span>
                  <span className="text-ink-primary font-semibold">
                    First Bank Nigeria
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Account Name</span>
                  <span className="text-ink-primary font-semibold">
                    Da&apos;wahTube
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Account Number</span>
                  <span className="text-ink-primary font-semibold">
                    0000000000
                  </span>
                </div>
              </div>
              <p className="text-xs text-ink-muted mt-3">
                Please send your name and email to{" "}
                <a
                  href="mailto:donate@dawahtube.com"
                  className="text-primary-700 hover:underline"
                >
                  donate@dawahtube.com
                </a>{" "}
                after transferring so we can acknowledge your support.
              </p>
            </div>

            {/* Contact for other methods */}
            <div className="card p-6 bg-primary-50 border-primary-200">
              <h3 className="font-display font-semibold text-base text-primary-800 mb-2">
                Other payment methods
              </h3>
              <p className="text-sm text-ink-tertiary mb-4">
                We are working on adding online payment options. In the
                meantime, contact us for PayPal, Western Union, or other
                arrangements.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center text-sm text-primary-700 hover:text-primary-800 font-medium transition-colors gap-1"
              >
                Contact us about donating →
              </Link>
            </div>
          </div>
        </section>

        {/* Jazakallah */}
        <section className="text-center py-8 border-t border-border-default">
          <p
            className="font-arabic text-3xl text-primary-700 mb-3"
            dir="rtl"
            lang="ar"
          >
            جَزَاكَ اللَّهُ خَيْرًا
          </p>
          <p className="text-ink-muted text-sm">
            May Allah reward you with good in this life and the next.
          </p>
        </section>
      </div>
    </div>
  );
}
