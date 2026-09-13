import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

interface Props {
  title: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, onSeeAll }: Props) {
  return (
    <View className="flex-row items-center justify-between px-4 mb-3">
      <Text
        className="text-text text-lg font-semibold"
        accessibilityRole="header"
      >
        {title}
      </Text>
      {onSeeAll && (
        <Pressable
          onPress={onSeeAll}
          accessibilityRole="button"
          accessibilityLabel={`See all ${title}`}
        >
          <Text className="text-gold text-sm">See all</Text>
        </Pressable>
      )}
    </View>
  );
}
