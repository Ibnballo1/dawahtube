// src/features/lectures/types/series.types.ts
export interface SeriesWithItems {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  scholarId: string | null;
  coverAssetId: string | null;
  status: "draft" | "review" | "scheduled" | "published" | "archived";
  itemCount: number;
  items: Array<{
    id: string;
    position: number;
    lecture: {
      id: string;
      slug: string;
      title: string;
      durationSecs: number | null;
    };
  }>;
}
