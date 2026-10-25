// src/app/(main)/built-by/page.tsx
import Link             from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:       'Built by Abdullateef Bello',
  description: 'Da\'wahTube was designed and developed by Abdullateef Bello — a full-stack developer specialising in web and mobile applications.',
}

export default function BuiltByPage() {
  return (
    <div className="min-h-screen bg-surface-base">

      {/* Hero */}
      <div className="bg-primary-950 relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <p className="font-arabic text-[28vw] leading-none text-white/[0.025]" dir="rtl" lang="ar">
            بناء
          </p>
        </div>
        <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-700 to-transparent" />

        <div className="container-site relative z-10 py-20 max-w-3xl">
          {/* Avatar initials */}
          <div className="size-16 rounded-2xl bg-primary-700 flex items-center justify-center mb-6">
            <span className="font-display font-bold text-2xl text-white">AB</span>
          </div>

          <span className="label-overline text-accent-500">The Developer</span>
          <h1 className="font-display font-bold text-4xl text-white mt-4 leading-tight">
            Abdullateef Bello
          </h1>
          <p className="text-white/60 text-lg mt-4 leading-relaxed max-w-2xl">
            Full-stack developer specialising in web and mobile applications.
            Da&apos;wahTube is one of my projects — built to serve the Nigerian Muslim community
            with authentic Islamic knowledge.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/contact?subject=Project+Inquiry"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-700 text-primary-950 font-semibold text-sm hover:bg-accent-600 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Get in touch
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white/70 font-semibold text-sm hover:bg-white/10 hover:text-white transition-colors"
            >
              View Da&apos;wahTube
            </Link>
          </div>
        </div>

        <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-700 to-transparent" />
      </div>

      <div className="container-site py-16 max-w-3xl">

        {/* About Da'wahTube */}
        <section className="mb-14">
          <h2 className="font-display font-bold text-2xl text-ink-primary mb-5">
            About this project
          </h2>
          <div className="prose-islamic space-y-4">
            <p>
              Da&apos;wahTube is a full-stack Islamic knowledge platform built to make
              authentic lectures, articles, books, and daily reminders from trusted Nigerian
              scholars accessible to everyone — for free.
            </p>
            <p>
              The platform is designed for both web and mobile, with a dedicated mobile app
              for offline listening, bookmarks, and listening history. Everything is built with
              performance, accessibility, and long-term maintainability in mind.
            </p>
          </div>
        </section>

        {/* Tech stack */}
        <section className="mb-14">
          <h2 className="font-display font-bold text-2xl text-ink-primary mb-6">
            Built with
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STACK.map((item) => (
              <div
                key={item.name}
                className="card p-4 flex items-center gap-3"
              >
                <div className="size-8 rounded-lg bg-surface-subtle flex items-center justify-center shrink-0">
                  <span className="text-base" role="img" aria-hidden="true">{item.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-ink-primary leading-none">{item.name}</p>
                  <p className="text-xs text-ink-muted mt-0.5 truncate">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="mb-14">
          <h2 className="font-display font-bold text-2xl text-ink-primary mb-3">
            Need a web or mobile app?
          </h2>
          <p className="text-ink-tertiary leading-relaxed mb-6">
            I build web and mobile applications for startups, organisations, and individuals.
            If you have an idea and need a developer to bring it to life — I&apos;d love to hear from you.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {SERVICES.map((service) => (
              <div key={service.title} className="card p-5 flex flex-col gap-2">
                <span className="text-2xl" role="img" aria-hidden="true">{service.icon}</span>
                <h3 className="font-display font-semibold text-base text-ink-primary">
                  {service.title}
                </h3>
                <p className="text-sm text-ink-tertiary leading-relaxed">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="bg-primary-50 border border-primary-200 rounded-2xl p-8 text-center">
            <h3 className="font-display font-bold text-xl text-primary-900 mb-2">
              Let&apos;s build something together
            </h3>
            <p className="text-ink-tertiary text-sm mb-6 max-w-md mx-auto">
              Whether it&apos;s an Islamic platform, a business app, or something entirely new —
              reach out and let&apos;s talk about your project.
            </p>
            <Link
              href="/contact?subject=Project+Inquiry"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary-700 text-white font-semibold text-sm hover:bg-primary-800 transition-colors"
            >
              Start a conversation
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </section>

        {/* Back to Da'wahTube */}
        <div className="flex justify-center pt-4 border-t border-border-default">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink-primary transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            Back to Da&apos;wahTube
          </Link>
        </div>

      </div>
    </div>
  )
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const STACK = [
  { icon: '⚡', name: 'Next.js 15',     desc: 'App Router + RSC'      },
  { icon: '🎨', name: 'Tailwind CSS v4', desc: 'Design system'         },
  { icon: '🗄️', name: 'Supabase',        desc: 'PostgreSQL database'   },
  { icon: '🔷', name: 'TypeScript',      desc: 'Strict mode'           },
  { icon: '☁️', name: 'Cloudflare R2',   desc: 'Audio & file storage'  },
  { icon: '🔐', name: 'BetterAuth',      desc: 'Authentication'        },
  { icon: '📱', name: 'Expo',            desc: 'React Native mobile'   },
  { icon: '🚀', name: 'Vercel',          desc: 'Deployment'            },
]

const SERVICES = [
  {
    icon:  '🌐',
    title: 'Web Applications',
    desc:  'Full-stack web apps built with Next.js, React, TypeScript, and modern databases. Fast, accessible, and production-ready.',
  },
  {
    icon:  '📱',
    title: 'Mobile Applications',
    desc:  'Cross-platform iOS and Android apps built with Expo and React Native. From idea to app store.',
  },
]