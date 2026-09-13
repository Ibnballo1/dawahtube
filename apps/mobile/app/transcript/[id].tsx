import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useLecture } from "@/features/lectures/queries/useLectures";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { TranscriptView } from "@/features/transcript/components/TranscriptView";
import { ErrorState } from "@/components/ui/ErrorState";

export default function TranscriptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isError, error, refetch } = useLecture(id);
  const { positionSecs, currentTrack, seekTo } = usePlayer();

  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return null;

  const isCurrentTrack = currentTrack?.lectureId === data.id;

  return (
    <View className="flex-1 bg-background pt-4">
      <TranscriptView
        raw={data.transcript}
        currentPositionSecs={isCurrentTrack ? positionSecs : -1}
        onSeek={(secs) => {
          if (isCurrentTrack) seekTo(secs);
          // If this lecture isn't currently loaded, seeking a transcript line
          // that isn't playing yet has nothing to act on — the Play button on
          // the lecture screen is the entry point for starting playback.
        }}
      />
    </View>
  );
}
