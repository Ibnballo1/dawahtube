import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text
        className="text-text text-xl font-semibold"
        accessibilityRole="header"
      >
        Home
      </Text>
      <Text className="text-muted mt-2">
        Lecture discovery coming in Phase 3.
      </Text>
    </View>
  );
}
