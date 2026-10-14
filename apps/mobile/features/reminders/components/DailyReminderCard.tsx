import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import type { FeaturedReminder } from "@/lib/api/types";

export function DailyReminderCard({
  reminder,
}: {
  reminder: FeaturedReminder;
}) {
  return (
    <Pressable
      onPress={() => router.push("/reminder")}
      accessibilityRole="button"
      accessibilityLabel={`Today's reminder: ${reminder.title}`}
      className="bg-card rounded-xl p-4 mx-4"
    >
      <Text className="text-gold text-xs font-medium mb-1">
        Today&apos;s Reminder
      </Text>
      <Text className="text-text font-semibold" numberOfLines={1}>
        {reminder.title}
      </Text>
      {reminder.scholar && (
        <Text className="text-muted text-xs mt-1">
          {reminder.scholar.displayName}
        </Text>
      )}
    </Pressable>
  );
}
