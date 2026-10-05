// Default/placeholder images already hosted by the web app's Next.js public
// folder — reused here rather than duplicating files into the mobile repo.
// IMPORTANT: confirm these exact paths match what's actually in apps/web/public/images/
const API_ORIGIN = process.env.EXPO_PUBLIC_API_URL!.replace(
  /\/api\/v1\/?$/,
  "",
);

export const DEFAULT_IMAGES = {
  lecture: `${API_ORIGIN}/images/lecture-default.png`,
  scholar: `${API_ORIGIN}/images/scholar-banner-default.png`,
  series: `${API_ORIGIN}/images/series-default.png`,
} as const;
