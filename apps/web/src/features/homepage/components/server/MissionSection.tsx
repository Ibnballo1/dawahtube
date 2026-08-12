// src/features/homepage/components/server/MissionSection.tsx
// No data fetch — pure UI. Renders instantly, no Suspense needed.

export function MissionSection() {
  return (
    <section
      className="section bg-surface-subtle border-y border-border-subtle"
      aria-labelledby="mission-heading"
    >
      <div className="container-site">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — mission statement */}
          <div className="flex flex-col gap-6">
            <span className="label-overline">Our mission</span>

            <h2
              id="mission-heading"
              className="font-display font-bold text-3xl text-ink-primary leading-tight tracking-snug"
            >
              Knowledge that guides to the straight path
            </h2>

            <span className="rule-gold" aria-hidden="true" />

            <p className="text-md text-ink-tertiary leading-loose">
              Da&apos;wahTube exists to make authentic Islamic knowledge
              accessible to every Muslim in Nigeria and beyond — knowledge
              verified upon the Qur&apos;an and authentic Sunnah, free from
              innovation and deviation.
            </p>

            <p className="text-md text-ink-tertiary leading-loose">
              Every lecture, article, and book on this platform comes from
              scholars who adhere to the methodology of the Salaf-us-Saalih. We
              do not publish opinions — we publish knowledge.
            </p>

            {/* Arabic mission statement */}
            <blockquote
              className="border-l-2 border-accent-700 pl-6 my-2"
              lang="ar"
              dir="rtl"
            >
              <p className="font-arabic text-arabic-lg text-primary-700 leading-loose">
                الْعِلْمُ نُورٌ وَالْجَهْلُ ظُلْمَةٌ
              </p>
              <footer
                className="text-sm text-ink-muted mt-2 not-italic"
                dir="ltr"
              >
                Knowledge is light, and ignorance is darkness.
              </footer>
            </blockquote>
          </div>

          {/* Right — pillars grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            role="list"
            aria-label="Platform pillars"
          >
            {PILLARS.map((pillar) => (
              <PillarCard key={pillar.title} {...pillar} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pillars data ──────────────────────────────────────────────────────────────

const PILLARS = [
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Authentic Sources",
    description:
      "Every piece of content is rooted in the Qur'an and authenticated Sunnah.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 1 0-16 0" />
      </svg>
    ),
    title: "Trusted Scholars",
    description:
      "Content comes from scholars known for knowledge, piety, and sound methodology.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Free from Deviation",
    description:
      "We do not platform innovators or those who call to other than the Sunnah.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10A15 15 0 0 1 8 12a15 15 0 0 1 4-10z" />
      </svg>
    ),
    title: "Accessible to All",
    description:
      "Free knowledge, no paywalls. Available to every Muslim regardless of location.",
  },
];

interface PillarCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function PillarCard({ icon, title, description }: PillarCardProps) {
  return (
    <div
      role="listitem"
      className="flex flex-col gap-3 p-5 rounded-xl bg-surface-card border border-border-default hover:border-primary-200 hover:shadow-primary-sm transition-all duration-normal group"
    >
      <span className="text-primary-700 group-hover:scale-110 transition-transform duration-normal w-fit">
        {icon}
      </span>
      <h3 className="font-display font-semibold text-lg text-ink-primary">
        {title}
      </h3>
      <p className="text-sm text-ink-tertiary leading-relaxed">{description}</p>
    </div>
  );
}
