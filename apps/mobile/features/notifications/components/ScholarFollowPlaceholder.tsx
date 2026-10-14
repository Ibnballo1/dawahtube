import { View, Text } from "react-native";

/**
 * Placeholder only — there's no follow relationship, scholar-follow table,
 * or push-notification backend in the current schema. This exists so the UI
 * has a home for the feature once that backend work is scoped, not to
 * suggest it's functional now.
 */
export function ScholarFollowPlaceholder() {
  return (
    <View className="bg-card rounded-xl p-4 opacity-50">
      <Text className="text-muted text-sm">
        Notify me about new lectures from this scholar (coming soon)
      </Text>
    </View>
  );
}
