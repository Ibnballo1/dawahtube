// features/player/components/MiniPlayer.tsx
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePlayer } from "../hooks/usePlayer";

const TAB_SCREENS = ["/", "/explore", "/downloads", "/history", "/profile"];

export function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    positionSecs,
    durationSecs,
    togglePlayPause,
  } = usePlayer();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  if (!currentTrack) return null;
  if (pathname === "/player") return null;

  const isOnTabScreen = TAB_SCREENS.includes(pathname);
  // Tab bar itself already sits above the safe-area inset — only add its
  // approximate height when a tab bar is actually on screen; otherwise just
  // clear the system nav/gesture area.
  const bottomOffset = insets.bottom + (isOnTabScreen ? 56 : 8);

  const progress = durationSecs > 0 ? positionSecs / durationSecs : 0;

  return (
    <Pressable
      onPress={() => router.push("/player")}
      accessibilityRole="button"
      accessibilityLabel={`Now playing: ${currentTrack.title}. Tap to open full player.`}
      style={{ position: "absolute", left: 8, right: 8, bottom: bottomOffset }}
      className="bg-card rounded-xl overflow-hidden"
    >
      <View
        className="h-0.5 bg-primary"
        style={{ width: `${progress * 100}%` }}
      />
      <View className="flex-row items-center p-2">
        <Image
          source={currentTrack.artworkUrl}
          style={{ width: 40, height: 40, borderRadius: 6 }}
        />
        <View className="flex-1 ml-3">
          <Text className="text-text" numberOfLines={1}>
            {currentTrack.title}
          </Text>
          {currentTrack.scholarName && (
            <Text className="text-muted text-xs" numberOfLines={1}>
              {currentTrack.scholarName}
            </Text>
          )}
        </View>
        <Pressable
          onPress={togglePlayPause}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? "Pause" : "Play"}
          hitSlop={12}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={24}
            color="#F8FAFC"
          />
        </Pressable>
      </View>
    </Pressable>
  );
}
