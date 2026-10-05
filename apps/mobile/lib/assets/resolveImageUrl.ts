const API_ORIGIN = process.env.EXPO_PUBLIC_API_URL!.replace(
  /\/api\/v1\/?$/,
  "",
);

/** Handles three cases uniformly: missing, already-absolute, and
 * relative-to-the-web-origin (a recurring pattern on this backend). */
export function resolveImageUrl(
  url: string | null | undefined,
  fallback: string,
): string {
  if (!url) return fallback;
  if (/^https?:\/\//.test(url)) return url;
  if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
  return fallback;
}
