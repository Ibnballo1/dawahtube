// src/app/(main)/terms/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Da'wahTube Terms of Use — your agreement when using our platform.",
};

const LAST_UPDATED = "1 January 2025";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-base">
      <div className="bg-surface-subtle border-b border-border-default">
        <div className="container-site py-10 max-w-3xl">
          <span className="label-overline">Legal</span>
          <h1 className="font-display font-bold text-3xl text-ink-primary mt-3">
            Terms of Use
          </h1>
          <p className="text-ink-muted text-sm mt-2">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </div>

      <div className="container-site py-12 max-w-3xl">
        <div className="prose-islamic space-y-10">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Da&apos;wahTube (&quot;the platform&quot;),
              you agree to be bound by these Terms of Use. If you do not agree,
              please do not use the platform.
            </p>
          </section>

          <section>
            <h2>2. Use of the Platform</h2>
            <p>You may use Da&apos;wahTube to:</p>
            <ul>
              <li>
                Listen to and download lectures for personal, non-commercial use
              </li>
              <li>Read and download articles and books for personal use</li>
              <li>
                Create an account to save preferences and interact with content
              </li>
              <li>Share links to content on Da&apos;wahTube</li>
            </ul>
            <p>
              You may <strong>not</strong>:
            </p>
            <ul>
              <li>
                Reproduce, redistribute, or sell content without explicit
                written permission
              </li>
              <li>
                Use the platform for commercial purposes without permission
              </li>
              <li>
                Upload, post, or transmit content that is harmful, abusive, or
                unlawful
              </li>
              <li>
                Attempt to gain unauthorised access to any part of the platform
              </li>
              <li>Use automated tools to scrape or bulk-download content</li>
            </ul>
          </section>

          <section>
            <h2>3. Intellectual Property</h2>
            <p>
              All content on Da&apos;wahTube — including lectures, articles,
              books, and platform design — is owned by Da&apos;wahTube or its
              content partners and is protected by copyright law.
            </p>
            <p>
              Lectures and content by scholars remain the intellectual property
              of those scholars. Da&apos;wahTube hosts this content with
              permission.
            </p>
            <p>
              Content marked as freely downloadable may be shared for
              non-commercial da&apos;wah purposes provided full attribution is
              given and the content is not altered.
            </p>
          </section>

          <section>
            <h2>4. User Accounts</h2>
            <p>
              When you create an account, you are responsible for maintaining
              the security of your password and for all activities that occur
              under your account. You must provide accurate information and keep
              it up to date.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that violate
              these terms.
            </p>
          </section>

          <section>
            <h2>5. Content Accuracy</h2>
            <p>
              Da&apos;wahTube strives to publish only authentic Islamic content
              from trusted scholars. However, we do not guarantee the accuracy,
              completeness, or suitability of any content for your particular
              circumstances.
            </p>
            <p>
              Content on this platform does not constitute a fatwa or formal
              religious ruling. For specific religious questions, consult a
              qualified Islamic scholar.
            </p>
          </section>

          <section>
            <h2>6. Disclaimer of Warranties</h2>
            <p>
              Da&apos;wahTube is provided &quot;as is&quot; without warranties
              of any kind, express or implied. We do not warrant that the
              platform will be uninterrupted, error-free, or free of viruses.
            </p>
          </section>

          <section>
            <h2>7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Da&apos;wahTube shall not
              be liable for any indirect, incidental, or consequential damages
              arising from your use of the platform.
            </p>
          </section>

          <section>
            <h2>8. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the
              platform after changes are posted constitutes acceptance of the
              revised terms.
            </p>
          </section>

          <section>
            <h2>9. Governing Law</h2>
            <p>
              These terms are governed by the laws of the Federal Republic of
              Nigeria.
            </p>
          </section>

          <section>
            <h2>10. Contact</h2>
            <p>
              Questions about these terms? Contact us at{" "}
              <a href="mailto:legal@dawahtube.com">legal@dawahtube.com</a> or
              use our <a href="/contact">contact form</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
