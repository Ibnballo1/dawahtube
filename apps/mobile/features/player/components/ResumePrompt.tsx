import { View, Text, Pressable } from "react-native";

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Props {
  savedPosition: number;
  onContinue: () => void;
  onStartOver: () => void;
}

export function ResumePrompt({
  savedPosition,
  onContinue,
  onStartOver,
}: Props) {
  return (
    <View className="bg-card rounded-xl p-4 mx-4 mb-4 flex-row items-center justify-between">
      <Text className="text-text flex-1">
        Continue from {formatTime(savedPosition)}?
      </Text>
      <Pressable
        onPress={onStartOver}
        accessibilityRole="button"
        accessibilityLabel="Start over"
        className="px-3 py-2"
      >
        <Text className="text-muted">Start over</Text>
      </Pressable>
      <Pressable
        onPress={onContinue}
        accessibilityRole="button"
        accessibilityLabel="Continue"
        className="bg-primary px-4 py-2 rounded-full"
      >
        <Text className="text-text">Continue</Text>
      </Pressable>
    </View>
  );
}
