import { View, Text, Pressable } from "react-native";
import { PLAYBACK_SPEEDS, type PlaybackSpeed } from "../types/player.types";

export function SpeedSelector({
  speed,
  onChange,
}: {
  speed: PlaybackSpeed;
  onChange: (s: PlaybackSpeed) => void;
}) {
  return (
    <View className="flex-row items-center justify-center gap-3 px-4">
      {PLAYBACK_SPEEDS.map((s) => {
        const isSelected = speed === s;

        return (
          <Pressable
            key={s}
            onPress={() => onChange(s)}
            accessibilityRole="button"
            accessibilityLabel={`${s}x speed`}
            accessibilityState={{ selected: isSelected }}
            className={`min-w-[52px] items-center justify-center rounded-xl px-4 py-2.5 ${
              isSelected ? "bg-gold" : "border border-border bg-card"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                isSelected ? "text-background" : "text-muted"
              }`}
            >
              {s}x
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
