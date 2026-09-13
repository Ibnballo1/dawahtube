// app/scholar/[slug].tsx
import { View, Text, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import {
  useScholar,
  useScholarLectures,
} from "@/features/scholars/queries/useScholars";
import { LectureCard } from "@/components/ui/LectureCard";
import { toCardData } from "@/features/lectures/types/lecture.types";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ScholarScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const scholar = useScholar(slug);
  const lectures = useScholarLectures(slug);

  if (scholar.isError)
    return <ErrorState error={scholar.error} onRetry={scholar.refetch} />;
  if (!scholar.data) return null;

  const lectureItems = lectures.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="items-center pt-8 pb-6">
        <Image
          source={scholar.data.avatar}
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: "#1E293B",
          }}
        />
        <Text
          className="text-text text-xl font-semibold mt-3"
          accessibilityRole="header"
        >
          {scholar.data.displayName}
        </Text>
        {/* Use the real, live count from the actual lecture list — not the
            backend's separate denormalized `lectureCount`, which is stale. */}
        <Text className="text-muted text-sm mt-1">
          {lectures.isLoading
            ? "…"
            : `${lectures.data?.pages[0]?.meta.total ?? 0} lecture${lectures.data?.pages[0]?.meta.total === 1 ? "" : "s"}`}
        </Text>
      </View>

      {lectures.isError ? (
        <ErrorState error={lectures.error} onRetry={lectures.refetch} />
      ) : lectureItems.length === 0 && !lectures.isLoading ? (
        <EmptyState message="No lectures from this scholar yet." />
      ) : (
        lectureItems.map((lecture) => (
          <LectureCard key={lecture.id} data={toCardData(lecture)} />
        ))
      )}
    </ScrollView>
  );
}
