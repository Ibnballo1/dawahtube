import { remindersApi } from "@/lib/api/endpoints";
import { ScrollView, View, Text } from "react-native";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ReminderScreen() {
  const {
    data: reminder,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["reminders", "latest"] as const,
    queryFn: ({ signal }) => remindersApi.latest(signal),
  });
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (isLoading) return null;
  if (!reminder)
    return <EmptyState message="No reminder available right now." />;

  // remindersApi.daily() returns an array per the original endpoint contract —
  // showing the first (and typically only) entry, since "one reminder is
  // displayed at a time" per your schema's own comment.
  //   const reminder = data?.[0];
  //   if (!reminder) return <EmptyState message="No reminder available right now." />;

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text
        className="text-text text-xl font-semibold mt-4"
        accessibilityRole="header"
      >
        {reminder.title}
      </Text>
      {reminder.scholar && (
        <Text className="text-muted mt-1">{reminder.scholar.displayName}</Text>
      )}
      <Text className="text-text leading-6 mt-4">{reminder.content}</Text>
      {reminder.source && (
        <Text className="text-muted text-sm mt-4 italic">
          — {reminder.source}
        </Text>
      )}
    </ScrollView>
  );
}
