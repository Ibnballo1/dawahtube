import { ScrollView, View, Text, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSeriesDetail } from "@/features/series/queries/useSeries";
import { LectureCard } from "@/components/ui/LectureCard";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  toCardData,
  toLazyQueueTrack,
} from "@/features/lectures/types/lecture.types";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { useNetworkStatus } from "@/lib/network/useNetworkStatus";
import { storage } from "@/lib/storage/mmkv";

export default function SeriesScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data, isError, error, refetch } = useSeriesDetail(slug);
  const { play } = usePlayer();
  const { isConnected } = useNetworkStatus();

  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return null;

  const sorted = [...data.items].sort((a, b) => a.order - b.order);
  const lastPlayedIndex = sorted.findIndex(
    ({ lecture }) => (storage.getNumber(`position:${lecture.id}`) ?? 0) > 0,
  );
  const resumeIndex = lastPlayedIndex >= 0 ? lastPlayedIndex : 0;
  const buildQueue = () =>
    sorted.map(({ lecture }) => toLazyQueueTrack(lecture, isConnected));

  return (
    <ScrollView className="flex-1 bg-background pt-8">
      <Text
        className="text-text text-xl font-semibold px-4"
        accessibilityRole="header"
      >
        {data.title}
      </Text>
      {data.scholar && (
        <Text className="text-muted px-4 mt-1">{data.scholar.name}</Text>
      )}
      <Text className="text-muted px-4 mt-1 mb-4">
        {data.items.length} episodes
      </Text>

      <View className="flex-row gap-3 px-4 mb-4">
        <Pressable
          onPress={() => play(buildQueue(), 0)}
          accessibilityRole="button"
          accessibilityLabel="Play series from the beginning"
          className="bg-primary px-4 py-2 rounded-full"
        >
          <Text className="text-text">Play series</Text>
        </Pressable>
        {lastPlayedIndex > 0 && (
          <Pressable
            onPress={() => play(buildQueue(), resumeIndex)}
            accessibilityRole="button"
            accessibilityLabel="Resume series"
            className="bg-card px-4 py-2 rounded-full"
          >
            <Text className="text-text">Resume</Text>
          </Pressable>
        )}
      </View>

      {sorted.map(({ lecture, order }) => (
        <View key={lecture.id} className="flex-row items-center mx-4 mb-1">
          <Text className="text-muted w-6">{order}</Text>
          <View className="flex-1">
            <LectureCard data={toCardData(lecture)} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
