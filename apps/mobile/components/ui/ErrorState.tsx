import { View, Text, Pressable } from "react-native";
import { ApiError } from "@/lib/api/errors";

export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const message =
    error instanceof ApiError && error.isOffline
      ? "You're offline. Check your connection and try again."
      : "Something went wrong loading this.";

  return (
    <View className="flex-1 items-center justify-center py-16 px-6">
      <Text className="text-muted text-center mb-4">{message}</Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry"
        className="bg-primary px-4 py-2 rounded-full"
      >
        <Text className="text-text">Retry</Text>
      </Pressable>
    </View>
  );
}
