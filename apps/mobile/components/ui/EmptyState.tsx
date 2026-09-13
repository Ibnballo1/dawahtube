import { View, Text } from "react-native";

export function EmptyState({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-6">
      <Text className="text-muted text-center">{message}</Text>
    </View>
  );
}
