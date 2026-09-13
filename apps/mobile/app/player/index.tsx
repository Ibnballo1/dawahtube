import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { SpeedSelector } from "@/features/player/components/SpeedSelector";
import { SleepTimerSheet } from "@/features/player/components/SleepTimerSheet";

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function FullPlayerScreen() {
  const player = usePlayer();
  const [showSleepSheet, setShowSleepSheet] = useState(false);

  if (!player.currentTrack) {
    router.back();
    return null;
  }

  const remaining = player.durationSecs - player.positionSecs;

  return (
    <View className="flex-1 bg-background p-6 justify-between">
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Close player"
      >
        <Ionicons name="chevron-down" size={28} color="#F8FAFC" />
      </Pressable>

      <View className="items-center">
        <Image
          source={player.currentTrack.artworkUrl}
          style={{
            width: 280,
            height: 280,
            borderRadius: 16,
            backgroundColor: "#1E293B",
          }}
        />
        <Text
          className="text-text text-xl font-semibold mt-6 text-center"
          accessibilityRole="header"
        >
          {player.currentTrack.title}
        </Text>
        {player.currentTrack.scholarName && (
          <Text className="text-muted mt-1">
            {player.currentTrack.scholarName}
          </Text>
        )}
      </View>

      <View>
        <Slider
          value={player.positionSecs}
          minimumValue={0}
          maximumValue={player.durationSecs || 1}
          onSlidingComplete={player.seekTo}
          minimumTrackTintColor="#D4AF37"
          maximumTrackTintColor="#1E293B"
          accessibilityLabel="Seek"
        />
        <View className="flex-row justify-between">
          <Text className="text-muted text-xs">
            {formatTime(player.positionSecs)}
          </Text>
          <Text className="text-muted text-xs">
            -{formatTime(Math.max(0, remaining))}
          </Text>
        </View>

        <View className="flex-row items-center justify-center gap-8 mt-4">
          <Pressable
            onPress={player.previous}
            accessibilityRole="button"
            accessibilityLabel="Previous"
          >
            <Ionicons name="play-skip-back" size={28} color="#F8FAFC" />
          </Pressable>
          <Pressable
            onPress={() => player.seekBy(-15)}
            accessibilityRole="button"
            accessibilityLabel="Back 15 seconds"
          >
            <Ionicons name="play-back" size={28} color="#F8FAFC" />
          </Pressable>
          <Pressable
            onPress={player.togglePlayPause}
            accessibilityRole="button"
            accessibilityLabel={player.isPlaying ? "Pause" : "Play"}
            className="bg-primary rounded-full p-4"
          >
            <Ionicons
              name={player.isPlaying ? "pause" : "play"}
              size={32}
              color="#F8FAFC"
            />
          </Pressable>
          <Pressable
            onPress={() => player.seekBy(15)}
            accessibilityRole="button"
            accessibilityLabel="Forward 15 seconds"
          >
            <Ionicons name="play-forward" size={28} color="#F8FAFC" />
          </Pressable>
          <Pressable
            onPress={player.next}
            disabled={!player.hasNext}
            accessibilityRole="button"
            accessibilityLabel="Next"
          >
            <Ionicons
              name="play-skip-forward"
              size={28}
              color={player.hasNext ? "#F8FAFC" : "#475569"}
            />
          </Pressable>
        </View>

        <View className="mt-6">
          <SpeedSelector speed={player.speed} onChange={player.setSpeed} />
        </View>

        <View className="flex-row items-center gap-3 mt-6">
          <Ionicons name="volume-low" size={18} color="#94A3B8" />
          <Slider
            style={{ flex: 1 }}
            value={player.volume}
            minimumValue={0}
            maximumValue={1}
            onValueChange={player.setVolume}
            minimumTrackTintColor="#D4AF37"
            maximumTrackTintColor="#1E293B"
            accessibilityLabel="Volume"
          />
          <Ionicons name="volume-high" size={18} color="#94A3B8" />
        </View>

        <Pressable
          onPress={() => setShowSleepSheet(true)}
          accessibilityRole="button"
          accessibilityLabel="Sleep timer"
          className="items-center mt-6"
        >
          <Text className="text-muted">
            {player.sleepTimer
              ? `Sleep timer: ${player.sleepTimer}`
              : "Sleep timer"}
          </Text>
        </Pressable>
      </View>

      {showSleepSheet && (
        <SleepTimerSheet onClose={() => setShowSleepSheet(false)} />
      )}
    </View>
  );
}
