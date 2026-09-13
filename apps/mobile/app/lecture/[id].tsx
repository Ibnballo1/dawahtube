import {
  ScrollView,
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useLecture } from "@/features/lectures/queries/useLectures";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { useResumePrompt } from "@/features/player/hooks/usePlaybackPersistence";
import { ResumePrompt } from "@/features/player/components/ResumePrompt";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  toQueueTrack,
  toDownloadable,
} from "@/features/lectures/types/lecture.types";
import {
  resolveLectureSource,
  type SourceResolution,
} from "@/features/lectures/services/resolveLectureSource";
import { DownloadButton } from "@/features/downloads/components/DownloadButton";
import { useNetworkStatus } from "@/lib/network/useNetworkStatus";
import { router } from "expo-router";
import { BookmarkButton } from "@/features/bookmarks/components/BookmarkButton";
import { timestampBookmarksFor } from "@/features/bookmarks/store/bookmarksStore";
import { formatTime } from "@/lib/format/time";

export default function LectureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isError, error, refetch } = useLecture(id);
  const {
    play,
    seekTo,
    isPlaying,
    isBuffering,
    currentTrack,
    togglePlayPause,
  } = usePlayer();
  const { shouldPrompt, savedPosition, dismiss } = useResumePrompt(id ?? "");
  const { isConnected } = useNetworkStatus();
  const [resolved, setResolved] = useState<SourceResolution | null>(null);

  useEffect(() => {
    if (!data) return;
    resolveLectureSource(data, isConnected).then(setResolved);
  }, [data, isConnected]);

  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return null;

  const isCurrentTrack = currentTrack?.lectureId === data.id;
  const isPlayable = resolved?.kind === "local" || resolved?.kind === "remote";

  const handlePlay = async () => {
    if (isCurrentTrack) {
      togglePlayPause();
      return;
    }
    if (!resolved || !isPlayable) return;
    await play([toQueueTrack(data, resolved.url)], 0);
    dismiss();
  };

  const playLabel =
    resolved?.kind === "unavailable"
      ? resolved.reason === "offline"
        ? "Offline — download to listen"
        : resolved.reason === "no-audio"
          ? "Audio unavailable"
          : "Couldn't load audio"
      : isCurrentTrack && isBuffering
        ? "Loading…"
        : isCurrentTrack && isPlaying
          ? "Pause"
          : "Play";

  return (
    <ScrollView className="flex-1 bg-background">
      <Image
        source={data.thumbnail}
        style={{ width: "100%", height: 220, backgroundColor: "#1E293B" }}
        contentFit="cover"
      />
      <View className="p-4">
        {/* <View className="flex-row items-start justify-between">
          <Text
            className="text-text text-xl font-semibold flex-1"
            accessibilityRole="header"
          >
            {data.title}
          </Text>
          <DownloadButton
            lecture={toDownloadable(data)}
            sourceUrl={resolved?.kind === "remote" ? resolved.url : null}
          />
        </View> */}
        <View className="flex-row items-center gap-3">
          <BookmarkButton
            bookmark={{
              lectureId: data.id,
              title: data.title,
              scholarName: data.scholar?.displayName ?? null,
              artworkUrl: data.thumbnail,
              createdAt: new Date().toISOString(),
            }}
          />
          <DownloadButton
            lecture={toDownloadable(data)}
            sourceUrl={resolved?.kind === "remote" ? resolved.url : null}
          />
        </View>
        {data.scholar && (
          <Text className="text-muted mt-1">{data.scholar.displayName}</Text>
        )}

        {shouldPrompt && isPlayable && (
          <ResumePrompt
            savedPosition={savedPosition}
            onContinue={async () => {
              await handlePlay();
              seekTo(savedPosition);
            }}
            onStartOver={handlePlay}
          />
        )}

        <Pressable
          disabled={!isPlayable}
          onPress={handlePlay}
          accessibilityRole="button"
          accessibilityLabel={playLabel}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : isPlayable ? 1 : 0.5,
          })}
          className="bg-primary rounded-full py-3 items-center mt-4 flex-row justify-center"
        >
          {isCurrentTrack && isBuffering && (
            <ActivityIndicator color="#F8FAFC" style={{ marginRight: 8 }} />
          )}
          <Text className="text-text font-medium">{playLabel}</Text>
        </Pressable>

        {data.transcript && (
          <Pressable
            onPress={() => router.push(`/transcript/${data.id}`)}
            accessibilityRole="button"
            accessibilityLabel="View transcript"
            className="items-center mt-3"
          >
            <Text className="text-gold">View transcript</Text>
          </Pressable>
        )}

        {data.description && (
          <Text className="text-muted mt-4">{data.description}</Text>
        )}

        {timestampBookmarksFor(data.id).length > 0 && (
          <View className="mt-6">
            <Text className="text-text font-semibold mb-2">Your bookmarks</Text>
            {timestampBookmarksFor(data.id).map((b) => (
              <Pressable
                key={b.id}
                onPress={() => {
                  if (isCurrentTrack) seekTo(b.timestampSecs);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Jump to bookmark at ${formatTime(b.timestampSecs)}`}
                className="flex-row items-center bg-card rounded-lg p-3 mb-2"
              >
                <Text className="text-gold w-14">
                  {formatTime(b.timestampSecs)}
                </Text>
                <Text className="text-muted flex-1">{b.note ?? "No note"}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
