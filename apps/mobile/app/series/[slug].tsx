import { ScrollView, View, Text, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSeriesDetail } from "@/features/series/queries/useSeries";
import { LectureCard } from "@/components/ui/LectureCard";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  episodeToCardData,
  episodeToLazyQueueTrack,
} from "@/features/series/types/series.types";
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

  const scholarName = data.scholar?.displayName ?? null;
  const sorted = [...data.episodes].sort((a, b) => a.position - b.position);
  const lastPlayedIndex = sorted.findIndex(
    (e) => (storage.getNumber(`position:${e.id}`) ?? 0) > 0,
  );
  const resumeIndex = lastPlayedIndex >= 0 ? lastPlayedIndex : 0;
  const buildQueue = () =>
    sorted.map((e) => episodeToLazyQueueTrack(e, scholarName, isConnected));

  return (
    <ScrollView className="flex-1 bg-background pt-8">
      <Text
        className="text-text text-xl font-semibold px-4"
        accessibilityRole="header"
      >
        {data.title}
      </Text>
      {scholarName && (
        <Text className="text-muted px-4 mt-1">{scholarName}</Text>
      )}
      <Text className="text-muted px-4 mt-1 mb-4">
        {data.episodeCount} episodes
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

      {sorted.map((episode) => (
        <View key={episode.id} className="flex-row items-center mx-4 mb-1">
          <Text className="text-muted w-6">{episode.position}</Text>
          <View className="flex-1">
            <LectureCard data={episodeToCardData(episode, scholarName)} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
