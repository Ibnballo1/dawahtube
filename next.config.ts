// next.config.ts
import type { NextConfig } from "next";
import * as dotenv from "dotenv";

dotenv.config();

const config: NextConfig = {
  // ── Compiler options ───────────────────────────────────────────────────────
  reactStrictMode: true,
  poweredByHeader: false, // Don't advertise Next.js version

  // ── Image optimisation ─────────────────────────────────────────────────────
  // All media flows through R2. The public CDN domain must be listed here
  // for next/image to work. Update R2_PUBLIC_URL in .env.local.
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000", // Allow local Next.js server
      },
      {
        // Cloudflare R2 public CDN (custom domain)
        // e.g. https://media.dawahtube.com
        protocol: "https",
        hostname: process.env.R2_PUBLIC_URL
          ? new URL(process.env.R2_PUBLIC_URL).hostname
          : "media.dawahtube.com",
        pathname: "/**",
      },
      {
        // R2 default domain (dev / before custom domain is set up)
        // e.g. pub-xxxx.r2.dev
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
    ],
    // Use webp by default, avif when supported
    formats: ["image/avif", "image/webp"],
    // Aggressively cache optimised images (1 week)
    minimumCacheTTL: 604800,
    // Sizes that match our responsive image usage
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // ── MDX support ────────────────────────────────────────────────────────────
  // next-mdx-remote handles MDX rendering at runtime (stored in DB).
  // This config block is for any static .mdx files (docs, etc.)
  // The main article/reminder MDX path uses compileMDX() from next-mdx-remote/rsc.
  pageExtensions: ["ts", "tsx", "mdx"],

  // ── Experimental features ──────────────────────────────────────────────────
  experimental: {
    // PPR: Partial Pre-rendering — static shell + dynamic islands
    // Enable when stable in your Next.js version
    // ppr: true,

    // Optimise Server Actions bundle size
    serverActions: {
      bodySizeLimit: "10mb", // Allow PDF metadata uploads
    },
  },

  // ── Security headers ───────────────────────────────────────────────────────
  // Applied to all routes. Adjust CSP as third-party embeds are added.
  async headers() {
    const isDev = process.env.NODE_ENV === "development";

    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Referrer policy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions policy — disable unused browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // HSTS — only in production
          ...(!isDev
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains",
                },
              ]
            : []),
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self + inline (for Next.js hydration) + Vercel analytics
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
              // Styles: self + inline (for Tailwind)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Images: self + R2 CDN + data URIs (for Next.js image optimisation)
              `img-src 'self' data: blob: ${process.env.R2_PUBLIC_URL ?? "https://media.dawahtube.com"} https://*.r2.dev`,
              // Media: R2 only
              `media-src 'self' ${process.env.R2_PUBLIC_URL ?? "https://media.dawahtube.com"} https://*.r2.dev`,
              // API connections: self + R2 for direct uploads
              `connect-src 'self' https://*.r2.cloudflarestorage.com ${process.env.R2_PUBLIC_URL ?? "https://media.dawahtube.com"}`,
              // Frames: none
              "frame-src 'none'",
              // Objects: none
              "object-src 'none'",
              // Base URI: self only
              "base-uri 'self'",
              // Form action: self only
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // ── Redirects ──────────────────────────────────────────────────────────────
  // Canonical slug redirects are handled in middleware, not here.
  // These are permanent structural redirects only.
  async redirects() {
    return [
      // Legacy URL compatibility (if migrating from another platform)
      // { source: '/video/:slug', destination: '/lectures/:slug', permanent: true },
    ];
  },

  // ── Webpack customisation ──────────────────────────────────────────────────
  webpack(webpackConfig) {
    // Required for some Node.js modules used in server-side code
    webpackConfig.resolve.fallback = {
      ...webpackConfig.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return webpackConfig;
  },
};

export default config;
