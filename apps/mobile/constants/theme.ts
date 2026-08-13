export const colors = {
  primary: "#065F46",
  gold: "#D4AF37",
  background: "#0F172A",
  card: "#1E293B",
  text: "#F8FAFC",
  muted: "#94A3B8",
} as const;

export type ThemeColor = keyof typeof colors;
