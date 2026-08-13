/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#065F46",
        gold: "#D4AF37",
        background: "#0F172A",
        card: "#1E293B",
        text: "#F8FAFC",
        muted: "#94A3B8",
      },
    },
  },
  plugins: [],
};
