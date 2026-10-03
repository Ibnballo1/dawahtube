// src/app/(main)/privacy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Da'wahTube Privacy Policy — how we collect, use and protect your data.",
};

const LAST_UPDATED = "1 January 2025";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface-base">
      <div className="bg-surface-subtle border-b border-border-default">
        <div className="container-site py-10 max-w-3xl">
          <span className="label-overline">Legal</span>
          <h1 className="font-display font-bold text-3xl text-ink-primary mt-3">
            Privacy Policy
          </h1>
          <p className="text-ink-muted text-sm mt-2">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </div>

      <div className="container-site py-12 max-w-3xl">
        <div className="prose-islamic space-y-10">
          <section>
            <h2>1. Who We Are</h2>
            <p>
              Da&apos;wahTube (&quot;we&quot;, &quot;our&quot;, or
              &quot;us&quot;) is an Islamic knowledge platform based in Nigeria,
              dedicated to sharing authentic Islamic content from trusted
              scholars. Our website is located at <strong>dawahtube.com</strong>
              .
            </p>
            <p>
              If you have any questions about this policy, contact us at{" "}
              <a href="mailto:privacy@dawahtube.com">privacy@dawahtube.com</a>.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <h3>Information you provide directly</h3>
            <ul>
              <li>
                <strong>Account information:</strong> name and email address
                when you create an account.
              </li>
              <li>
                <strong>Contact messages:</strong> name, email, and message
                content when you use our contact form.
              </li>
              <li>
                <strong>Newsletter subscription:</strong> email address and
                optional name when you subscribe.
              </li>
            </ul>
            <h3>Information collected automatically</h3>
            <ul>
              <li>
                <strong>Usage data:</strong> pages visited, lectures played, and
                content interacted with.
              </li>
              <li>
                <strong>Device information:</strong> browser type, operating
                system, and IP address.
              </li>
              <li>
                <strong>Cookies:</strong> session cookies for authentication and
                a preference cookie for anonymous likes.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Provide and operate the Da&apos;wahTube platform</li>
              <li>Send you newsletters you have subscribed to</li>
              <li>Respond to your contact messages</li>
              <li>Understand how the platform is used and improve it</li>
              <li>Prevent abuse and ensure security</li>
            </ul>
            <p>
              We do <strong>not</strong> sell your personal information to third
              parties. We do <strong>not</strong> use your data for advertising
              purposes.
            </p>
          </section>

          <section>
            <h2>4. Cookies</h2>
            <p>We use the following cookies:</p>
            <ul>
              <li>
                <strong>Session cookie:</strong> keeps you signed in to your
                account. Essential — cannot be disabled.
              </li>
              <li>
                <strong>Anonymous session cookie (dw_sid):</strong> allows
                anonymous users to like content. Persists for 1 year.
              </li>
            </ul>
            <p>
              We do not use tracking cookies, advertising cookies, or
              third-party analytics cookies.
            </p>
          </section>

          <section>
            <h2>5. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li>
                <strong>Supabase:</strong> database hosting (EU/US servers).{" "}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Cloudflare R2:</strong> audio and file storage.{" "}
                <a
                  href="https://www.cloudflare.com/privacypolicy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Resend:</strong> email delivery for newsletters and
                notifications.{" "}
                <a
                  href="https://resend.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Vercel:</strong> website hosting.{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy policy
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2>6. Data Retention</h2>
            <ul>
              <li>
                <strong>Account data:</strong> retained while your account is
                active. Deleted within 30 days of account deletion.
              </li>
              <li>
                <strong>Newsletter subscriptions:</strong> retained until you
                unsubscribe.
              </li>
              <li>
                <strong>Contact messages:</strong> retained for up to 12 months.
              </li>
              <li>
                <strong>Usage logs:</strong> retained for up to 90 days.
              </li>
            </ul>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Unsubscribe from newsletters at any time</li>
              <li>Object to certain processing of your data</li>
            </ul>
            <p>
              To exercise any of these rights, email us at{" "}
              <a href="mailto:privacy@dawahtube.com">privacy@dawahtube.com</a>.
            </p>
          </section>

          <section>
            <h2>8. Security</h2>
            <p>
              We take reasonable measures to protect your personal data,
              including HTTPS encryption, hashed passwords, and access controls.
              However, no system is perfectly secure and we cannot guarantee
              absolute security.
            </p>
          </section>

          <section>
            <h2>9. Children</h2>
            <p>
              Da&apos;wahTube is not directed at children under 13. We do not
              knowingly collect personal data from children under 13. If you
              believe we have collected such data, please contact us
              immediately.
            </p>
          </section>

          <section>
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify
              registered users of significant changes by email. The &quot;Last
              updated&quot; date at the top of this page will always reflect the
              most recent version.
            </p>
          </section>

          <section>
            <h2>11. Contact</h2>
            <p>
              Questions about this policy? Contact us at{" "}
              <a href="mailto:privacy@dawahtube.com">privacy@dawahtube.com</a>{" "}
              or use our <a href="/contact">contact form</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
