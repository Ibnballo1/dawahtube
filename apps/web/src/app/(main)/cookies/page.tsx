// src/app/(main)/cookies/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Da'wahTube Cookie Policy — how we use cookies on our platform.",
};

const LAST_UPDATED = "1 January 2025";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-surface-base">
      <div className="bg-surface-subtle border-b border-border-default">
        <div className="container-site py-10 max-w-3xl">
          <span className="label-overline">Legal</span>
          <h1 className="font-display font-bold text-3xl text-ink-primary mt-3">
            Cookie Policy
          </h1>
          <p className="text-ink-muted text-sm mt-2">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </div>

      <div className="container-site py-12 max-w-3xl">
        <div className="prose-islamic space-y-10">
          <section>
            <h2>1. What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device when you visit
              a website. They allow the website to remember information about
              your visit — such as whether you are signed in — so you don&apos;t
              have to re-enter it each time.
            </p>
          </section>

          <section>
            <h2>2. Cookies We Use</h2>
            <p>
              Da&apos;wahTube uses a minimal number of cookies. We do not use
              advertising or tracking cookies.
            </p>

            {/* Cookie table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-subtle">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider border border-border-default">
                      Cookie
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider border border-border-default">
                      Purpose
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider border border-border-default">
                      Duration
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider border border-border-default">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "better-auth.session_token",
                      purpose:
                        "Keeps you signed in to your account. Without this cookie you would be logged out on every page.",
                      duration: "Session / 7 days",
                      type: "Essential",
                    },
                    {
                      name: "dw_sid",
                      purpose:
                        "Identifies your anonymous session so you can like content without signing in. No personal data is stored.",
                      duration: "1 year",
                      type: "Functional",
                    },
                  ].map((cookie) => (
                    <tr
                      key={cookie.name}
                      className="border border-border-default"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-primary-700 border border-border-default align-top">
                        {cookie.name}
                      </td>
                      <td className="px-4 py-3 text-ink-secondary border border-border-default align-top">
                        {cookie.purpose}
                      </td>
                      <td className="px-4 py-3 text-ink-tertiary border border-border-default align-top whitespace-nowrap">
                        {cookie.duration}
                      </td>
                      <td className="px-4 py-3 border border-border-default align-top">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            cookie.type === "Essential"
                              ? "bg-primary-50 text-primary-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {cookie.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>3. What We Do NOT Use</h2>
            <p>
              Da&apos;wahTube does <strong>not</strong> use:
            </p>
            <ul>
              <li>Advertising or remarketing cookies</li>
              <li>Third-party analytics cookies (e.g. Google Analytics)</li>
              <li>Social media tracking pixels</li>
              <li>Any cookies that track you across other websites</li>
            </ul>
          </section>

          <section>
            <h2>4. Essential Cookies</h2>
            <p>
              The session cookie is <strong>essential</strong> for the platform
              to function. It cannot be disabled without breaking the sign-in
              functionality. By using Da&apos;wahTube with an account, you agree
              to this cookie being set.
            </p>
            <p>
              If you use Da&apos;wahTube without creating an account, no session
              cookie is set. Only the anonymous session cookie (
              <code>dw_sid</code>) may be set if you interact with likeable
              content.
            </p>
          </section>

          <section>
            <h2>5. Managing Cookies</h2>
            <p>
              You can control cookies through your browser settings. Most
              browsers allow you to:
            </p>
            <ul>
              <li>See what cookies are set</li>
              <li>Delete all cookies or cookies from specific sites</li>
              <li>Block cookies from being set</li>
            </ul>
            <p>
              Note that blocking essential cookies will prevent you from signing
              in to Da&apos;wahTube. The rest of the platform (browsing,
              listening to lectures) works without cookies.
            </p>
            <p>
              Browser-specific instructions:{" "}
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chrome
              </a>
              ,{" "}
              <a
                href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox"
                target="_blank"
                rel="noopener noreferrer"
              >
                Firefox
              </a>
              ,{" "}
              <a
                href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
              >
                Safari
              </a>
              .
            </p>
          </section>

          <section>
            <h2>6. Changes to This Policy</h2>
            <p>
              We may update this cookie policy as our use of cookies changes.
              The &quot;Last updated&quot; date at the top reflects the most
              recent version.
            </p>
          </section>

          <section>
            <h2>7. Contact</h2>
            <p>
              Questions about cookies? Contact us at{" "}
              <a href="mailto:privacy@dawahtube.com">privacy@dawahtube.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
