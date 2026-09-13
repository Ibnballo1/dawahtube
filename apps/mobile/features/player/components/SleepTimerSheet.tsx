import { View, Text, Pressable } from "react-native";
import { usePlayer } from "../hooks/usePlayer";

const OPTIONS: Array<{ label: string; minutes: number | "end" }> = [
  { label: "15 minutes", minutes: 15 },
  { label: "30 minutes", minutes: 30 },
  { label: "45 minutes", minutes: 45 },
  { label: "60 minutes", minutes: 60 },
  { label: "End of lecture", minutes: "end" },
];

export function SleepTimerSheet({ onClose }: { onClose: () => void }) {
  const {
    sleepTimer,
    startSleepTimer,
    setSleepAtEndOfLecture,
    clearSleepTimer,
  } = usePlayer();

  return (
    <View className="bg-card rounded-t-2xl p-4">
      <Text className="text-text text-lg font-semibold mb-3">Sleep timer</Text>
      {OPTIONS.map((opt) => (
        <Pressable
          key={opt.label}
          accessibilityRole="button"
          accessibilityLabel={opt.label}
          onPress={() => {
            if (opt.minutes === "end") setSleepAtEndOfLecture();
            else startSleepTimer(opt.minutes);
            onClose();
          }}
          className="py-3"
        >
          <Text className="text-text">{opt.label}</Text>
        </Pressable>
      ))}
      {sleepTimer && (
        <Pressable
          onPress={() => {
            clearSleepTimer();
            onClose();
          }}
          accessibilityRole="button"
          accessibilityLabel="Cancel sleep timer"
          className="py-3"
        >
          <Text className="text-gold">Cancel timer</Text>
        </Pressable>
      )}
    </View>
  );
}
