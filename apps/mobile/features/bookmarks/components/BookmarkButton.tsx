import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBookmarksStore } from "../store/bookmarksStore";
import type { LectureBookmark } from "../types/bookmark.types";

export function BookmarkButton({ bookmark }: { bookmark: LectureBookmark }) {
  const bookmarks = useBookmarksStore((s) => s.lectureBookmarks);
  const toggle = useBookmarksStore((s) => s.toggleLectureBookmark);
  const isBookmarked = Boolean(bookmarks[bookmark.lectureId]);

  return (
    <Pressable
      onPress={() => toggle(bookmark)}
      accessibilityRole="button"
      accessibilityLabel={
        isBookmarked ? "Remove bookmark" : "Bookmark this lecture"
      }
      hitSlop={10}
    >
      <Ionicons
        name={isBookmarked ? "bookmark" : "bookmark-outline"}
        size={22}
        color={isBookmarked ? "#D4AF37" : "#F8FAFC"}
      />
    </Pressable>
  );
}
