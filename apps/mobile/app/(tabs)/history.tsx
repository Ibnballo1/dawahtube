import { View, Text, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useHistoryStore } from "@/features/history/store/historyStore";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatTime } from "@/lib/format/time";

export default function HistoryScreen() {
  const entries = useHistoryStore((s) => s.entries);
  const clear = useHistoryStore((s) => s.clear);
  const sorted = Object.values(entries).sort(
    (a, b) =>
      new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime(),
  );

  return (
    <View className="flex-1 bg-background pt-4">
      <View className="flex-row items-center justify-between px-4 mb-3">
        <Text
          className="text-text text-xl font-semibold"
          accessibilityRole="header"
        >
          History
        </Text>
        {sorted.length > 0 && (
          <Pressable
            onPress={clear}
            accessibilityRole="button"
            accessibilityLabel="Clear history"
          >
            <Text className="text-gold">Clear</Text>
          </Pressable>
        )}
      </View>
      <FlashList
        data={sorted}
        // estimatedItemSize={72}
        keyExtractor={(e) => e.lectureId}
        ListEmptyComponent={<EmptyState message="Nothing played yet." />}
        renderItem={({ item }) => {
          const progress = item.durationSecs
            ? item.positionSecs / item.durationSecs
            : 0;
          return (
            <Pressable
              onPress={() => router.push(`/lecture/${item.lectureId}`)}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              className="flex-row items-center bg-card rounded-xl p-3 mb-3 mx-4"
            >
              <Image
                source={item.artworkUrl}
                style={{ width: 56, height: 56, borderRadius: 8 }}
              />
              <View className="flex-1 ml-3">
                <Text className="text-text" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-muted text-xs mt-1">
                  {item.completed
                    ? "Completed"
                    : `${formatTime(item.positionSecs)} of ${formatTime(item.durationSecs ?? 0)}`}
                </Text>
                {!item.completed && item.durationSecs ? (
                  <View className="h-1 bg-background rounded-full mt-1.5 overflow-hidden">
                    <View
                      className="h-1 bg-gold"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </View>
                ) : null}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
