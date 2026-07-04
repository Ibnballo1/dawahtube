import type { Config } from "tailwindcss";
import fontFamily from "tailwindcss/defaultTheme";

const config: Config = {
  // Tailwind v4 scans these files for class usage
  content: [
    "./src/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/shared/**/*.{ts,tsx}",
  ],

  // Dark mode via data attribute (not 'class') — avoids flash on SSR
  darkMode: ["selector", '[data-theme="dark"]'],

  theme: {
    extend: {
      // ── Fonts ─────────────────────────────────────────────────────────
      fontFamily: {
        display: ["var(--font-display)", ...fontFamily.fontFamily.sans],
        body: ["var(--font-body)", ...fontFamily.fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.fontFamily.mono],
        arabic: ["var(--font-arabic)", "Traditional Arabic", "serif"],
      },

      // ── Colours (all reference CSS vars — dark mode works automatically) ─
      colors: {
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
          950: "var(--color-primary-950)",
        },
        secondary: {
          400: "var(--color-secondary-400)",
          500: "var(--color-secondary-500)",
          600: "var(--color-secondary-600)",
          700: "var(--color-secondary-700)",
          800: "var(--color-secondary-800)",
        },
        accent: {
          200: "var(--color-accent-200)",
          300: "var(--color-accent-300)",
          400: "var(--color-accent-400)",
          500: "var(--color-accent-500)",
          600: "var(--color-accent-600)",
          700: "var(--color-accent-700)",
          800: "var(--color-accent-800)",
          900: "var(--color-accent-900)",
        },
        // Semantic
        surface: {
          base: "var(--color-bg-base)",
          subtle: "var(--color-bg-subtle)",
          muted: "var(--color-bg-muted)",
          emphasis: "var(--color-bg-emphasis)",
          card: "var(--color-bg-card)",
        },
        border: {
          subtle: "var(--color-border-subtle)",
          default: "var(--color-border-default)",
          emphasis: "var(--color-border-emphasis)",
          strong: "var(--color-border-strong)",
        },
        ink: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          muted: "var(--color-text-muted)",
          inverse: "var(--color-text-inverse)",
          accent: "var(--color-text-accent)",
          gold: "var(--color-text-gold)",
        },
        status: {
          success: "var(--color-success)",
          warning: "var(--color-warning)",
          error: "var(--color-error)",
          info: "var(--color-info)",
        },
      },

      // ── Type scale ────────────────────────────────────────────────────
      fontSize: {
        xs: ["var(--text-xs)", { lineHeight: "var(--leading-normal)" }],
        sm: ["var(--text-sm)", { lineHeight: "var(--leading-normal)" }],
        base: ["var(--text-base)", { lineHeight: "var(--leading-relaxed)" }],
        md: ["var(--text-md)", { lineHeight: "var(--leading-relaxed)" }],
        lg: ["var(--text-lg)", { lineHeight: "var(--leading-snug)" }],
        xl: ["var(--text-xl)", { lineHeight: "var(--leading-snug)" }],
        "2xl": ["var(--text-2xl)", { lineHeight: "var(--leading-tight)" }],
        "3xl": ["var(--text-3xl)", { lineHeight: "var(--leading-tight)" }],
        "4xl": ["var(--text-4xl)", { lineHeight: "var(--leading-none)" }],
        "5xl": ["var(--text-5xl)", { lineHeight: "var(--leading-none)" }],
        // Arabic sizes
        "arabic-sm": [
          "var(--text-arabic-sm)",
          { lineHeight: "var(--leading-arabic)" },
        ],
        "arabic-base": [
          "var(--text-arabic-base)",
          { lineHeight: "var(--leading-arabic)" },
        ],
        "arabic-lg": [
          "var(--text-arabic-lg)",
          { lineHeight: "var(--leading-arabic)" },
        ],
        "arabic-xl": [
          "var(--text-arabic-xl)",
          { lineHeight: "var(--leading-arabic)" },
        ],
        "arabic-2xl": [
          "var(--text-arabic-2xl)",
          { lineHeight: "var(--leading-arabic)" },
        ],
      },

      // ── Spacing ───────────────────────────────────────────────────────
      spacing: {
        px: "var(--space-px)",
        "1": "var(--space-1)",
        "2": "var(--space-2)",
        "3": "var(--space-3)",
        "4": "var(--space-4)",
        "5": "var(--space-5)",
        "6": "var(--space-6)",
        "7": "var(--space-7)",
        "8": "var(--space-8)",
        "10": "var(--space-10)",
        "12": "var(--space-12)",
        "14": "var(--space-14)",
        "16": "var(--space-16)",
        "20": "var(--space-20)",
        "24": "var(--space-24)",
        "28": "var(--space-28)",
        "32": "var(--space-32)",
        "40": "var(--space-40)",
        "48": "var(--space-48)",
        "64": "var(--space-64)",
        // Named component heights
        nav: "var(--nav-height)",
        "btn-sm": "var(--btn-height-sm)",
        "btn-md": "var(--btn-height-md)",
        "btn-lg": "var(--btn-height-lg)",
        input: "var(--input-height)",
        player: "var(--player-height)",
      },

      // ── Border radius ─────────────────────────────────────────────────
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        full: "var(--radius-full)",
      },

      // ── Shadows ───────────────────────────────────────────────────────
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        inner: "var(--shadow-inner)",
        "primary-sm": "var(--shadow-primary-sm)",
        "primary-lg": "var(--shadow-primary-lg)",
        "gold-sm": "var(--shadow-gold-sm)",
        none: "none",
      },

      // ── Transitions ───────────────────────────────────────────────────
      transitionDuration: {
        instant: "var(--duration-instant)",
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
        slower: "var(--duration-slower)",
        slowest: "var(--duration-slowest)",
      },

      transitionTimingFunction: {
        default: "var(--ease-default)",
        in: "var(--ease-in)",
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
        spring: "var(--ease-spring)",
        smooth: "var(--ease-smooth)",
      },

      // ── Z-index ───────────────────────────────────────────────────────
      zIndex: {
        below: "var(--z-below)",
        base: "var(--z-base)",
        raised: "var(--z-raised)",
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
        tooltip: "var(--z-tooltip)",
      },

      // ── Max widths ────────────────────────────────────────────────────
      maxWidth: {
        prose: "var(--prose-width)",
        content: "var(--content-width)",
        sm: "var(--container-sm)",
        md: "var(--container-md)",
        lg: "var(--container-lg)",
        xl: "var(--container-xl)",
        "2xl": "var(--container-2xl)",
      },

      // ── Keyframe animations ───────────────────────────────────────────
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        waveform: {
          "0%, 100%": { height: "4px", opacity: "0.5" },
          "50%": { height: "20px", opacity: "1" },
        },
      },

      animation: {
        "fade-in-up": "fade-in-up var(--duration-slow) var(--ease-out) both",
        "fade-in": "fade-in var(--duration-normal) var(--ease-out) both",
        shimmer: "shimmer 1.5s infinite",
        waveform: "waveform 1.2s ease-in-out infinite",
      },
    },
  },

  plugins: [],
};

export default config;
