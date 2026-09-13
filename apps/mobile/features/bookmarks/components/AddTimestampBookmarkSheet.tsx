import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useBookmarksStore } from "../store/bookmarksStore";
import { formatTime } from "@/lib/format/time";

interface Props {
  lectureId: string;
  lectureTitle: string;
  timestampSecs: number;
  onClose: () => void;
}

export function AddTimestampBookmarkSheet({
  lectureId,
  lectureTitle,
  timestampSecs,
  onClose,
}: Props) {
  const [note, setNote] = useState("");
  const addBookmark = useBookmarksStore((s) => s.addTimestampBookmark);

  return (
    <View className="bg-card rounded-t-2xl p-4">
      <Text className="text-text text-lg font-semibold mb-1">
        Bookmark at {formatTime(timestampSecs)}
      </Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Add a note (optional)"
        placeholderTextColor="#94A3B8"
        accessibilityLabel="Bookmark note"
        multiline
        className="bg-background text-text rounded-lg p-3 mt-3 min-h-[80px]"
      />
      <Pressable
        onPress={() => {
          addBookmark({
            id: `${lectureId}-${Date.now()}`,
            lectureId,
            lectureTitle,
            timestampSecs,
            note: note.trim() || null,
            createdAt: new Date().toISOString(),
          });
          onClose();
        }}
        accessibilityRole="button"
        accessibilityLabel="Save bookmark"
        className="bg-primary rounded-full py-3 items-center mt-4"
      >
        <Text className="text-text font-medium">Save bookmark</Text>
      </Pressable>
    </View>
  );
}
