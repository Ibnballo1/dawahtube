export const lectureCardRelation = {
  columns: {
    id: true,
    slug: true,
    title: true,
    durationSecs: true,
    allowDownload: true,
    status: true,
    deletedAt: true,
  },
  with: {
    scholar: {
      columns: { id: true, slug: true, name: true, honorifics: true },
    },
    thumbnailAsset: { columns: { publicUrl: true } },
    audioAsset: { columns: { durationSecs: true } },
  },
} as const;

export type LectureRow = {
  id: string;
  slug: string;
  title: string;
  durationSecs: number | null;
  allowDownload: boolean;
  status: string;
  deletedAt: Date | null;
  scholar: {
    id: string;
    slug: string;
    name: string;
    honorifics: string | null;
  } | null;
  thumbnailAsset: { publicUrl: string | null } | null;
  audioAsset: { durationSecs: number | null } | null;
};

export function isAvailable(l: LectureRow | null): l is LectureRow {
  return !!l && l.status === "published" && l.deletedAt === null;
}

export function shapeLectureCard(l: LectureRow) {
  return {
    id: l.id,
    slug: l.slug,
    title: l.title,
    durationSecs: l.durationSecs ?? l.audioAsset?.durationSecs ?? null,
    allowDownload: l.allowDownload,
    thumbnail: l.thumbnailAsset?.publicUrl ?? null,
    scholar: l.scholar
      ? {
          id: l.scholar.id,
          slug: l.scholar.slug,
          displayName: [l.scholar.honorifics, l.scholar.name]
            .filter(Boolean)
            .join(" "),
        }
      : null,
  };
}
