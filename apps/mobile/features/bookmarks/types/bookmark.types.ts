export interface LectureBookmark {
  lectureId: string;
  title: string;
  scholarName: string | null;
  artworkUrl: string | null;
  createdAt: string;
}

export interface TimestampBookmark {
  id: string;
  lectureId: string;
  lectureTitle: string;
  timestampSecs: number;
  note: string | null;
  createdAt: string;
}
