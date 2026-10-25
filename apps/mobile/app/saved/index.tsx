import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useBookmarksStore } from "@/features/bookmarks/store/bookmarksStore";
import { BookmarkButton } from "@/features/bookmarks/components/BookmarkButton";
import { useSession } from "@/features/auth/hooks/useSession";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { DEFAULT_IMAGES } from "@/lib/assets/defaultImages";
import { formatTime } from "@/lib/format/time";

type Tab = "lectures" | "notes";

export default function SavedScreen() {
  const [tab, setTab] = useState<Tab>("lectures");
  const { data: session } = useSession();
  const lectureBookmarks = useBookmarksStore((s) => s.lectureBookmarks);
  const timestampBookmarks = useBookmarksStore((s) => s.timestampBookmarks);
  const removeTimestampBookmark = useBookmarksStore(
    (s) => s.removeTimestampBookmark,
  );

  const lectures = Object.values(lectureBookmarks).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const notes = Object.values(timestampBookmarks).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const tabButton = (value: Tab, label: string, count: number) => (
    <Pressable
      onPress={() => setTab(value)}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${count}`}
      accessibilityState={{ selected: tab === value }}
      className={`px-4 py-2 rounded-full mr-2 ${tab === value ? "bg-gold" : "bg-card"}`}
    >
      <Text
        className={tab === value ? "text-background font-medium" : "text-muted"}
      >
        {label} ({count})
      </Text>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-background pt-4">
      <Text
        className="text-text text-xl font-semibold px-4 mb-1"
        accessibilityRole="header"
      >
        Saved
      </Text>
      {!session && (
        <Text className="text-muted text-xs px-4 mb-3">
          Saved on this device. Sign in to keep them across devices.
        </Text>
      )}

      <View className="flex-row px-4 mb-3 mt-2">
        {tabButton("lectures", "Lectures", lectures.length)}
        {tabButton("notes", "Notes", notes.length)}
      </View>

      {tab === "lectures" ? (
        <FlashList
          data={lectures}
          //   estimatedItemSize={80}
          keyExtractor={(item) => item.lectureId}
          ListEmptyComponent={
            <EmptyState message="No saved lectures yet. Tap the bookmark icon on any lecture to save it." />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/lecture/${item.lectureId}`)}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}${item.scholarName ? `, by ${item.scholarName}` : ""}`}
              className="flex-row items-center bg-card rounded-xl p-3 mb-3 mx-4"
            >
              <ArtworkImage
                source={item.artworkUrl}
                fallback={DEFAULT_IMAGES.lecture}
                style={{ width: 56, height: 56, borderRadius: 8 }}
              />
              <View className="flex-1 ml-3">
                <Text className="text-text" numberOfLines={2}>
                  {item.title}
                </Text>
                {item.scholarName && (
                  <Text className="text-muted text-xs mt-1" numberOfLines={1}>
                    {item.scholarName}
                  </Text>
                )}
              </View>
              <BookmarkButton bookmark={item} />
            </Pressable>
          )}
        />
      ) : (
        <FlashList
          data={notes}
          //   estimatedItemSize={88}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <EmptyState message="No notes yet. Use the bookmark button in the full player to save a moment with a note." />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/lecture/${item.lectureId}`)}
              accessibilityRole="button"
              accessibilityLabel={`${item.lectureTitle} at ${formatTime(item.timestampSecs)}`}
              className="flex-row items-center bg-card rounded-xl p-3 mb-3 mx-4"
            >
              <View className="flex-1">
                <Text className="text-text" numberOfLines={1}>
                  {item.lectureTitle}
                </Text>
                <Text className="text-gold text-xs mt-1">
                  {formatTime(item.timestampSecs)}
                </Text>
                {item.note && (
                  <Text className="text-muted text-sm mt-1" numberOfLines={3}>
                    {item.note}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={() => removeTimestampBookmark(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`Delete note at ${formatTime(item.timestampSecs)}`}
                hitSlop={12}
                className="ml-3"
              >
                <Ionicons name="trash-outline" size={20} color="#94A3B8" />
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
